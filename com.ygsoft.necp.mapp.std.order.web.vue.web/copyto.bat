echo off
set cpath=D:\code\panguweb\com.ygsoft.ecp.core.web\webcontent\vuecode
xcopy %~dp0dist\*.* %cpath%\dist\ /s /e /c /y /h /r
xcopy %~dp0src\*.* %cpath%\src\ /s /e /c /y /h /r