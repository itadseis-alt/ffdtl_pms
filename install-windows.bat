@echo off
REM =============================================================================
REM FALINTIL-FDTL PMS - Script de Instalação para Windows
REM =============================================================================
REM Uso: Executar como Administrador
REM =============================================================================

echo ================================================
echo FALINTIL-FDTL PMS - Instalador Windows
echo ================================================
echo.

REM Verificar privilégios de administrador
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Execute este script como Administrador!
    echo Clique direito no arquivo e selecione "Executar como administrador"
    pause
    exit /b 1
)

REM Definir variáveis
set INSTALL_DIR=C:\falintil-pms
set SERVER_IP=

REM Obter IP do servidor
echo Detectando IP do servidor...
for /f "tokens=2 delims=:" %%a in ('ipconfig ^| findstr /c:"IPv4"') do (
    set SERVER_IP=%%a
    goto :found_ip
)
:found_ip
set SERVER_IP=%SERVER_IP: =%
echo IP detectado: %SERVER_IP%
echo.

set /p CONFIRM="Usar este IP? (s/n) [s]: "
if /i "%CONFIRM%"=="n" (
    set /p SERVER_IP="Digite o IP do servidor: "
)

echo.
echo ================================================
echo Verificando pre-requisitos...
echo ================================================
echo.

REM Verificar Python
python --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Python nao encontrado!
    echo Por favor, instale Python 3.11+ de https://www.python.org/downloads/
    echo IMPORTANTE: Marque "Add Python to PATH" durante a instalacao
    pause
    exit /b 1
)
echo [OK] Python instalado

REM Verificar Node.js
node --version >nul 2>&1
if %errorLevel% neq 0 (
    echo [ERRO] Node.js nao encontrado!
    echo Por favor, instale Node.js 18+ de https://nodejs.org/
    pause
    exit /b 1
)
echo [OK] Node.js instalado

REM Verificar MongoDB
sc query MongoDB >nul 2>&1
if %errorLevel% neq 0 (
    echo [AVISO] Servico MongoDB nao encontrado
    echo Por favor, instale MongoDB de https://www.mongodb.com/try/download/community
    echo Selecione "Install MongoDB as a Service"
    pause
)
echo [OK] MongoDB instalado

echo.
echo ================================================
echo Configurando aplicacao...
echo ================================================
echo.

REM Criar diretório
if not exist "%INSTALL_DIR%" mkdir "%INSTALL_DIR%"

REM Verificar se arquivos existem
if not exist "%INSTALL_DIR%\backend" (
    echo [AVISO] Diretorio backend nao encontrado!
    echo Por favor, copie os arquivos do projeto para %INSTALL_DIR%
    echo Estrutura esperada:
    echo   %INSTALL_DIR%\backend\
    echo   %INSTALL_DIR%\frontend\
    pause
    exit /b 1
)

echo Configurando backend...
cd /d "%INSTALL_DIR%\backend"

REM Criar ambiente virtual
python -m venv venv

REM Ativar e instalar dependências
call venv\Scripts\activate.bat
pip install --upgrade pip
pip install -r requirements.txt

REM Criar .env do backend
(
echo MONGO_URL=mongodb://localhost:27017
echo DB_NAME=falintil_pms
echo JWT_SECRET=%random%%random%%random%%random%
echo CORS_ORIGINS=http://localhost:3000,http://%SERVER_IP%:3000,http://%SERVER_IP%
) > .env

call deactivate

echo.
echo Configurando frontend...
cd /d "%INSTALL_DIR%\frontend"

REM Instalar Yarn se não existir
call npm install -g yarn

REM Criar .env do frontend
(
echo REACT_APP_BACKEND_URL=http://%SERVER_IP%
) > .env

REM Instalar dependências e build
call yarn install
call yarn build

echo.
echo ================================================
echo Instalando NSSM para servico do backend...
echo ================================================
echo.

REM Baixar NSSM se não existir
if not exist "C:\nssm" (
    echo Baixando NSSM...
    mkdir C:\nssm
    powershell -Command "Invoke-WebRequest -Uri 'https://nssm.cc/release/nssm-2.24.zip' -OutFile 'C:\nssm\nssm.zip'"
    powershell -Command "Expand-Archive -Path 'C:\nssm\nssm.zip' -DestinationPath 'C:\nssm' -Force"
    move "C:\nssm\nssm-2.24\win64\nssm.exe" "C:\nssm\nssm.exe"
)

REM Criar serviço do backend
C:\nssm\nssm.exe stop FALINTIL-Backend >nul 2>&1
C:\nssm\nssm.exe remove FALINTIL-Backend confirm >nul 2>&1
C:\nssm\nssm.exe install FALINTIL-Backend "%INSTALL_DIR%\backend\venv\Scripts\uvicorn.exe" "server:app --host 0.0.0.0 --port 8001"
C:\nssm\nssm.exe set FALINTIL-Backend AppDirectory "%INSTALL_DIR%\backend"
C:\nssm\nssm.exe start FALINTIL-Backend

echo.
echo ================================================
echo Configurando Firewall...
echo ================================================
echo.

REM Adicionar regras de firewall
netsh advfirewall firewall delete rule name="FALINTIL-PMS-HTTP" >nul 2>&1
netsh advfirewall firewall add rule name="FALINTIL-PMS-HTTP" dir=in action=allow protocol=tcp localport=80
netsh advfirewall firewall delete rule name="FALINTIL-PMS-API" >nul 2>&1
netsh advfirewall firewall add rule name="FALINTIL-PMS-API" dir=in action=allow protocol=tcp localport=8001

echo.
echo ================================================
echo Inicializando admin...
echo ================================================
echo.

timeout /t 5 /nobreak >nul
powershell -Command "Invoke-RestMethod -Uri 'http://localhost:8001/api/init-admin' -Method Post"

echo.
echo ================================================
echo         INSTALACAO CONCLUIDA!
echo ================================================
echo.
echo PROXIMOS PASSOS:
echo.
echo 1. Configure o IIS para servir o frontend:
echo    - Abra o Gerenciador do IIS
echo    - Adicione um site apontando para: %INSTALL_DIR%\frontend\build
echo    - Configure URL Rewrite para SPA e API proxy
echo.
echo 2. OU use um servidor web simples para teste:
echo    cd %INSTALL_DIR%\frontend\build
echo    npx serve -s . -l 80
echo.
echo ================================================
echo.
echo Acesse o sistema:
echo   URL: http://%SERVER_IP%:8001 (API direta)
echo   URL: http://%SERVER_IP% (após configurar IIS)
echo.
echo Credenciais padrao:
echo   Email: admin@falintil-fdtl.tl
echo   Senha: admin123
echo.
echo IMPORTANTE: Altere a senha apos o primeiro acesso!
echo.
echo ================================================
pause
