@echo off
title The Fart Button - Brave Mode
cd /d "%~dp0"
set ELECTRON_RUN_AS_NODE=1
set FART_BROWSER=brave
"%~dp0node_modules\electron\dist\electron.exe" "%~dp0browser-server.js"
if errorlevel 1 pause
