param(
  [string]$BaseUrl = "http://takp.test",
  [string]$TaskName = "TAKP-AutoChecker",
  [int]$EveryMinutes = 1
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

if ($EveryMinutes -lt 1) {
  throw "EveryMinutes must be >= 1"
}

function Get-CronToken {
  if ($env:CRON_TOKEN) { return $env:CRON_TOKEN }
  $envPath = Join-Path (Get-Location) ".env"
  if (-not (Test-Path $envPath)) { return "" }
  $line = Get-Content $envPath | Where-Object { $_ -match '^\s*CRON_TOKEN\s*=' } | Select-Object -First 1
  if (-not $line) { return "" }
  $v = ($line -split "=",2)[1].Trim().Trim("'`"")
  return $v
}

$token = Get-CronToken
$tickUrl = "$($BaseUrl.TrimEnd('/'))/background_tick.php"
if ($token) {
  $tickUrl = "$tickUrl?token=$token"
}

$taskCmd = "cmd /c curl.exe -fsS `"$tickUrl`" >nul 2>nul"

schtasks /Create /TN $TaskName /SC MINUTE /MO $EveryMinutes /TR $taskCmd /F | Out-Null
schtasks /Run /TN $TaskName | Out-Null

Write-Host "Task created: $TaskName"
Write-Host "Interval: every $EveryMinutes minute(s)"
Write-Host "URL: $tickUrl"
Write-Host "Now open: $($BaseUrl.TrimEnd('/'))/background_data.php"
