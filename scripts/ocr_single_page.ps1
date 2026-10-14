Add-Type -AssemblyName System.Runtime.WindowsRuntime

# Helper to await WinRT async operations in PowerShell
function Await($asyncOperation, [type]$asTaskGeneric) {
    $netTask = [System.WindowsRuntimeSystemExtensions].GetMethods() |
        Where-Object { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' } |
        Select-Object -First 1
    $task = $netTask.MakeGenericMethod($asTaskGeneric).Invoke($null, @($asyncOperation))
    $task.Wait(-1) | Out-Null
    return $task.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation.Diagnostics, ContentType = WindowsRuntime] | Out-Null

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()

$fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync((Resolve-Path "data/official_exams/SES_PE/pages_2024/page_02.png").Path)
$file = Await $fileOp ([Windows.Storage.StorageFile])

$streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
$stream = Await $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

$decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = Await $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

$bmpOp = $decoder.GetSoftwareBitmapAsync()
$softwareBmp = Await $bmpOp ([Windows.Graphics.Imaging.SoftwareBitmap])

$ocrOp = $engine.RecognizeAsync($softwareBmp)
$ocrResult = Await $ocrOp ([Windows.Media.Ocr.OcrResult])

Write-Output "=== OCR TEXT (PAGE 2) ==="
Write-Output $ocrResult.Text
