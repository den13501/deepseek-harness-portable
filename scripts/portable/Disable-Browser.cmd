@echo off
setlocal
set "ELECTRON_RUN_AS_NODE="
"%~dp0app\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" "%~dp0browser-enable.mjs" disable "%~dp0."
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%
