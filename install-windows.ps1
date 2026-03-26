# ============================================================================
# FALINTIL-FDTL PMS - Script de Instalação para Windows (PowerShell)
# ============================================================================
# Uso: Clique direito > "Executar com PowerShell" (como Administrador)
# ============================================================================

# Configurações
$INSTALL_DIR = "C:\falintil-pms"
$ErrorActionPreference = "Stop"

# Cores
function Write-ColorOutput($ForegroundColor) {
    $fc = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $ForegroundColor
    if ($args) {
        Write-Output $args
    }
    $host.UI.RawUI.ForegroundColor = $fc
}

function Write-Info($message) {
    Write-Host "[INFO] " -ForegroundColor Green -NoNewline
    Write-Host $message
}

function Write-Warn($message) {
    Write-Host "[AVISO] " -ForegroundColor Yellow -NoNewline
    Write-Host $message
}

function Write-Err($message) {
    Write-Host "[ERRO] " -ForegroundColor Red -NoNewline
    Write-Host $message
}

function Write-Step($step, $message) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host " PASSO $step : $message" -ForegroundColor Cyan
    Write-Host "============================================" -ForegroundColor Cyan
    Write-Host ""
}

# Verificar privilégios de administrador
function Test-Admin {
    $currentUser = New-Object Security.Principal.WindowsPrincipal([Security.Principal.WindowsIdentity]::GetCurrent())
    return $currentUser.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)
}

if (-not (Test-Admin)) {
    Write-Err "Este script precisa ser executado como Administrador!"
    Write-Host ""
    Write-Host "Como executar como Administrador:"
    Write-Host "1. Clique direito no arquivo"
    Write-Host "2. Selecione 'Executar com PowerShell'"
    Write-Host "3. Ou abra PowerShell como Admin e execute: .\install-windows.ps1"
    Write-Host ""
    Read-Host "Pressione Enter para sair"
    exit 1
}

# Banner
Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "║         FALINTIL-FDTL Personal Management System          ║" -ForegroundColor Cyan
Write-Host "║              Instalador para Windows                       ║" -ForegroundColor Cyan
Write-Host "║                                                            ║" -ForegroundColor Cyan
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

# ============================================================================
# PASSO 1: Verificar Pré-requisitos
# ============================================================================
Write-Step "1" "Verificando pré-requisitos"

# Verificar Python
Write-Info "Verificando Python..."
try {
    $pythonVersion = python --version 2>&1
    if ($pythonVersion -match "Python 3\.(1[0-9]|[2-9][0-9])") {
        Write-Info "Python instalado: $pythonVersion"
    } else {
        throw "Versão incompatível"
    }
} catch {
    Write-Err "Python 3.10+ não encontrado!"
    Write-Host ""
    Write-Host "Por favor, instale o Python:"
    Write-Host "1. Acesse: https://www.python.org/downloads/"
    Write-Host "2. Baixe Python 3.11 ou superior"
    Write-Host "3. IMPORTANTE: Marque 'Add Python to PATH' durante instalação"
    Write-Host ""
    Read-Host "Pressione Enter após instalar o Python"
    exit 1
}

# Verificar Node.js
Write-Info "Verificando Node.js..."
try {
    $nodeVersion = node --version 2>&1
    if ($nodeVersion -match "v(1[8-9]|[2-9][0-9])") {
        Write-Info "Node.js instalado: $nodeVersion"
    } else {
        throw "Versão incompatível"
    }
} catch {
    Write-Err "Node.js 18+ não encontrado!"
    Write-Host ""
    Write-Host "Por favor, instale o Node.js:"
    Write-Host "1. Acesse: https://nodejs.org/"
    Write-Host "2. Baixe a versão LTS (18.x ou superior)"
    Write-Host ""
    Read-Host "Pressione Enter após instalar o Node.js"
    exit 1
}

# Verificar MongoDB
Write-Info "Verificando MongoDB..."
$mongoService = Get-Service -Name "MongoDB" -ErrorAction SilentlyContinue
if ($mongoService) {
    if ($mongoService.Status -eq "Running") {
        Write-Info "MongoDB está rodando"
    } else {
        Write-Warn "MongoDB instalado mas não está rodando. Iniciando..."
        Start-Service -Name "MongoDB"
    }
} else {
    Write-Err "MongoDB não encontrado!"
    Write-Host ""
    Write-Host "Por favor, instale o MongoDB:"
    Write-Host "1. Acesse: https://www.mongodb.com/try/download/community"
    Write-Host "2. Baixe MongoDB 6.0+ para Windows (MSI)"
    Write-Host "3. Durante instalação, marque 'Install MongoDB as a Service'"
    Write-Host ""
    Read-Host "Pressione Enter após instalar o MongoDB"
    exit 1
}

