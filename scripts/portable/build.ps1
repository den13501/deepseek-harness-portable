[CmdletBinding()]
param()
$ErrorActionPreference = 'Stop'
$root = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$settings = Join-Path $root 'apps/desktop/.env.windows'
if (Test-Path -LiteralPath $settings) { throw 'Use a clean checkout without apps/desktop/.env.windows; refusing to overwrite settings.' }
Push-Location $root
try {
    [IO.File]::WriteAllText($settings, "DSH_DESKTOP_APP_ID=com.deepseek.harness`nDSH_DESKTOP_OFFLINE_BUILD=1`n")
    & pnpm --filter '@deepseek-ai/dsh-desktop' run package:win:x64:dir --unsigned
    if ($LASTEXITCODE -ne 0) { throw 'Desktop directory build failed.' }
    & node scripts/portable/package.mjs
    if ($LASTEXITCODE -ne 0) { throw 'Portable verification or packaging failed.' }
} finally {
    Remove-Item -LiteralPath $settings -ErrorAction SilentlyContinue
    Pop-Location
}