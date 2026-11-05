param(
    [string]$TargetUrl = "https://www.medevo.com.br/"
)

Add-Type @"
using System;
using System.Runtime.InteropServices;

public class WinDesktopLauncher {
    [StructLayout(LayoutKind.Sequential, CharSet = CharSet.Unicode)]
    public struct STARTUPINFO {
        public int cb;
        public string lpReserved;
        public string lpDesktop;
        public string lpTitle;
        public int dwX;
        public int dwY;
        public int dwXSize;
        public int dwYSize;
        public int dwXCountChars;
        public int dwYCountChars;
        public int dwFillAttribute;
        public int dwFlags;
        public short wShowWindow;
        public short cbReserved2;
        public IntPtr lpReserved2;
        public IntPtr hStdInput;
        public IntPtr hStdOutput;
        public IntPtr hStdError;
    }

    [StructLayout(LayoutKind.Sequential)]
    public struct PROCESS_INFORMATION {
        public IntPtr hProcess;
        public IntPtr hThread;
        public int dwProcessId;
        public int dwThreadId;
    }

    [DllImport("kernel32.dll", SetLastError = true, CharSet = CharSet.Unicode)]
    public static extern bool CreateProcess(
        string lpApplicationName,
        string lpCommandLine,
        IntPtr lpProcessAttributes,
        IntPtr lpThreadAttributes,
        bool bInheritHandles,
        uint dwCreationFlags,
        IntPtr lpEnvironment,
        string lpCurrentDirectory,
        ref STARTUPINFO lpStartupInfo,
        out PROCESS_INFORMATION lpProcessInformation
    );

    [DllImport("user32.dll")]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindow(IntPtr hWnd, int nCmdShow);
}
"@

$si = New-Object WinDesktopLauncher+STARTUPINFO
$si.cb = [System.Runtime.InteropServices.Marshal]::SizeOf($si)
$si.lpDesktop = "WinSta0\default"
$si.dwFlags = 1 # STARTF_USESHOWWINDOW
$si.wShowWindow = 3 # SW_SHOWMAXIMIZED

$pi = New-Object WinDesktopLauncher+PROCESS_INFORMATION

$chromeExe = "C:\Users\cnath\AppData\Local\ms-playwright\chromium-1243\chrome-win64\chrome.exe"
if (-not (Test-Path $chromeExe)) {
    $chromeExe = "C:\Program Files\Google\Chrome\Application\chrome.exe"
}

$userDataDir = "C:\bancoresidencia\bancoresidencia\scripts\.chrome_test"
$cmdLine = "`"$chromeExe`" --user-data-dir=`"$userDataDir`" --new-window --start-maximized --no-first-run --no-default-browser-check `"$TargetUrl`""

Write-Output "🚀 Disparando Chromium em WinSta0\default..."
$res = [WinDesktopLauncher]::CreateProcess($chromeExe, $cmdLine, [IntPtr]::Zero, [IntPtr]::Zero, $false, 0, [IntPtr]::Zero, $null, [ref]$si, [ref]$pi)
$err = [System.Runtime.InteropServices.Marshal]::GetLastWin32Error()

Write-Output "Status CreateProcess: $res | PID: $($pi.dwProcessId) | ErrorCode: $err"

if ($res) {
    Start-Sleep -Seconds 2
    $p = Get-Process -Id $pi.dwProcessId -ErrorAction SilentlyContinue
    if ($p -and $p.MainWindowHandle -ne 0) {
        [WinDesktopLauncher]::ShowWindow($p.MainWindowHandle, 3) | Out-Null
        [WinDesktopLauncher]::SetForegroundWindow($p.MainWindowHandle) | Out-Null
        Write-Output "✅ Janela trazida com sucesso para o primeiro plano (Foreground)!"
    }
}
