@echo off
echo ===================================================
echo   INICIALIZANDO CHROME COM DEPURACAO PARA O MEDEOR
echo ===================================================
echo   PORTA DE CONTROLE: 9222
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="%~dp0scripts\.chrome_test" --new-window --start-maximized --no-first-run --no-default-browser-check "https://medeor.com.br/questions/setup"
