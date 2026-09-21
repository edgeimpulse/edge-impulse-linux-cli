# Snapdragon Hardware Acceleration Detector for Windows ARM64
# This script detects Qualcomm Snapdragon devices and validates QNN (Qualcomm Neural Network) runtime support
# Output: JSON object with device info and QNN availability

param(
    [switch]$Json = $false
)

# Detect if running on ARM64 Windows
$isArm64 = (Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Architecture) -eq 12

if (-not $isArm64) {
    if ($Json) {
        Write-Output (ConvertTo-Json @{
            "device" = "x64"
            "isSnapdragon" = $false
            "hasQnn" = $false
            "message" = "Not an ARM64 device"
        })
    }
    else {
        Write-Output "Not an ARM64 device (current: $(Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Name))"
    }
    exit 0
}

# Detect Qualcomm Snappdragon device indicators
$deviceInfo = @{
    "device" = "arm64"
    "isSnapdragon" = $false
    "hasQnn" = $false
    "processorName" = ""
    "message" = ""
}

try {
    $processor = Get-WmiObject -Class Win32_Processor | Select-Object -ExpandProperty Name
    $deviceInfo.processorName = $processor
    
    # Check for Qualcomm Snapdragon indicators
    if ($processor -like "*Qualcomm*" -or $processor -like "*Snapdragon*") {
        $deviceInfo.isSnapdragon = $true
        $deviceInfo.message = "Qualcomm Snapdragon detected: $processor"
    }
}
catch {
    $deviceInfo.message = "Warning: Could not detect processor details (error: $_)"
}

# Check for QNN runtime library in WSL2 (if available)
# This would require WSL with Qualcomm AI Hub or Snapdragon SDK installed
$qnnPaths = @(
    "$env:USERPROFILE\.qnn\lib\libQnnTFLiteDelegate.so",
    "$env:ProgramFiles\Qualcomm\*\lib\*QNN*",
    "C:\Program Files\Qualcomm AI Hub\*\lib\*QNN*"
)

foreach ($path in $qnnPaths) {
    if (Test-Path $path) {
        $deviceInfo.hasQnn = $true
        $deviceInfo.message += " | QNN runtime detected at: $path"
        break
    }
}

# Check environment variables for Snapdragon SDK
if (Test-Path env:QUALCOMM_SDK_ROOT) {
    $deviceInfo.hasQnn = $true
    $deviceInfo.message += " | QUALCOMM_SDK_ROOT found"
}

if (Test-Path env:QNN_SDK_ROOT) {
    $deviceInfo.hasQnn = $true
    $deviceInfo.message += " | QNN_SDK_ROOT found"
}

# Output result
if ($Json) {
    Write-Output (ConvertTo-Json $deviceInfo -AsArray)
}
else {
    if ($deviceInfo.isSnapdragon) {
        Write-Output "✓ Snapdragon device detected: $($deviceInfo.processorName)"
        if ($deviceInfo.hasQnn) {
            Write-Output "✓ QNN runtime available - hardware acceleration enabled"
        }
        else {
            Write-Output "ℹ QNN runtime not detected - install Qualcomm AI Hub or Snapdragon SDK for acceleration"
        }
    }
    else {
        Write-Output "ℹ ARM64 device detected but not confirmed as Snapdragon"
        Write-Output "  Processor: $($deviceInfo.processorName)"
    }
}

exit 0
