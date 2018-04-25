mkdir bundle
REM call .\buildscripts\vs2017-x64-acquire.cmd
call .\buildscripts\vs2017-x64-compile.cmd
xcopy .\bin\release-vs2017x64\* .\bundle\ /S /Y
