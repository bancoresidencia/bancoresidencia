Add-Type -AssemblyName System.Runtime.WindowsRuntime

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

$langs = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
$ptLang = $langs | ? { $_.LanguageTag -eq 'pt-BR' }
if (-not $ptLang) { $ptLang = $langs[0] }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($ptLang)

foreach ($p in 1..3) {
    $imgPath = (Resolve-Path "data/gb_p${p}_img1.png").Path
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($imgPath)
    $file = AwaitOperation $fileOp ([Windows.Storage.StorageFile])

    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = AwaitOperation $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = AwaitOperation $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

    $sbOp = $decoder.GetSoftwareBitmapAsync()
    $sb = AwaitOperation $sbOp ([Windows.Graphics.Imaging.SoftwareBitmap])

    $ocrOp = $engine.RecognizeAsync($sb)
    $ocrRes = AwaitOperation $ocrOp ([Windows.Media.Ocr.OcrResult])

    Write-Output "=================================================="
    Write-Output "OCR TABELA GABARITO PÁGINA $p"
    Write-Output "=================================================="
    Write-Output $ocrRes.Text
}
