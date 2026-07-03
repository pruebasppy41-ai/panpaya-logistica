# Wrapper: mnpm -> npm (gestor estandar del proyecto Pan Pa Ya)
$candidates = @(
  "$env:ProgramFiles\nodejs\npm.cmd",
  "$env:LOCALAPPDATA\Programs\node\npm.cmd"
) | Where-Object { Test-Path $_ }

if (-not $candidates.Count) {
  $fromPath = (Get-Command npm.cmd -ErrorAction SilentlyContinue)?.Source
  if ($fromPath) { $candidates = @($fromPath) }
}

if (-not $candidates.Count) {
  Write-Error "[mnpm] Node.js/npm no encontrado. Instala Node.js LTS desde https://nodejs.org"
  exit 1
}

$npmCmd = $candidates[0]
$nodeDir = Split-Path $npmCmd -Parent
if ($env:PATH -notlike "*$nodeDir*") {
  $env:PATH = "$nodeDir;$env:PATH"
}

& $npmCmd @args
