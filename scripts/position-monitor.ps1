Add-Type -TypeDefinition @"
using System;
using System.Runtime.InteropServices;
public class WinUtil {
    [DllImport("user32.dll")]
    public static extern bool MoveWindow(IntPtr hWnd, int X, int Y, int nWidth, int nHeight, bool bRepaint);
    [DllImport("user32.dll")]
    public static extern bool SetWindowPos(IntPtr hWnd, IntPtr hWndInsertAfter, int X, int Y, int cx, int cy, uint uFlags);
}
"@ -ErrorAction SilentlyContinue

Add-Type -AssemblyName System.Windows.Forms -ErrorAction SilentlyContinue

$screen = [System.Windows.Forms.Screen]::PrimaryScreen.WorkingArea
$procs = Get-Process -Name powershell -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowTitle -ne '' }

foreach ($p in $procs) {
    if ($p.MainWindowHandle -ne [System.IntPtr]::Zero) {
        $h = 220
        $y = $screen.Height - $h
        # HWND_TOPMOST = -1, SWP_SHOWWINDOW = 0x0040
        [WinUtil]::MoveWindow($p.MainWindowHandle, 0, $y, $screen.Width, $h, $true)
        [WinUtil]::SetWindowPos($p.MainWindowHandle, [System.IntPtr](-1), 0, $y, $screen.Width, $h, 0x0040)
        Write-Output "Janela $($p.Id) posicionada no rodapé da tela."
    }
}
