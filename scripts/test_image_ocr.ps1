Add-Type -AssemblyName System.Runtime.WindowsRuntime
Add-Type -AssemblyName System.IO

$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { 
    $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' 
}

function AwaitOperation($WinRtOp, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtOp))
    $netTask.Wait(-1) | Out-Null
    return $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

$imgPath = (Resolve-Path "data/amp_2024_pages/page_02.jpg").Path
$fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($imgPath)
$file = AwaitOperation $fileOp ([Windows.Storage.StorageFile])

$streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
$stream = AwaitOperation $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

$decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = AwaitOperation $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

$sbOp = $decoder.GetSoftwareBitmapAsync()
$sb = AwaitOperation $sbOp ([Windows.Graphics.Imaging.SoftwareBitmap])

$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromUserProfileLanguages()
if (-not $engine) {
    # Fallback to available languages
    $langs = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($langs[0])
}

$ocrOp = $engine.RecognizeAsync($sb)
$res = AwaitOperation $ocrOp ([Windows.Media.Ocr.OcrResult])

Write-Output "--- OCR PÁGINA 2 ---"
Write-Output $res.Text

