Add-Type @'
  using System;
  using System.Runtime.InteropServices;
  public class Win32 {
    [DllImport("user32.dll")]
    [return: MarshalAs(UnmanagedType.Bool)]
    public static extern bool SetForegroundWindow(IntPtr hWnd);

    [DllImport("user32.dll")]
    public static extern bool ShowWindowAsync(IntPtr hWnd, int nCmdShow);

    [DllImport("user32.dll")]
    public static extern bool SwitchToThisWindow(IntPtr hWnd, bool fAltTab);
  }
'@

$procs = Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.MainWindowHandle -ne 0 }
if ($procs) {
  foreach ($p in $procs) {
    [Win32]::ShowWindowAsync($p.MainWindowHandle, 3) # SW_MAXIMIZE
    [Win32]::SetForegroundWindow($p.MainWindowHandle)
    [Win32]::SwitchToThisWindow($p.MainWindowHandle, $true)
    Write-Host "✅ Janela ativada e colocada em primeiro plano na tela! (PID: $($p.Id), Handle: $($p.MainWindowHandle))"
  }
} else {
  Write-Host "❌ Nenhuma janela encontrada com MainWindowHandle diferente de zero."
}
