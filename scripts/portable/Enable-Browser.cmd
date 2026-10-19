@echo off
setlocal
set "ELECTRON_RUN_AS_NODE="
"%~dp0app\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" "%~dp0browser-enable.mjs" deploy "%~dp0." "%~dp0app\browser\extension"
if errorlevel 1 goto done
"%~dp0app\resources\runtime\primary-runtime\dependencies\node\bin\node.exe" "%~dp0browser-enable.mjs" enable "%~dp0."
:done
set "RESULT=%ERRORLEVEL%"
echo.
pause
exit /b %RESULT%
