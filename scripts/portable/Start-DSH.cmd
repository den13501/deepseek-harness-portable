@echo off
setlocal
set "ROOT=%~dp0"
if not exist "%ROOT%app\DeepSeek Harness.exe" (
  echo Extract the entire ZIP before starting DSH.
  pause
  exit /b 1
)
tasklist /FI "IMAGENAME eq DeepSeek Harness.exe" /NH 2>nul | find /I "DeepSeek Harness.exe" >nul
if not errorlevel 1 (
  echo Close all DeepSeek Harness windows first.
  pause
  exit /b 1
)
set "ELECTRON_RUN_AS_NODE="
set "DSH_OFFLINE_MODE=1"
set "DSH_TELEMETRY_MODE=DISABLED"
set "DSH_TELEMETRY_DISABLED=1"
set "DSH_HOME=%ROOT%data\home"
set "DSH_DESKTOP_USER_DATA_DIR=%ROOT%data\user-data"
if not exist "%DSH_HOME%" mkdir "%DSH_HOME%"
if not exist "%DSH_DESKTOP_USER_DATA_DIR%" mkdir "%DSH_DESKTOP_USER_DATA_DIR%"
if not exist "%ROOT%workspace" mkdir "%ROOT%workspace"
if not exist "%DSH_HOME%" exit /b 1
if not exist "%DSH_DESKTOP_USER_DATA_DIR%" exit /b 1
start "" /D "%ROOT%app" "%ROOT%app\DeepSeek Harness.exe" --user-data-dir="%DSH_DESKTOP_USER_DATA_DIR%"
endlocal