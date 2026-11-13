# Teste de OCR Nativo Windows em PDF
Add-Type -AssemblyName System.Runtime.WindowsRuntime
$asTaskGeneric = [System.WindowsRuntimeSystemExtensions].GetMethods() | ? { $_.Name -eq 'AsTask' -and $_.GetParameters().Count -eq 1 -and $_.GetParameters()[0].ParameterType.Name -eq 'IAsyncOperation`1' }

function Await($WinRtTask, $ResultType) {
    $asTask = $asTaskGeneric.MakeGenericMethod($ResultType)
    $netTask = $asTask.Invoke($null, @($WinRtTask))
    $netTask.Wait(-1) | Out-Null
    $netTask.Result
}

[Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null
[Windows.Data.Pdf.PdfDocument, Windows.Data.Pdf, ContentType = WindowsRuntime] | Out-Null
[Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
[Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics.Imaging, ContentType = WindowsRuntime] | Out-Null

$pdfPath = (Resolve-Path "data/temp_amp_parts/part1_p01_07.pdf").Path
Write-Output "Carregando PDF: $pdfPath"

$fileOp = [Windows.Storage.StorageFile]::GetFileFromPathAsync($pdfPath)
$file = Await $fileOp ([Windows.Storage.StorageFile])

$docOp = [Windows.Data.Pdf.PdfDocument]::LoadFromFileAsync($file)
$pdfDoc = Await $docOp ([Windows.Data.Pdf.PdfDocument])

Write-Output "Total de páginas: $($pdfDoc.PageCount)"

$page = $pdfDoc.GetPage(0) # Pagina 1
$stream = New-Object Windows.Storage.Streams.InMemoryRandomAccessStream
$renderOp = $page.RenderToStreamAsync($stream)
$netTask = [System.WindowsRuntimeSystemExtensions]::AsTask($renderOp)
$netTask.Wait(-1) | Out-Null

$stream.Seek(0)
$decoderOp = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream)
$decoder = Await $decoderOp ([Windows.Graphics.Imaging.BitmapDecoder])

$sbOp = $decoder.GetSoftwareBitmapAsync()
$softwareBitmap = Await $sbOp ([Windows.Graphics.Imaging.SoftwareBitmap])

$lang = New-Object Windows.Globalization.Language("pt-BR")
$engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage($lang)

$ocrOp = $engine.RecognizeAsync($softwareBitmap)
$ocrResult = Await $ocrOp ([Windows.Media.Ocr.OcrResult])

Write-Output "Texto reconhecido na Página 1:"
Write-Output $ocrResult.Text.Substring(0, [Math]::Min(500, $ocrResult.Text.Length))

