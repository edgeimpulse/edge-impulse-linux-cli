[CmdletBinding()]
param(
    [Parameter(Mandatory)]
    [ValidateSet('x64', 'arm64')]
    [string]$Arch,

    [Parameter(Mandatory)]
    [string]$NodeVersion
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

$repoRoot = Resolve-Path "$PSScriptRoot\.."
$stagingDir = Join-Path $PSScriptRoot "staging"
$outputDir = Join-Path $PSScriptRoot "output"

Write-Host "========================================================="
Write-Host " Staging Edge Impulse Linux CLI Windows installer"
Write-Host "   Arch       : $Arch"
Write-Host "   Node.js    : $NodeVersion"
Write-Host "   Staging dir: $stagingDir"
Write-Host "========================================================="

foreach ($dir in @($stagingDir, $outputDir,
                   "$stagingDir\bin",
                   "$stagingDir\build",
                   "$stagingDir\node_modules")) {
    if (-not (Test-Path $dir)) {
        New-Item -ItemType Directory -Path $dir | Out-Null
    }
}

$nodeZipName = "node-v${NodeVersion}-win-${Arch}.zip"
$nodeZipUrl = "https://nodejs.org/dist/v${NodeVersion}/${nodeZipName}"
$nodeZipPath = Join-Path $Env:TEMP $nodeZipName
$nodeExeDest = Join-Path $stagingDir "node.exe"

if (-not (Test-Path $nodeExeDest)) {
    Write-Host "`n--> Downloading $nodeZipUrl"
    Invoke-WebRequest -Uri $nodeZipUrl -OutFile $nodeZipPath -UseBasicParsing

    Write-Host "--> Extracting node.exe"
    $expandDir = Join-Path $Env:TEMP "node-expand-$Arch"
    Expand-Archive -Path $nodeZipPath -DestinationPath $expandDir -Force

    $extractedExe = Get-ChildItem -Path $expandDir -Filter "node.exe" -Recurse | Select-Object -First 1
    if (-not $extractedExe) {
        throw "node.exe not found in Node.js archive"
    }
    Copy-Item -Path $extractedExe.FullName -Destination $nodeExeDest -Force

    Remove-Item $nodeZipPath -Force -ErrorAction SilentlyContinue
    Remove-Item $expandDir -Recurse -Force -ErrorAction SilentlyContinue
}

Write-Host "`n--> Copying build/"
$buildSrc = Join-Path $repoRoot "build"
if (-not (Test-Path $buildSrc)) { throw "build/ not found. Run npm run build first." }
robocopy $buildSrc "$stagingDir\build" /E /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -gt 7) { throw "robocopy build failed with exit code $LASTEXITCODE" }

Write-Host "--> Copying node_modules/"
$nmSrc = Join-Path $repoRoot "node_modules"
if (-not (Test-Path $nmSrc)) { throw "node_modules/ not found. Run npm ci first." }
robocopy $nmSrc "$stagingDir\node_modules" /E /NFL /NDL /NJH /NJS | Out-Null
if ($LASTEXITCODE -gt 7) { throw "robocopy node_modules failed with exit code $LASTEXITCODE" }

Write-Host "`n--> Writing .cmd shims"
$binEntries = @{
    'edge-impulse-linux' = 'build\cli\linux\linux.js'
    'edge-impulse-linux-runner' = 'build\cli\linux\runner.js'
    'edge-impulse-camera-debug' = 'build\cli\linux\camera-debug.js'
}
foreach ($name in $binEntries.Keys) {
    $jsPath = $binEntries[$name]
    $cmdPath = Join-Path "$stagingDir\bin" "${name}.cmd"
    $content = @"
@echo off
"%~dp0..\node.exe" "%~dp0..\$jsPath" %*
"@
    Set-Content -Path $cmdPath -Value $content -Encoding ASCII
    Write-Host "   $name.cmd"
}

Write-Host "`n--> Copying LICENSE"
$licenseSrc = Join-Path $repoRoot "LICENSE.3-clause-bsd-clear"
if (Test-Path $licenseSrc) {
    Copy-Item -Path $licenseSrc -Destination "$stagingDir\LICENSE.txt" -Force
}
else {
    Set-Content -Path "$stagingDir\LICENSE.txt" -Value "BSD-3-Clause-Clear" -Encoding UTF8
}

Write-Host "--> Copying package.json"
$packageJsonSrc = Join-Path $repoRoot "package.json"
if (-not (Test-Path $packageJsonSrc)) { throw "package.json not found at $packageJsonSrc" }
Copy-Item -Path $packageJsonSrc -Destination "$stagingDir\package.json" -Force

Write-Host "`n========================================================="
Write-Host " Staging complete."
Write-Host " Files in $stagingDir :"
Get-ChildItem $stagingDir | Format-Table Name, Length -AutoSize
Write-Host "========================================================="

exit 0
