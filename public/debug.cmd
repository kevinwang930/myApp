@REM @ECHO off
GOTO start
:find_dp0
SET dp0=%~dp0
EXIT /b
:start
SETLOCAL
CALL :find_dp0


SET "_prog=node"
SET PATHEXT=%PATHEXT:;.JS;=;%


 
@REM conda activate electron 
endLocal & conda activate electron && title %COMSPEC% & "%_prog%"  "%dp0%\..\node_modules\electron\cli.js" %*


