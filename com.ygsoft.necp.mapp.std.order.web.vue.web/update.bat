echo off
@echo set %NPM_PATH%
@echo update node_modules...
xcopy %NPM_PATH%\vue_node_modules\*.* %~dp0  /s /e /c /y /h /r