@echo off
setlocal
set "ELECTRON_RUN_AS_NODE="
"%~dp0app\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" "%~dp0portable-update.mjs" restore %*
set "RESULT=%ERRORLEVEL%"
echo.
if defined DSH_PORTABLE_NO_PAUSE exit /b %RESULT%
pause
exit /b %RESULT%