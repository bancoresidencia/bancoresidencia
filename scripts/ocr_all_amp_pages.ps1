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

$langs = [Windows.Media.Ocr.OcrEngine]::AvailableRecognizerLanguages
$ptLang = $langs | ? { $_.LanguageTag -eq 'pt-BR' }
if (-not $ptLang) { $ptLang = $langs[0] }
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($ptLang)

$pages = Get-ChildItem "data/amp_2024_pages/page_*.jpg" | Sort-Object Name
$results = @()

Write-Output "Iniciando OCR nativo pt-BR em $($pages.Count) páginas..."
$sw = [System.Diagnostics.Stopwatch]::StartNew()

foreach ($p in $pages) {
    $pSw = [System.Diagnostics.Stopwatch]::StartNew()
    $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($p.FullName)
    $file = AwaitOperation $fileOp ([Windows.Storage.StorageFile])

    $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
    $stream = AwaitOperation $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

    $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
    $decoder = AwaitOperation $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

    $sbOp = $decoder.GetSoftwareBitmapAsync()
    $sb = AwaitOperation $sbOp ([Windows.Graphics.Imaging.SoftwareBitmap])

    $ocrOp = $engine.RecognizeAsync($sb)
    $ocrRes = AwaitOperation $ocrOp ([Windows.Media.Ocr.OcrResult])

    $pSw.Stop()
    Write-Output "OCR $($p.Name): $($ocrRes.Text.Length) caracteres em $($pSw.ElapsedMilliseconds)ms"

    $results += [PSCustomObject]@{
        page = $p.Name
        text = $ocrRes.Text
    }
}

$sw.Stop()
Write-Output "OCR concluído em $($sw.Elapsed.TotalSeconds)s. Salvando resultado..."

$results | ConvertTo-Json -Depth 5 | Out-File "data/amp_2024_pages/ocr_all_pages.json" -Encoding utf8
Write-Output "Salvo com sucesso em data/amp_2024_pages/ocr_all_pages.json"

