param(
  [string]$TaskName = "TAKP-AutoChecker"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

schtasks /Delete /TN $TaskName /F | Out-Null
Write-Host "Task removed: $TaskName"
