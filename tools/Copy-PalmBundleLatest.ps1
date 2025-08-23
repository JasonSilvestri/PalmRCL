# tools/Copy-PalmBundleLatest.ps1
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$DocsRoot
)

$root = Resolve-Path -LiteralPath $DocsRoot -ErrorAction Stop

$bundlesDir = Join-Path -Path $root -ChildPath "out/bundles"
$sqlDir     = Join-Path -Path $root -ChildPath "out/sql"

if (-not (Test-Path -LiteralPath $bundlesDir)) { Write-Host "No out/bundles directory found under $root"; exit 0 }
if (-not (Test-Path -LiteralPath $sqlDir))     { Write-Host "No out/sql directory found under $root";     exit 0 }

function Get-Latest([string]$dir, [string]$filter) {
  Get-ChildItem -LiteralPath $dir -File -Filter $filter |
    Sort-Object -Property LastWriteTime -Descending |
    Select-Object -First 1
}

$latestBundle = Get-Latest -dir $bundlesDir -filter "*.bundle.json"
$latestSeed   = Get-Latest -dir $sqlDir -filter "*.seed.sql"

if ($latestBundle) {
  $destBundle = Join-Path -Path $root -ChildPath $latestBundle.Name
  if ($latestBundle.FullName -ieq $destBundle) {
    Write-Host "[skip] bundle source equals destination: $destBundle"
  } else {
    Copy-Item -LiteralPath $latestBundle.FullName -Destination $destBundle -Force
    Write-Host "[copied] $($latestBundle.Name) -> $root"
  }
} else {
  Write-Host "No bundle found in $bundlesDir"
}

if ($latestSeed) {
  $destSeed = Join-Path -Path $root -ChildPath $latestSeed.Name
  if ($latestSeed.FullName -ieq $destSeed) {
    Write-Host "[skip] seed source equals destination: $destSeed"
  } else {
    Copy-Item -LiteralPath $latestSeed.FullName -Destination $destSeed -Force
    Write-Host "[copied] $($latestSeed.Name) -> $root"
  }
} else {
  Write-Host "No seed found in $sqlDir"
}

Write-Host "Done."