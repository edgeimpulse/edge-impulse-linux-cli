; Edge Impulse Linux CLI – Windows Installer

Unicode true
SetCompressor /SOLID lzma

!ifndef PRODUCT_VERSION
  !define PRODUCT_VERSION "0.0.0"
!endif
!ifndef ARCH
  !define ARCH "x64"
!endif

!define PRODUCT_NAME      "Edge Impulse Linux CLI"
!define PRODUCT_PUBLISHER "EdgeImpulse Inc."
!define PRODUCT_URL       "https://edgeimpulse.com"
!define UNINSTALL_KEY     "Software\Microsoft\Windows\CurrentVersion\Uninstall\EdgeImpulseLinuxCLI"
!define STAGING_DIR       "staging"
!define OUTPUT_DIR        "output"
!define BRAND_HEADER_BMP  "branding\header.bmp"
!define BRAND_WELCOME_BMP "branding\welcome.bmp"

!include "MUI2.nsh"
!include "x64.nsh"
!include "WinMessages.nsh"
!include "FileFunc.nsh"

!define MUI_ABORTWARNING
!define MUI_HEADERIMAGE
!define MUI_HEADERIMAGE_RIGHT
!define MUI_HEADERIMAGE_BITMAP "${BRAND_HEADER_BMP}"
!define MUI_WELCOMEFINISHPAGE_BITMAP "${BRAND_WELCOME_BMP}"

!insertmacro MUI_PAGE_WELCOME
!insertmacro MUI_PAGE_LICENSE "${STAGING_DIR}\LICENSE.txt"
!insertmacro MUI_PAGE_DIRECTORY
!insertmacro MUI_PAGE_INSTFILES
!insertmacro MUI_PAGE_FINISH

!insertmacro MUI_UNPAGE_CONFIRM
!insertmacro MUI_UNPAGE_INSTFILES

!insertmacro MUI_LANGUAGE "English"

Name          "${PRODUCT_NAME} ${PRODUCT_VERSION}"
OutFile       "${OUTPUT_DIR}\edge-impulse-linux-cli-windows-${ARCH}-setup.exe"
InstallDir    "$PROGRAMFILES64\EdgeImpulse Linux CLI"
InstallDirRegKey HKLM "${UNINSTALL_KEY}" "InstallLocation"
RequestExecutionLevel admin
ShowInstDetails show
ShowUnInstDetails show

VIProductVersion "${PRODUCT_VERSION}.0"
VIAddVersionKey "ProductName"     "${PRODUCT_NAME}"
VIAddVersionKey "CompanyName"     "${PRODUCT_PUBLISHER}"
VIAddVersionKey "FileVersion"     "${PRODUCT_VERSION}"
VIAddVersionKey "ProductVersion"  "${PRODUCT_VERSION}"
VIAddVersionKey "FileDescription" "${PRODUCT_NAME} Installer"

Section "Edge Impulse Linux CLI (required)" SecMain
  SectionIn RO

  SetOutPath "$INSTDIR"
  File "${STAGING_DIR}\node.exe"
  File "${STAGING_DIR}\LICENSE.txt"
  File "${STAGING_DIR}\package.json"
  File /r "${STAGING_DIR}\build"
  File /r "${STAGING_DIR}\node_modules"

  SetOutPath "$INSTDIR\bin"
  File "${STAGING_DIR}\bin\edge-impulse-linux.cmd"
  File "${STAGING_DIR}\bin\edge-impulse-linux-runner.cmd"
  File "${STAGING_DIR}\bin\edge-impulse-camera-debug.cmd"

  FileOpen  $R0 "$TEMP\_ei_addpath.ps1" w
  FileWrite $R0 "$$binDir = '$INSTDIR\bin'$\r$\n"
  FileWrite $R0 "$$key = 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment'$\r$\n"
  FileWrite $R0 "$$cur = (Get-ItemProperty -Path $$key -Name Path).Path$\r$\n"
  FileWrite $R0 "$$parts = $$cur -split ';' | Where-Object { $$_ -ne '' }$\r$\n"
  FileWrite $R0 "if ($$parts -notcontains $$binDir) {$\r$\n"
  FileWrite $R0 "    Set-ItemProperty -Path $$key -Name Path -Value (($$parts + $$binDir) -join ';')$\r$\n"
  FileWrite $R0 "}$\r$\n"
  FileClose $R0

  nsExec::ExecToLog "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File $\"$TEMP\_ei_addpath.ps1$\""
  Pop $R1
  Delete "$TEMP\_ei_addpath.ps1"

  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000

  WriteRegStr   HKLM "${UNINSTALL_KEY}" "DisplayName"     "${PRODUCT_NAME}"
  WriteRegStr   HKLM "${UNINSTALL_KEY}" "DisplayVersion"  "${PRODUCT_VERSION}"
  WriteRegStr   HKLM "${UNINSTALL_KEY}" "Publisher"       "${PRODUCT_PUBLISHER}"
  WriteRegStr   HKLM "${UNINSTALL_KEY}" "URLInfoAbout"    "${PRODUCT_URL}"
  WriteRegStr   HKLM "${UNINSTALL_KEY}" "InstallLocation" "$INSTDIR"
  WriteRegStr   HKLM "${UNINSTALL_KEY}" "UninstallString" '"$INSTDIR\uninstall.exe"'
  WriteRegDWORD HKLM "${UNINSTALL_KEY}" "NoModify"        1
  WriteRegDWORD HKLM "${UNINSTALL_KEY}" "NoRepair"        1

  ${GetSize} "$INSTDIR" "/S=0K" $0 $1 $2
  IntFmt $0 "0x%08X" $0
  WriteRegDWORD HKLM "${UNINSTALL_KEY}" "EstimatedSize" "$0"

  WriteUninstaller "$INSTDIR\uninstall.exe"
SectionEnd

Section "Uninstall"
  FileOpen  $R0 "$TEMP\_ei_rmpath.ps1" w
  FileWrite $R0 "$$binDir = '$INSTDIR\bin'$\r$\n"
  FileWrite $R0 "$$key = 'HKLM:\SYSTEM\CurrentControlSet\Control\Session Manager\Environment'$\r$\n"
  FileWrite $R0 "$$cur = (Get-ItemProperty -Path $$key -Name Path).Path$\r$\n"
  FileWrite $R0 "$$parts = $$cur -split ';' | Where-Object { $$_ -ne '' -and $$_ -ne $$binDir }$\r$\n"
  FileWrite $R0 "Set-ItemProperty -Path $$key -Name Path -Value ($$parts -join ';')$\r$\n"
  FileClose $R0

  nsExec::ExecToLog "powershell.exe -NoLogo -NoProfile -ExecutionPolicy Bypass -File $\"$TEMP\_ei_rmpath.ps1$\""
  Pop $R1
  Delete "$TEMP\_ei_rmpath.ps1"

  SendMessage ${HWND_BROADCAST} ${WM_WININICHANGE} 0 "STR:Environment" /TIMEOUT=5000

  RMDir /r "$INSTDIR\build"
  RMDir /r "$INSTDIR\node_modules"
  RMDir /r "$INSTDIR\bin"
  Delete "$INSTDIR\node.exe"
  Delete "$INSTDIR\LICENSE.txt"
  Delete "$INSTDIR\package.json"
  Delete "$INSTDIR\uninstall.exe"
  RMDir "$INSTDIR"

  DeleteRegKey HKLM "${UNINSTALL_KEY}"
SectionEnd
