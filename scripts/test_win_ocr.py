import subprocess
import os
import json

def ocr_image_windows(image_path):
    ps_script = f'''
    [Windows.Media.Ocr.OcrEngine, Windows.Foundation, ContentType = WindowsRuntime] | Out-Null
    [Windows.Graphics.Imaging.BitmapDecoder, Windows.Graphics, ContentType = WindowsRuntime] | Out-Null
    [Windows.Storage.StorageFile, Windows.Storage, ContentType = WindowsRuntime] | Out-Null

    $file = [Windows.Storage.StorageFile]::GetFileFromPathAsync("{os.path.abspath(image_path)}").GetAwaiter().GetResult()
    $stream = $file.OpenAsync([Windows.Storage.FileAccessMode]::Read).GetAwaiter().GetResult()
    $decoder = [Windows.Graphics.Imaging.BitmapDecoder]::CreateAsync($stream).GetAwaiter().GetResult()
    $bitmap = $decoder.GetSoftwareBitmapAsync().GetAwaiter().GetResult()

    $engine = [Windows.Media.Ocr.OcrEngine]::TryCreateFromLanguage([Windows.Globalization.Language]::new("pt-BR"))
    $result = $engine.RecognizeAsync($bitmap).GetAwaiter().GetResult()
    $result.Text
    '''
    res = subprocess.run(["powershell", "-NoProfile", "-Command", ps_script], capture_output=True, text=True, encoding='utf-8')
    return res.stdout.strip()

test_img = 'data/temp_ocr_pages/page_01.jpg'
if os.path.exists(test_img):
    txt = ocr_image_windows(test_img)
    print("OCR Output length:", len(txt))
    print("OCR Preview:\n", txt[:400])
else:
    print("Test image not found")

