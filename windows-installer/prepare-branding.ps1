[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$sourceImage = Join-Path $repoRoot "img\edge-impulse-logo.png"
# Fall back to the monorepo logo if running from within the edgeimpulse monorepo checkout
if (-not (Test-Path $sourceImage)) {
    $sourceImage = Join-Path $repoRoot "studio\public\themes\default\png\logo.png"
}
$brandingDir = Join-Path $PSScriptRoot "branding"
$headerBmp = Join-Path $brandingDir "header.bmp"
$welcomeBmp = Join-Path $brandingDir "welcome.bmp"

if (-not (Test-Path $sourceImage)) {
    throw "Branding source image not found: $sourceImage"
}

New-Item -ItemType Directory -Force -Path $brandingDir | Out-Null

$magick = Get-Command magick -ErrorAction SilentlyContinue
if (-not $magick) {
    throw "ImageMagick (magick) is required to generate NSIS branding bitmaps"
}

Write-Host "Generating NSIS branding bitmaps from $sourceImage"

# NSIS header image: 150x57
& $magick.Source "$sourceImage" `
    -background white -gravity center `
    -resize 150x57 `
    -extent 150x57 `
    BMP3:"$headerBmp"

# NSIS welcome/finish side image: 164x314
& $magick.Source "$sourceImage" `
    -background white -gravity center `
    -resize 164x314 `
    -extent 164x314 `
    BMP3:"$welcomeBmp"

if (-not (Test-Path $headerBmp) -or -not (Test-Path $welcomeBmp)) {
    throw "Failed to generate branding assets"
}

Write-Host "Branding assets generated:"
Get-ChildItem $brandingDir | Format-Table Name, Length -AutoSize
