@echo off
echo Starting Reverse Proxy...
cd /d "%~dp0"
start /MIN node.exe proxy.js
timeout /t 2 /nobreak >nul
netstat -ano | findstr ":80 " | findstr LISTENING
echo Proxy running.
