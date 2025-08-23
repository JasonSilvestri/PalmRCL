# tools/Validate-StaticWebAssets.ps1
[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)][string]$Wwwroot = "PalmRCL\wwwroot",
  [Parameter(Mandatory=$true)][string]$ProjectDir = "PalmRCL"
)

$illegal = '[:\*\?"<>|\x00-\x08\x0B\x0C\x0E-\x1F`"]'
$trailing = '[\s.]$'

Write-Host "=== Scan wwwroot filenames ==="
$root = Resolve-Path -LiteralPath $Wwwroot -ErrorAction Stop
$badFiles = Get-ChildItem -LiteralPath $root -Recurse -Force |
  Where-Object {
    $_.Name -match $illegal -or $_.Name -match $trailing
  } | Select-Object FullName, Name
$badDirs = Get-ChildItem -LiteralPath $root -Recurse -Directory -Force |
  Where-Object {
    $_.Name -match $illegal -or $_.Name -match $trailing
  } | Select-Object FullName, Name

if ($badFiles -or $badDirs) {
  Write-Warning "Found problem names under wwwroot"
  $badFiles | Format-Table -Auto
  $badDirs  | Format-Table -Auto
} else {
  Write-Host "No bad names in wwwroot."
}

Write-Host "=== Scan generated metadata in obj/** ==="
$proj = Resolve-Path -LiteralPath $ProjectDir -ErrorAction Stop
$meta = Get-ChildItem -LiteralPath $proj -Recurse -File -Force -Include *.json,*.xml |
  Where-Object { $_.FullName -match 'staticwebassets|webassets|StaticWebAssets' }

$hits = @()
foreach ($m in $meta) {
  $content = Get-Content -LiteralPath $m.FullName -Raw -Encoding UTF8
  if ($content -match $illegal -or $content -match $trailing) {
    $hits += [pscustomobject]@{ File = $m.FullName; Snippet = $matches[0] }
  }
}
if ($hits.Count -gt 0) {
  Write-Warning "Found illegal characters/trailing chars in generated metadata:"
  $hits | Format-Table -Auto
} else {
  Write-Host "No illegal characters found in staticwebassets metadata."
}

Write-Host "`nTip: If metadata is dirty, run: dotnet clean; rd /s /q $ProjectDir\obj; rd /s /q $ProjectDir\bin"