Write-Info "Todos os pré-requisitos verificados!"

# ============================================================================
# PASSO 2: Verificar Arquivos do Projeto
# ============================================================================
Write-Step "2" "Verificando arquivos do projeto"

if (-not (Test-Path "$INSTALL_DIR\backend\server.py")) {
    Write-Err "Arquivos do projeto não encontrados em $INSTALL_DIR"
    Write-Host ""
    Write-Host "Por favor, copie os arquivos do projeto:"
    Write-Host "1. Crie a pasta: $INSTALL_DIR"
    Write-Host "2. Copie as pastas 'backend' e 'frontend' para lá"
    Write-Host ""
    Write-Host "Estrutura esperada:"
    Write-Host "  $INSTALL_DIR\"
    Write-Host "  ├── backend\"
    Write-Host "  │   ├── server.py"
    Write-Host "  │   └── requirements.txt"
    Write-Host "  └── frontend\"
    Write-Host "      ├── src\"
    Write-Host "      └── package.json"
    Write-Host ""
    Read-Host "Pressione Enter após copiar os arquivos"
    
    if (-not (Test-Path "$INSTALL_DIR\backend\server.py")) {
        Write-Err "Arquivos ainda não encontrados. Saindo..."
        exit 1
    }
}

Write-Info "Arquivos do projeto encontrados!"

# ============================================================================
# PASSO 3: Obter IP do Servidor
# ============================================================================
Write-Step "3" "Configurando endereço IP"

$ipAddress = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notmatch "Loopback" -and $_.IPAddress -notmatch "^169" } | Select-Object -First 1).IPAddress

if (-not $ipAddress) {
    $ipAddress = "localhost"
}

Write-Info "IP detectado: $ipAddress"
$useIP = Read-Host "Usar este IP? (s/n) [s]"

if ($useIP -eq "n") {
    $ipAddress = Read-Host "Digite o IP do servidor"
}

Write-Info "Usando IP: $ipAddress"

# ============================================================================
# PASSO 4: Configurar Backend
# ============================================================================
Write-Step "4" "Configurando Backend"

Set-Location "$INSTALL_DIR\backend"

# Criar ambiente virtual
Write-Info "Criando ambiente virtual Python..."
python -m venv venv

# Ativar ambiente virtual
Write-Info "Ativando ambiente virtual..."
& "$INSTALL_DIR\backend\venv\Scripts\Activate.ps1"

# Atualizar pip
Write-Info "Atualizando pip..."
python -m pip install --upgrade pip | Out-Null

# Instalar dependências
Write-Info "Instalando dependências do backend (pode demorar alguns minutos)..."
pip install -r requirements.txt | Out-Null

# Criar arquivo .env
Write-Info "Criando arquivo de configuração..."
$backendEnv = @"
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=$(New-Guid)$(New-Guid)
CORS_ORIGINS=http://localhost:3000,http://${ipAddress}:3000,http://${ipAddress},http://localhost
"@
$backendEnv | Out-File -FilePath "$INSTALL_DIR\backend\.env" -Encoding UTF8

Write-Info "Backend configurado!"

# ============================================================================
# PASSO 5: Configurar Frontend
# ============================================================================
Write-Step "5" "Configurando Frontend"

Set-Location "$INSTALL_DIR\frontend"

# Instalar Yarn se não existir
Write-Info "Verificando Yarn..."
try {
    yarn --version | Out-Null
} catch {
    Write-Info "Instalando Yarn..."
    npm install -g yarn | Out-Null
}

# Criar arquivo .env
Write-Info "Criando arquivo de configuração..."
$frontendEnv = "REACT_APP_BACKEND_URL=http://${ipAddress}:8001"
$frontendEnv | Out-File -FilePath "$INSTALL_DIR\frontend\.env" -Encoding UTF8

# Instalar dependências
Write-Info "Instalando dependências do frontend (pode demorar alguns minutos)..."
yarn install 2>&1 | Out-Null

# Build
Write-Info "Criando build de produção..."
yarn build 2>&1 | Out-Null

Write-Info "Frontend configurado!"

# ============================================================================
# PASSO 6: Instalar NSSM
# ============================================================================
Write-Step "6" "Configurando serviços Windows"

$nssmPath = "C:\nssm"
$nssmExe = "$nssmPath\nssm.exe"

if (-not (Test-Path $nssmExe)) {
    Write-Info "Baixando NSSM (gerenciador de serviços)..."
    
    if (-not (Test-Path $nssmPath)) {
        New-Item -ItemType Directory -Path $nssmPath | Out-Null
    }
    
    $nssmZip = "$nssmPath\nssm.zip"
    Invoke-WebRequest -Uri "https://nssm.cc/release/nssm-2.24.zip" -OutFile $nssmZip
    Expand-Archive -Path $nssmZip -DestinationPath $nssmPath -Force
    Copy-Item "$nssmPath\nssm-2.24\win64\nssm.exe" $nssmExe
    Remove-Item $nssmZip
}

