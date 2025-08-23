<# 
.SYNOPSIS
  Create and push a "baseline" Git tag safely with clean console output.

.DESCRIPTION
  - Verifies repo and remote are available
  - Checks if the tag exists locally/remotely
  - Creates an *annotated* tag with a message
  - Pushes tag to the specified remote (default: origin)
  - Returns non-zero on failure

.PARAMETER Tag
  Tag name to create (default: v1.3-baseline)

.PARAMETER Remote
  Remote name to push to (default: origin)

.PARAMETER Message
  Annotation message for the tag. Defaults to an auto-generated message with timestamp.

.PARAMETER Force
  If set, will delete existing local tag and recreate (will also push with --force-with-lease).

.EXAMPLE
  pwsh -File tools/tag-baseline.ps1
  pwsh -File tools/tag-baseline.ps1 -Tag v1.3-baseline
  pwsh -File tools/tag-baseline.ps1 -Tag v1.3-baseline -Force
#>

[CmdletBinding()]
param(
  [string]$Tag = "v1.3-baseline",
  [string]$Remote = "origin",
  [string]$Message,
  [switch]$Force
)

function Fail($msg) { Write-Error $msg; exit 1 }
function Info($msg) { Write-Host "[INFO] $msg" }
function Warn($msg) { Write-Warning $msg }

# Ensure we're in a git repo
git rev-parse --is-inside-work-tree *> $null 2>&1
if ($LASTEXITCODE -ne 0) { Fail "Not inside a Git repository. cd to repo root and retry." }

# Confirm remote exists
$remotes = git remote
if (-not ($remotes -split "\r?\n" | ForEach-Object { $_.Trim() } | Where-Object { $_ -eq $Remote })) {
  Fail "Remote '$Remote' not found. Available: $remotes"
}

# Compose default message if needed
if (-not $Message) {
  $ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss K"
  $Message = "Baseline snapshot ($Tag) created on $ts"
}

Info "Verifying remote tag existence on '$Remote' for '$Tag'..."
$remoteTags = git ls-remote --tags $Remote 2>$null
$existsRemote = $false
if ($LASTEXITCODE -eq 0 -and $remoteTags) {
  $existsRemote = $remoteTags -match "refs/tags/$([Regex]::Escape($Tag))$"
}

if ($existsRemote -and -not $Force) {
  Fail "Tag '$Tag' already exists on remote '$Remote'. Use -Force to overwrite (dangerous)."
}

# Local existence
$existsLocal = $false
$localTags = git tag --list $Tag
if ($localTags -and ($localTags.Trim() -eq $Tag)) { $existsLocal = $true }

if ($existsLocal -and $Force) {
  Warn "Local tag '$Tag' exists. Removing due to -Force..."
  git tag -d $Tag | Out-Null
  if ($LASTEXITCODE -ne 0) { Fail "Failed to delete local tag '$Tag'." }
  $existsLocal = $false
}

if (-not $existsLocal) {
  Info "Creating annotated tag '$Tag'..."
  git tag -a $Tag -m $Message
  if ($LASTEXITCODE -ne 0) { Fail "Failed to create annotated tag '$Tag'." }
} else {
  Info "Local tag '$Tag' already exists; skipping create."
}

# Push
if ($Force) {
  Warn "Force-pushing tag '$Tag' to '$Remote' (using --force-with-lease)..."
  git push --force-with-lease $Remote $Tag
} else {
  Info "Pushing tag '$Tag' to '$Remote'..."
  git push $Remote $Tag
}
if ($LASTEXITCODE -ne 0) { Fail "Failed to push tag '$Tag' to '$Remote'." }

# Verify
Info "Verifying tag on remote..."
$verify = git ls-remote --tags $Remote 2>$null
if ($LASTEXITCODE -ne 0 -or -not ($verify -match "refs/tags/$([Regex]::Escape($Tag))$")) {
  Fail "Remote verification failed. Tag '$Tag' not visible on '$Remote'."
}

Write-Host ""
Write-Host "✅ Baseline tag '$Tag' is now on '$Remote'." -ForegroundColor Green
Write-Host "   View it on GitHub: $Remote (e.g., origin -> your GitHub remote)"
exit 0