# tools/verify-paths.ps1
[CmdletBinding()]
param(
  [string]$RepoRoot = "."
)

$repo = Resolve-Path -LiteralPath $RepoRoot -ErrorAction Stop

Write-Host "[INFO] Verifying docs paths under repo root: $repo"

# Canonical expected pattern
$expected = Join-Path $repo "PalmRCL\PalmRCL\wwwroot"

# Wrong patterns
$wrong1   = Join-Path $repo "PalmRCL\wwwroot"
$wrong2   = Join-Path $repo "PalmRCL\PalmRCL\PalmRCL"

$badPaths = @()

if (Test-Path $wrong1)   { $badPaths += $wrong1 }
if (Test-Path $wrong2)   { $badPaths += $wrong2 }

if ($badPaths.Count -gt 0) {
  Write-Error "Invalid docs path(s) detected:`n$($badPaths -join "`n")`nExpected only under: $expected"
  exit 1
}

Write-Host "[OK] Docs path layout is clean. Found expected root: $expected"
exit 0