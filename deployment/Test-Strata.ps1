[CmdletBinding()]
param(
  [ValidatePattern('^https?://')]
  [string]$BaseUrl = 'http://127.0.0.1:8080/v1',

  [Parameter(Mandatory)]
  [ValidateNotNullOrEmpty()]
  [string]$ExpectedModel,

  [int]$TimeoutSec = 15,

  [switch]$ProbeChat,

  [switch]$ProbeTools
)

$ErrorActionPreference = 'Stop'

function Invoke-StrataGet {
  param([Parameter(Mandatory)][string]$Path)

  Invoke-RestMethod -Method Get -Uri "$script:NormalizedBaseUrl$Path" -TimeoutSec $TimeoutSec
}

function Invoke-StrataPost {
  param(
    [Parameter(Mandatory)][string]$Path,
    [Parameter(Mandatory)][hashtable]$Body
  )

  Invoke-RestMethod -Method Post -Uri "$script:NormalizedBaseUrl$Path" -ContentType 'application/json' `
    -Body ($Body | ConvertTo-Json -Depth 12) -TimeoutSec $TimeoutSec
}

$script:NormalizedBaseUrl = $BaseUrl.TrimEnd('/')
$result = [ordered]@{
  baseUrl = $script:NormalizedBaseUrl
  expectedModel = $ExpectedModel
  checkedAt = (Get-Date).ToUniversalTime().ToString('o')
  modelsEndpoint = $null
  propsEndpoint = $null
  selectedModel = $null
  chatProbe = $null
  toolProbe = $null
}

try {
  $models = Invoke-StrataGet -Path '/models'
  $modelRows = @($models.data)
  $modelIds = @($modelRows | ForEach-Object { $_.id } | Where-Object { $_ -is [string] })
  $result.modelsEndpoint = [ordered]@{
    reachable = $true
    modelIds = $modelIds
    count = $modelIds.Count
  }

  if ($modelIds -notcontains $ExpectedModel) {
    throw "Expected model '$ExpectedModel' was not returned by $script:NormalizedBaseUrl/models. Returned: $($modelIds -join ', ')"
  }
  $result.selectedModel = $ExpectedModel
} catch {
  $result.modelsEndpoint = [ordered]@{
    reachable = $false
    error = $_.Exception.Message
  }
  $result | ConvertTo-Json -Depth 12
  exit 1
}

try {
  $props = Invoke-StrataGet -Path '/props'
  $result.propsEndpoint = [ordered]@{
    reachable = $true
    response = $props
  }
} catch {
  # /props is a Strata extension, not an OpenAI compatibility requirement.
  $result.propsEndpoint = [ordered]@{
    reachable = $false
    error = $_.Exception.Message
  }
}

if ($ProbeChat -or $ProbeTools) {
  try {
    $chat = Invoke-StrataPost -Path '/chat/completions' -Body @{
      model = $ExpectedModel
      stream = $false
      temperature = 0
      max_tokens = 32
      messages = @(@{ role = 'user'; content = 'Reply with exactly: STRATA_OK' })
    }
    $result.chatProbe = [ordered]@{
      succeeded = $true
      responseModel = $chat.model
      finishReason = $chat.choices[0].finish_reason
      content = $chat.choices[0].message.content
    }
  } catch {
    $result.chatProbe = [ordered]@{ succeeded = $false; error = $_.Exception.Message }
  }
}

if ($ProbeTools) {
  try {
    $toolResponse = Invoke-StrataPost -Path '/chat/completions' -Body @{
      model = $ExpectedModel
      stream = $false
      temperature = 0
      max_tokens = 96
      messages = @(@{ role = 'user'; content = 'Use the echo tool with text STRATA_TOOL_OK.' })
      tools = @(@{
        type = 'function'
        function = @{
          name = 'echo'
          description = 'Return the text supplied by the user.'
          parameters = @{
            type = 'object'
            additionalProperties = $false
            properties = @{ text = @{ type = 'string' } }
            required = @('text')
          }
        }
      })
      tool_choice = 'auto'
    }
    $toolCalls = @($toolResponse.choices[0].message.tool_calls)
    $result.toolProbe = [ordered]@{
      succeeded = $toolCalls.Count -gt 0
      finishReason = $toolResponse.choices[0].finish_reason
      toolCalls = $toolCalls
    }
  } catch {
    $result.toolProbe = [ordered]@{ succeeded = $false; error = $_.Exception.Message }
  }
}

$result | ConvertTo-Json -Depth 12

if (($result.chatProbe -and -not $result.chatProbe.succeeded) -or ($result.toolProbe -and -not $result.toolProbe.succeeded)) {
  exit 1
}