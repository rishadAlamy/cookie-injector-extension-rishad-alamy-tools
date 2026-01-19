@echo off
title Cookie Injector Installer - Rishad Alamy Tools

echo.
echo ======================================
echo  Cookie Injector - Installer
echo  Built by Rishad Alamy Tools
echo ======================================
echo.

echo [1/3] Opening Chrome Extensions page...
start chrome://extensions/

echo.
echo [2/3] Steps to complete installation:
echo --------------------------------------
echo 1. Enable "Developer mode" (top-right)
echo 2. Click "Load unpacked"
echo 3. Select the "extension" folder
echo --------------------------------------
echo.

echo [3/3] Extension folder location:
echo %~dp0extension
echo.

pause
