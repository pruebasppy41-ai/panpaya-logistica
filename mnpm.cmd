@echo off
REM Wrapper: mnpm -> npm (gestor estandar del proyecto Pan Pa Ya)
set "NPM_CMD="

if exist "%ProgramFiles%\nodejs\npm.cmd" (
  set "NPM_CMD=%ProgramFiles%\nodejs\npm.cmd"
  set "PATH=%ProgramFiles%\nodejs;%PATH%"
  goto :run
)

if exist "%LocalAppData%\Programs\node\npm.cmd" (
  set "NPM_CMD=%LocalAppData%\Programs\node\npm.cmd"
  set "PATH=%LocalAppData%\Programs\node;%PATH%"
  goto :run
)

where npm.cmd >nul 2>&1
if %ERRORLEVEL% equ 0 (
  for /f "delims=" %%i in ('where npm.cmd') do (
    set "NPM_CMD=%%i"
    goto :run
  )
)

echo [mnpm] Error: Node.js/npm no encontrado.
echo [mnpm] Instala Node.js LTS: https://nodejs.org
echo [mnpm] Luego cierra y abre la terminal.
exit /b 1

:run
call "%NPM_CMD%" %*
