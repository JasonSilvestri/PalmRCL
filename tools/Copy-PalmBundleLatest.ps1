# tools/Copy-PalmBundleLatest.ps1
<# 
Copies the latest bundle + seed SQL into the canonical docs root (VS layout).
Works regardless of current directory. Supports sources in either:
  - <DocsRoot>\out\bundles\*.bundle.json and <DocsRoot>\out\sql\*.seed.sql
  - OR directly in <DocsRoot>\*.bundle.json / *.seed.sql (fallback)

Usage (from repo root or anywhere):
  powershell -ExecutionPolicy Bypass -File tools/Copy-PalmBundleLatest.ps1 -DocsRoot PalmRCL/PalmRCL/wwwroot/docs/palms
#>

[CmdletBinding()]
param(
  [Parameter(Mandatory=$true)]
  [string]$DocsRoot
)

function Fail($m){ Write-Error $m; exit 1 }
function Info($m){ Write-Host "[INFO] $m" }
function Ok($m){ Write-Host $m -ForegroundColor Green }

# Resolve repo root from this script's location (tools\ -> repo root)
$scriptDir = Split-Path -Parent $PSCommandPath
$repoRoot  = Split-Path -Parent $scriptDir

# Resolve the target docs root anchored at repo root (cwd-independent)
$targetAbs = Join-Path $repoRoot $DocsRoot
$targetRoot = Resolve-Path -LiteralPath $targetAbs -ErrorAction SilentlyContinue
if (-not $targetRoot) {
  New-Item -ItemType Directory -Force -Path $targetAbs | Out-Null
  $targetRoot = Resolve-Path -LiteralPath $targetAbs
}

# Guard: insist on the VS layout path (…\PalmRCL\PalmRCL\wwwroot\…)
$norm = $targetRoot.Path -replace '/', '\'
if ($norm -notmatch '\\PalmRCL\\PalmRCL\\wwwroot\\') {
  Fail "Refusing to copy into non-VS docs path: $($targetRoot.Path). Expected a path containing '\PalmRCL\PalmRCL\wwwroot\'."
}

# Primary sources (out/), with fallback to docs root
$bundlesDir = Join-Path $targetRoot.Path 'out\bundles'
$sqlDir     = Join-Path $targetRoot.Path 'out\sql'

$bundleCandidates = @()
$sqlCandidates    = @()

if (Test-Path -LiteralPath $bundlesDir) {
  $bundleCandidates += Get-ChildItem -LiteralPath $bundlesDir -Filter '*.bundle.json' -File
}
# fallback: allow bundles sitting directly in docs root
$bundleCandidates += Get-ChildItem -LiteralPath $targetRoot.Path -Filter '*.bundle.json' -File -ErrorAction SilentlyContinue

if (Test-Path -LiteralPath $sqlDir) {
  $sqlCandidates += Get-ChildItem -LiteralPath $sqlDir -Filter '*.seed.sql' -File
}
# fallback: allow seed sql directly in docs root
$sqlCandidates += Get-ChildItem -LiteralPath $targetRoot.Path -Filter '*.seed.sql' -File -ErrorAction SilentlyContinue

function Pick-Latest($items){ $items | Sort-Object LastWriteTimeUtc -Descending | Select-Object -First 1 }

$latestBundle = Pick-Latest $bundleCandidates
$latestSeed   = Pick-Latest $sqlCandidates

if (-not $latestBundle -and -not $latestSeed) {
  Write-Host "[INFO] No *.bundle.json or *.seed.sql found under '$($targetRoot.Path)' (or its out/ folders)."
  exit 0
}

Info "Copying latest artifacts to $($targetRoot.Path)..."
if ($latestBundle) {
  $dest = Join-Path $targetRoot.Path $latestBundle.Name
  if ($latestBundle.FullName -ieq $dest) { Write-Host "[skip] $($latestBundle.Name) already at destination" }
  else { Copy-Item -LiteralPath $latestBundle.FullName -Destination $dest -Force; Write-Host "[copied] $($latestBundle.Name) -> $($targetRoot.Path)" }
}
if ($latestSeed)   {
  $dest = Join-Path $targetRoot.Path $latestSeed.Name
  if ($latestSeed.FullName -ieq $dest)   { Write-Host "[skip] $($latestSeed.Name) already at destination" }
  else { Copy-Item -LiteralPath $latestSeed.FullName   -Destination $dest -Force; Write-Host "[copied] $($latestSeed.Name)   -> $($targetRoot.Path)" }
}

Ok "Done."