Write-Info "NSSM disponível!"

# ============================================================================
# PASSO 7: Criar Serviço do Backend
# ============================================================================
Write-Step "7" "Criando serviço do Backend"

# Parar e remover serviço existente
& $nssmExe stop FALINTIL-Backend 2>&1 | Out-Null
& $nssmExe remove FALINTIL-Backend confirm 2>&1 | Out-Null

# Instalar novo serviço
Write-Info "Instalando serviço do backend..."
& $nssmExe install FALINTIL-Backend "$INSTALL_DIR\backend\venv\Scripts\uvicorn.exe" "server:app --host 0.0.0.0 --port 8001"
& $nssmExe set FALINTIL-Backend AppDirectory "$INSTALL_DIR\backend"
& $nssmExe set FALINTIL-Backend Description "FALINTIL-FDTL PMS Backend API"
& $nssmExe set FALINTIL-Backend Start SERVICE_AUTO_START

# Iniciar serviço
Write-Info "Iniciando serviço do backend..."
& $nssmExe start FALINTIL-Backend

Start-Sleep -Seconds 3

$backendService = Get-Service -Name "FALINTIL-Backend" -ErrorAction SilentlyContinue
if ($backendService.Status -eq "Running") {
    Write-Info "Serviço do backend iniciado com sucesso!"
} else {
    Write-Warn "Serviço pode não ter iniciado corretamente. Verifique os logs."
}

# ============================================================================
# PASSO 8: Configurar Firewall
# ============================================================================
Write-Step "8" "Configurando Firewall"

Write-Info "Adicionando regras de firewall..."

# Remover regras antigas
Remove-NetFirewallRule -DisplayName "FALINTIL-PMS-HTTP" -ErrorAction SilentlyContinue
Remove-NetFirewallRule -DisplayName "FALINTIL-PMS-API" -ErrorAction SilentlyContinue

# Adicionar novas regras
New-NetFirewallRule -DisplayName "FALINTIL-PMS-HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow | Out-Null
New-NetFirewallRule -DisplayName "FALINTIL-PMS-API" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow | Out-Null

Write-Info "Firewall configurado!"

# ============================================================================
# PASSO 9: Inicializar Admin
# ============================================================================
Write-Step "9" "Criando usuário administrador"

Write-Info "Aguardando backend inicializar..."
Start-Sleep -Seconds 5

try {
    $response = Invoke-RestMethod -Uri "http://localhost:8001/api/init-admin" -Method Post
    Write-Info "Usuário administrador criado!"
} catch {
    Write-Warn "Não foi possível criar admin automaticamente. Tente manualmente depois."
}

# ============================================================================
# PASSO 10: Instruções Finais
# ============================================================================

Write-Host ""
Write-Host "╔════════════════════════════════════════════════════════════╗" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "║            INSTALAÇÃO CONCLUÍDA COM SUCESSO!              ║" -ForegroundColor Green
Write-Host "║                                                            ║" -ForegroundColor Green
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor Green
Write-Host ""

Write-Host "PARA ACESSAR O SISTEMA:" -ForegroundColor Yellow
Write-Host ""
Write-Host "  1. Abra um novo PowerShell e execute:"
Write-Host "     cd $INSTALL_DIR\frontend\build"
Write-Host "     npx serve -s . -l 80"
Write-Host ""
Write-Host "  2. Abra o navegador e acesse:"
Write-Host "     http://localhost" -ForegroundColor Cyan
Write-Host "     ou http://${ipAddress}" -ForegroundColor Cyan
Write-Host ""
Write-Host "CREDENCIAIS DE ACESSO:" -ForegroundColor Yellow
Write-Host "  Email: admin@falintil-fdtl.tl" -ForegroundColor White
Write-Host "  Senha: admin123" -ForegroundColor White
Write-Host ""
Write-Host "IMPORTANTE:" -ForegroundColor Red
Write-Host "  Altere a senha após o primeiro acesso!" -ForegroundColor Red
Write-Host ""
Write-Host "COMANDOS ÚTEIS:" -ForegroundColor Yellow
Write-Host "  Ver status:    Get-Service FALINTIL-Backend"
Write-Host "  Reiniciar:     Restart-Service FALINTIL-Backend"
Write-Host "  Parar:         Stop-Service FALINTIL-Backend"
Write-Host ""

Read-Host "Pressione Enter para finalizar"
