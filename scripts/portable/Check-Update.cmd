@echo off
setlocal
set "ELECTRON_RUN_AS_NODE="
"%~dp0app\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" "%~dp0portable-update.mjs" check %*
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%