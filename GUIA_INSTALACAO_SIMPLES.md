# FALINTIL-FDTL PMS - GUIA DE INSTALAÇÃO SIMPLIFICADO
## Sistema de Gestão de Pessoal Militar

---

# ÍNDICE

1. [Instalação Local (localhost)](#parte-1-instalação-local-localhost)
   - [Linux](#11-linux-ubuntu)
   - [Windows](#12-windows-1011)
2. [Acesso por Outro Computador na Rede](#parte-2-acesso-por-outro-computador-na-mesma-rede)
3. [Instalação em Servidor](#parte-3-instalação-em-servidor-produção)
   - [Servidor Linux](#31-servidor-linux)
   - [Servidor Windows](#32-servidor-windows)

---

# PARTE 1: INSTALAÇÃO LOCAL (LOCALHOST)

## 1.1 LINUX (Ubuntu)

### Pré-requisitos
- Ubuntu 20.04, 22.04 ou 24.04
- Acesso de administrador (sudo)

### Passo 1: Abrir Terminal
Pressione `Ctrl + Alt + T`

### Passo 2: Atualizar Sistema
```bash
sudo apt update && sudo apt upgrade -y
```

### Passo 3: Instalar Python
```bash
sudo apt install -y python3 python3-pip python3-venv
```

### Passo 4: Instalar Node.js
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
```

### Passo 5: Instalar MongoDB
```bash
# Importar chave
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Adicionar repositório (Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar
sudo apt update
sudo apt install -y mongodb-org

# Iniciar
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Passo 6: Copiar Arquivos do Projeto
```bash
# Criar pasta
mkdir -p ~/falintil-pms

# Copiar arquivos (do pendrive ou download)
cp -r /caminho/dos/arquivos/* ~/falintil-pms/
```

### Passo 7: Configurar Backend
```bash
cd ~/falintil-pms/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate

# Instalar dependências
pip install -r requirements.txt

# Criar arquivo .env
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-12345
CORS_ORIGINS=http://localhost:3000,http://localhost
EOF
```

### Passo 8: Configurar Frontend
```bash
cd ~/falintil-pms/frontend

# Criar arquivo .env
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env

# Instalar dependências
yarn install
```

### Passo 9: Iniciar o Sistema

**Terminal 1 - Backend:**
```bash
cd ~/falintil-pms/backend
source venv/bin/activate
uvicorn server:app --host 0.0.0.0 --port 8001
```

**Terminal 2 - Frontend:**
```bash
cd ~/falintil-pms/frontend
yarn start
```

### Passo 10: Acessar o Sistema
Abra o navegador: **http://localhost:3000**

**Login padrão:**
- Email: `admin@falintil-fdtl.tl`
- Senha: `admin123`

---

## 1.2 WINDOWS (10/11)

### Pré-requisitos
- Windows 10 ou 11
- Conta de administrador

### Passo 1: Instalar Python

1. Acesse: https://www.python.org/downloads/
2. Baixe Python 3.11
3. Execute o instalador
4. **IMPORTANTE:** Marque ✅ "Add Python to PATH"
5. Clique "Install Now"

**Verificar:**
```cmd
python --version
```

### Passo 2: Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe a versão LTS
3. Execute o instalador
4. Clique "Next" em tudo

**Verificar:**
```cmd
node --version
npm --version
```

### Passo 3: Instalar Yarn
```cmd
npm install -g yarn
```

### Passo 4: Instalar MongoDB

1. Acesse: https://www.mongodb.com/try/download/community
2. Baixe MongoDB 6.0 para Windows (MSI)
3. Execute o instalador
4. Selecione "Complete"
5. ✅ Marque "Install MongoDB as a Service"
6. Clique "Install"

### Passo 5: Copiar Arquivos do Projeto

1. Crie a pasta `C:\falintil-pms`
2. Copie as pastas `backend` e `frontend` para dentro

### Passo 6: Configurar Backend

Abra o **PowerShell como Administrador:**

```powershell
cd C:\falintil-pms\backend

# Criar ambiente virtual
python -m venv venv

# Ativar
.\venv\Scripts\Activate.ps1

# Instalar dependências
pip install -r requirements.txt
```

Crie o arquivo `C:\falintil-pms\backend\.env` com o Bloco de Notas:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-12345
CORS_ORIGINS=http://localhost:3000,http://localhost
```

### Passo 7: Configurar Frontend

```powershell
cd C:\falintil-pms\frontend

# Instalar dependências
yarn install
```

Crie o arquivo `C:\falintil-pms\frontend\.env`:
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

### Passo 8: Iniciar o Sistema

**PowerShell 1 - Backend:**
```powershell
cd C:\falintil-pms\backend
.\venv\Scripts\Activate.ps1
uvicorn server:app --host 0.0.0.0 --port 8001
```

**PowerShell 2 - Frontend:**
```powershell
cd C:\falintil-pms\frontend
yarn start
```

### Passo 9: Acessar o Sistema
Abra o navegador: **http://localhost:3000**

**Login padrão:**
- Email: `admin@falintil-fdtl.tl`
- Senha: `admin123`

---

# PARTE 2: ACESSO POR OUTRO COMPUTADOR NA MESMA REDE

## 2.1 Descobrir o IP do Computador com o Sistema

### Linux:
```bash
hostname -I
```
Resultado exemplo: `192.168.1.100`

### Windows:
```cmd
ipconfig
```
Procure por "Endereço IPv4": `192.168.1.100`

## 2.2 Atualizar Configurações

### No computador que tem o sistema instalado:

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-12345
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000,http://192.168.1.100
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://192.168.1.100:8001
```

⚠️ Substitua `192.168.1.100` pelo IP real do seu computador.

## 2.3 Liberar Firewall

### Linux:
```bash
sudo ufw allow 3000/tcp
sudo ufw allow 8001/tcp
```

### Windows:
1. Abra "Windows Defender Firewall"
2. Clique "Configurações avançadas"
3. Clique "Regras de Entrada" → "Nova Regra"
4. Selecione "Porta" → TCP → `3000, 8001`
5. "Permitir conexão" → Próximo → Concluir

## 2.4 Reiniciar o Sistema

Reinicie o backend e frontend após as alterações.

## 2.5 Acessar de Outro Computador

No outro computador da rede, abra o navegador:
```
http://192.168.1.100:3000
```

---

# PARTE 3: INSTALAÇÃO EM SERVIDOR (PRODUÇÃO)

## 3.1 SERVIDOR LINUX

### Passo 1: Preparar o Servidor

```bash
# Atualizar
sudo apt update && sudo apt upgrade -y

# Instalar dependências
sudo apt install -y curl wget git nginx
```

### Passo 2: Instalar Python, Node.js e MongoDB

(Mesmos comandos da Parte 1.1, Passos 3, 4 e 5)

### Passo 3: Criar Usuário do Sistema

```bash
sudo useradd -m -s /bin/bash falintil
sudo mkdir -p /opt/falintil-pms
sudo chown falintil:falintil /opt/falintil-pms
```

### Passo 4: Copiar e Configurar Arquivos

```bash
# Copiar arquivos para /opt/falintil-pms/
sudo cp -r /caminho/arquivos/* /opt/falintil-pms/
sudo chown -R falintil:falintil /opt/falintil-pms/
```

### Passo 5: Configurar Backend

```bash
cd /opt/falintil-pms/backend

# Criar ambiente virtual
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Criar .env (substitua IP_DO_SERVIDOR pelo IP real)
cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=$(openssl rand -hex 32)
CORS_ORIGINS=http://IP_DO_SERVIDOR,http://localhost
EOF
```

### Passo 6: Configurar Frontend

```bash
cd /opt/falintil-pms/frontend

# Criar .env
echo "REACT_APP_BACKEND_URL=http://IP_DO_SERVIDOR" > .env

# Instalar e criar build
yarn install
yarn build
```

### Passo 7: Configurar Nginx

```bash
sudo nano /etc/nginx/sites-available/falintil-pms
```

Cole o conteúdo (substitua IP_DO_SERVIDOR):
```nginx
server {
    listen 80;
    server_name IP_DO_SERVIDOR;

    # Frontend
    location / {
        root /opt/falintil-pms/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        client_max_body_size 50M;
    }
}
```

Ativar:
```bash
sudo ln -sf /etc/nginx/sites-available/falintil-pms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx
```

### Passo 8: Criar Serviço do Backend

```bash
sudo nano /etc/systemd/system/falintil-backend.service
```

Cole:
```ini
[Unit]
Description=FALINTIL-FDTL PMS Backend
After=network.target mongod.service

[Service]
Type=simple
User=falintil
WorkingDirectory=/opt/falintil-pms/backend
Environment="PATH=/opt/falintil-pms/backend/venv/bin"
ExecStart=/opt/falintil-pms/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always

[Install]
WantedBy=multi-user.target
```

Ativar:
```bash
sudo systemctl daemon-reload
sudo systemctl start falintil-backend
sudo systemctl enable falintil-backend
```

### Passo 9: Configurar Firewall

```bash
sudo ufw allow 80/tcp
sudo ufw allow 22/tcp
sudo ufw enable
```

### Passo 10: Criar Admin

```bash
curl -X POST http://localhost:8001/api/init-admin
```

### Passo 11: Acessar o Sistema

De qualquer computador na rede:
```
http://IP_DO_SERVIDOR
```

---

## 3.2 SERVIDOR WINDOWS

### Passo 1: Instalar Pré-requisitos

Instale Python, Node.js, MongoDB e Git (mesmos passos da Parte 1.2)

### Passo 2: Copiar Arquivos

Copie as pastas `backend` e `frontend` para `C:\falintil-pms`

### Passo 3: Configurar Backend

PowerShell como Administrador:
```powershell
cd C:\falintil-pms\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
```

Crie `C:\falintil-pms\backend\.env`:
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-servidor-2026
CORS_ORIGINS=http://IP_DO_SERVIDOR,http://localhost
```

### Passo 4: Configurar Frontend

```powershell
cd C:\falintil-pms\frontend
yarn install
```

Crie `C:\falintil-pms\frontend\.env`:
```
REACT_APP_BACKEND_URL=http://IP_DO_SERVIDOR
```

Build:
```powershell
yarn build
```

### Passo 5: Instalar NSSM (Gerenciador de Serviços)

1. Baixe: https://nssm.cc/download
2. Extraia para `C:\nssm`

### Passo 6: Criar Serviço do Backend

PowerShell como Administrador:
```powershell
C:\nssm\win64\nssm.exe install FALINTIL-Backend "C:\falintil-pms\backend\venv\Scripts\uvicorn.exe" "server:app --host 0.0.0.0 --port 8001"
C:\nssm\win64\nssm.exe set FALINTIL-Backend AppDirectory "C:\falintil-pms\backend"
C:\nssm\win64\nssm.exe start FALINTIL-Backend
```

### Passo 7: Instalar IIS

1. Painel de Controle → Programas → Ativar recursos do Windows
2. Marque "Serviços de Informações da Internet"
3. OK e aguarde

### Passo 8: Configurar IIS

1. Abra "Gerenciador do IIS"
2. Clique direito em "Sites" → "Adicionar Site"
3. Configure:
   - Nome: `FALINTIL-PMS`
   - Caminho: `C:\falintil-pms\frontend\build`
   - Porta: `80`

### Passo 9: Instalar URL Rewrite

1. Baixe: https://www.iis.net/downloads/microsoft/url-rewrite
2. Instale

Crie `C:\falintil-pms\frontend\build\web.config`:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="API" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8001/api/{R:1}" />
        </rule>
        <rule name="React" stopProcessing="true">
          <match url=".*" />
          <conditions>
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

### Passo 10: Configurar Firewall

```powershell
New-NetFirewallRule -DisplayName "FALINTIL-HTTP" -Direction Inbound -Protocol TCP -LocalPort 80 -Action Allow
New-NetFirewallRule -DisplayName "FALINTIL-API" -Direction Inbound -Protocol TCP -LocalPort 8001 -Action Allow
```

### Passo 11: Criar Admin

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/init-admin" -Method Post
```

### Passo 12: Acessar o Sistema

De qualquer computador na rede:
```
http://IP_DO_SERVIDOR
```

---

# RESUMO RÁPIDO

## Credenciais Padrão
| Campo | Valor |
|-------|-------|
| Email | admin@falintil-fdtl.tl |
| Senha | admin123 |

## Portas Utilizadas
| Porta | Serviço |
|-------|---------|
| 80 | Web (Frontend) |
| 8001 | API (Backend) |
| 27017 | MongoDB |

## Comandos Úteis

### Linux
```bash
# Ver status
sudo systemctl status falintil-backend nginx mongod

# Reiniciar
sudo systemctl restart falintil-backend

# Ver logs
sudo journalctl -u falintil-backend -f
```

### Windows
```powershell
# Ver status
Get-Service -Name "FALINTIL*"

# Reiniciar
Restart-Service -Name "FALINTIL-Backend"
```

---

**⚠️ IMPORTANTE:** Altere a senha do admin após o primeiro acesso!
