@echo off
echo ========================================================
echo   ABRINDO JANELA VISIVEL DO MEDEVO (GOOGLE TESTE)
echo   PORTA DE CONTROLE: 9222
echo ========================================================
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --user-data-dir="%~dp0scripts\.chrome_test" --remote-debugging-port=9222 --new-window --start-maximized --no-first-run --no-default-browser-check "https://www.medevo.com.br/"
