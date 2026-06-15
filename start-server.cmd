@echo off
cd /d "C:\Users\User\OneDrive\Documents\Projects\Rallys Equities Copy"
if "%ADMIN_TOKEN%"=="" set ADMIN_TOKEN=rallys-dev-admin
node server.js
