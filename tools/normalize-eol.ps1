# tools/normalize-eol.ps1
[CmdletBinding()]
param(
    [Parameter(Mandatory=$true)]
    [string]$Root
)
if ($env:OS -notlike "*Windows*") {
    Write-Host "normalize-eol.ps1: Skipping (non-Windows environment detected)"
    exit 0
}
$ResolvedRoot = Resolve-Path -LiteralPath $Root -ErrorAction Stop
$textExts = @(".md",".json",".yml",".yaml",".ts",".tsx",".js",".mjs",".cjs",".css",".scss",".sass",".html",".htm",".cs",".csproj",".sln",".props",".targets",".ps1",".psm1",".psd1",".cmd",".bat",".sh",".xml",".txt",".csv")
$utf8NoBom = [System.Text.UTF8Encoding]::new($false)
$files = Get-ChildItem -LiteralPath $ResolvedRoot -Recurse -File | Where-Object { $textExts -contains $_.Extension.ToLowerInvariant() }
foreach ($f in $files) {
    $raw = Get-Content -LiteralPath $f.FullName -Raw -Encoding UTF8
    $norm = $raw -replace "(\r?\n)", "`r`n"
    [System.IO.File]::WriteAllText($f.FullName, $norm, $utf8NoBom)
}
