Add-Type -AssemblyName System.Runtime.WindowsRuntime

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

$out = @{}

$pngs = Get-ChildItem "data/official_exams/SES_PE/pages_2024/page_*.png" | Sort-Object Name
foreach ($png in $pngs) {
    Write-Host "Processando OCR: $($png.Name)..."
    try {
        $fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($png.FullName)
        $file = Await $fileOp ([Windows.Storage.StorageFile])

        $streamOp = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read)
        $stream = Await $streamOp ([Windows.Storage.Streams.IRandomAccessStream])

        $decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
        $decoder = Await $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

        $bmpOp = $decoder.GetSoftwareBitmapAsync()
        $softwareBmp = Await $bmpOp ([Windows.Graphics.Imaging.SoftwareBitmap])

        $ocrOp = $engine.RecognizeAsync($softwareBmp)
        $ocrResult = Await $ocrOp ([Windows.Media.Ocr.OcrResult])

        $out[$png.BaseName] = $ocrResult.Text
        $stream.Dispose()
    } catch {
        Write-Warning "Erro em $($png.Name): $_"
    }
}

$out | ConvertTo-Json -Depth 3 | Set-Content "data/official_exams/SES_PE/sespe_2024_ocr_text.json" -Encoding UTF8
Write-Host "OCR Concluído e salvo em data/official_exams/SES_PE/sespe_2024_ocr_text.json!"
