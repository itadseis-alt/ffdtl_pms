# ============================================================================
# FALINTIL-FDTL PMS - GUIA COMPLETO DE INSTALAÇÃO LOCAL
# ============================================================================
# Sistema de Gestão de Pessoal Militar
# Versão: 1.0
# Data: Março 2026
# ============================================================================

# PARTE 1: INSTALAÇÃO NO LINUX (Ubuntu 22.04/24.04)

## ============================================================================
## PASSO 1: PREPARAÇÃO DO SISTEMA
## ============================================================================

### 1.1 Abrir o Terminal

**Método 1:** Pressione `Ctrl + Alt + T`

**Método 2:** 
- Clique no ícone "Atividades" (canto superior esquerdo)
- Digite "Terminal" na busca
- Clique no ícone do Terminal

### 1.2 Atualizar o Sistema

Digite os comandos abaixo (pressione Enter após cada linha):

```bash
sudo apt update
```
> Quando pedir senha, digite a senha do seu usuário (não aparecerá na tela)

```bash
sudo apt upgrade -y
```
> Aguarde a atualização completar (pode demorar alguns minutos)

### 1.3 Instalar Ferramentas Básicas

```bash
sudo apt install -y curl wget git build-essential software-properties-common gnupg lsb-release
```

## ============================================================================
## PASSO 2: INSTALAR PYTHON 3.11
## ============================================================================

### 2.1 Adicionar Repositório do Python

```bash
sudo add-apt-repository ppa:deadsnakes/ppa -y
```

### 2.2 Atualizar Lista de Pacotes

```bash
sudo apt update
```

### 2.3 Instalar Python 3.11

```bash
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

### 2.4 Verificar Instalação

```bash
python3.11 --version
```
> Deve mostrar: `Python 3.11.x`

## ============================================================================
## PASSO 3: INSTALAR NODE.JS 18
## ============================================================================

### 3.1 Adicionar Repositório do Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
```

### 3.2 Instalar Node.js

```bash
sudo apt install -y nodejs
```

### 3.3 Verificar Instalação

```bash
node --version
```
> Deve mostrar: `v18.x.x`

```bash
npm --version
```
> Deve mostrar: `9.x.x` ou superior

### 3.4 Instalar Yarn (Gerenciador de Pacotes)

```bash
sudo npm install -g yarn
```

### 3.5 Verificar Yarn

```bash
yarn --version
```
> Deve mostrar: `1.22.x`

## ============================================================================
## PASSO 4: INSTALAR MONGODB 6.0
## ============================================================================

### 4.1 Importar Chave de Segurança do MongoDB

```bash
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
```

### 4.2 Adicionar Repositório do MongoDB

**Para Ubuntu 22.04 (Jammy):**
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

**Para Ubuntu 24.04 (Noble):**
```bash
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list
```

### 4.3 Atualizar e Instalar MongoDB

```bash
sudo apt update
sudo apt install -y mongodb-org
```

### 4.4 Iniciar o Serviço do MongoDB

```bash
sudo systemctl start mongod
```

### 4.5 Configurar para Iniciar Automaticamente

```bash
sudo systemctl enable mongod
```

### 4.6 Verificar se MongoDB está Funcionando

```bash
sudo systemctl status mongod
```
> Deve mostrar: `Active: active (running)` em verde

**Para sair da visualização, pressione `q`**

### 4.7 Testar Conexão com MongoDB

```bash
mongosh --eval "db.version()"
```
> Deve mostrar a versão do MongoDB (ex: `6.0.x`)

## ============================================================================
## PASSO 5: COPIAR ARQUIVOS DO PROJETO
## ============================================================================

### 5.1 Criar Pasta do Projeto

```bash
sudo mkdir -p /opt/falintil-pms
sudo chown $USER:$USER /opt/falintil-pms
```

### 5.2 Copiar Arquivos

**Opção A: De um Pendrive**

1. Insira o pendrive no computador
2. O pendrive geralmente monta em `/media/seu_usuario/nome_do_pendrive`
3. Copie os arquivos:

```bash
cp -r /media/$USER/PENDRIVE/falintil-pms/* /opt/falintil-pms/
```
> Substitua `PENDRIVE` pelo nome do seu pendrive

**Opção B: De uma Pasta Local**

```bash
cp -r ~/Downloads/falintil-pms/* /opt/falintil-pms/
```

### 5.3 Verificar se os Arquivos Foram Copiados

```bash
ls -la /opt/falintil-pms/
```
> Deve mostrar as pastas: `backend` e `frontend`

## ============================================================================
## PASSO 6: CONFIGURAR O BACKEND
## ============================================================================

### 6.1 Entrar na Pasta do Backend

```bash
cd /opt/falintil-pms/backend
```

### 6.2 Criar Ambiente Virtual Python

```bash
python3.11 -m venv venv
```
> Isso cria uma pasta `venv` com um ambiente Python isolado

### 6.3 Ativar o Ambiente Virtual

```bash
source venv/bin/activate
```
> Você verá `(venv)` no início da linha do terminal

### 6.4 Atualizar o Pip

```bash
pip install --upgrade pip
```

### 6.5 Instalar as Dependências do Backend

```bash
pip install -r requirements.txt
```
> Aguarde a instalação (pode demorar alguns minutos)

### 6.6 Criar Arquivo de Configuração (.env)

```bash
nano .env
```

Digite o seguinte conteúdo:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-muito-segura-falintil-2026
CORS_ORIGINS=http://localhost:3000,http://localhost
```

**Para salvar no nano:**
1. Pressione `Ctrl + O` (salvar)
2. Pressione `Enter` (confirmar nome do arquivo)
3. Pressione `Ctrl + X` (sair)

### 6.7 Testar o Backend

```bash
uvicorn server:app --host 0.0.0.0 --port 8001
```

> Deve mostrar: `Uvicorn running on http://0.0.0.0:8001`

**Abra o navegador e acesse:** `http://localhost:8001/api/`

> Deve mostrar: `{"message":"FALINTIL-FDTL PMS API","version":"1.0.0"}`

**Pressione `Ctrl + C` no terminal para parar o servidor**

### 6.8 Desativar o Ambiente Virtual (por enquanto)

```bash
deactivate
```

## ============================================================================
## PASSO 7: CONFIGURAR O FRONTEND
## ============================================================================

### 7.1 Entrar na Pasta do Frontend

```bash
cd /opt/falintil-pms/frontend
```

### 7.2 Criar Arquivo de Configuração (.env)

```bash
nano .env
```

Digite o seguinte conteúdo:

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

**Salvar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 7.3 Instalar as Dependências do Frontend

```bash
yarn install
```
> Aguarde a instalação (pode demorar alguns minutos)

### 7.4 Criar Build de Produção

```bash
yarn build
```
> Isso cria a pasta `build` com os arquivos otimizados

## ============================================================================
## PASSO 8: INSTALAR E CONFIGURAR NGINX
## ============================================================================

### 8.1 Instalar Nginx

```bash
sudo apt install -y nginx
```

### 8.2 Criar Arquivo de Configuração do Site

```bash
sudo nano /etc/nginx/sites-available/falintil-pms
```

Cole o seguinte conteúdo:

```nginx
server {
    listen 80;
    server_name localhost;

    # Frontend - Arquivos estáticos
    location / {
        root /opt/falintil-pms/frontend/build;
        index index.html;
        try_files $uri $uri/ /index.html;
    }

    # Backend - API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
```

**Salvar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 8.3 Ativar o Site

```bash
sudo ln -sf /etc/nginx/sites-available/falintil-pms /etc/nginx/sites-enabled/
```

### 8.4 Remover Site Padrão

```bash
sudo rm -f /etc/nginx/sites-enabled/default
```

### 8.5 Testar Configuração do Nginx

```bash
sudo nginx -t
```
> Deve mostrar: `syntax is ok` e `test is successful`

### 8.6 Reiniciar Nginx

```bash
sudo systemctl restart nginx
```

### 8.7 Habilitar Nginx para Iniciar Automaticamente

```bash
sudo systemctl enable nginx
```

## ============================================================================
## PASSO 9: CRIAR SERVIÇO DO BACKEND
## ============================================================================

### 9.1 Criar Arquivo de Serviço

```bash
sudo nano /etc/systemd/system/falintil-backend.service
```

Cole o seguinte conteúdo:

```ini
[Unit]
Description=FALINTIL-FDTL PMS Backend
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/falintil-pms/backend
Environment="PATH=/opt/falintil-pms/backend/venv/bin"
ExecStart=/opt/falintil-pms/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

**Salvar:** `Ctrl + O`, `Enter`, `Ctrl + X`

### 9.2 Recarregar Configurações do Sistema

```bash
sudo systemctl daemon-reload
```

### 9.3 Iniciar o Serviço do Backend

```bash
sudo systemctl start falintil-backend
```

### 9.4 Habilitar Início Automático

```bash
sudo systemctl enable falintil-backend
```

### 9.5 Verificar Status

```bash
sudo systemctl status falintil-backend
```
> Deve mostrar: `Active: active (running)` em verde

## ============================================================================
## PASSO 10: CRIAR USUÁRIO ADMINISTRADOR
## ============================================================================

### 10.1 Inicializar Admin

```bash
curl -X POST http://localhost:8001/api/init-admin
```

> Deve retornar informações do admin criado

## ============================================================================
## PASSO 11: TESTAR O SISTEMA
## ============================================================================

### 11.1 Abrir o Navegador

Abra o Firefox ou Chrome e acesse:

```
http://localhost
```

### 11.2 Fazer Login

- **Email:** `admin@falintil-fdtl.tl`
- **Senha:** `admin123`

### 11.3 Verificar se Tudo Funciona

1. ✅ Dashboard carrega com estatísticas
2. ✅ Menu lateral funciona
3. ✅ Pode criar novos membros
4. ✅ Pode fazer upload de fotos

## ============================================================================
## PASSO 12: COMANDOS ÚTEIS PARA O DIA A DIA
## ============================================================================

### Ver Status de Todos os Serviços

```bash
sudo systemctl status mongod falintil-backend nginx
```

### Reiniciar o Backend (após alterações)

```bash
sudo systemctl restart falintil-backend
```

### Ver Logs do Backend (erros e informações)

```bash
sudo journalctl -u falintil-backend -f
```
> Pressione `Ctrl + C` para sair

### Reiniciar Tudo

```bash
sudo systemctl restart mongod falintil-backend nginx
```

### Parar Todos os Serviços

```bash
sudo systemctl stop falintil-backend nginx
```

### Backup do Banco de Dados

```bash
mongodump --db falintil_pms --out ~/backup_$(date +%Y%m%d)
```

---
---
---

# PARTE 2: INSTALAÇÃO NO WINDOWS 10/11

## ============================================================================
## PASSO 1: BAIXAR E INSTALAR PYTHON
## ============================================================================

### 1.1 Baixar Python

1. Abra o navegador (Chrome, Edge, Firefox)
2. Acesse: **https://www.python.org/downloads/**
3. Clique no botão amarelo **"Download Python 3.11.x"**
4. O download começará automaticamente

### 1.2 Instalar Python

1. Abra a pasta de Downloads
2. Dê duplo clique em **"python-3.11.x-amd64.exe"**
3. **IMPORTANTE:** Marque a caixa **"Add Python to PATH"** na parte inferior
4. Clique em **"Install Now"**
5. Aguarde a instalação completar
6. Clique em **"Close"**

### 1.3 Verificar Instalação

1. Pressione `Windows + R`
2. Digite `cmd` e pressione Enter
3. No Prompt de Comando, digite:

```cmd
python --version
```
> Deve mostrar: `Python 3.11.x`

## ============================================================================
## PASSO 2: BAIXAR E INSTALAR NODE.JS
## ============================================================================

### 2.1 Baixar Node.js

1. Acesse: **https://nodejs.org/**
2. Clique no botão **"LTS"** (versão recomendada)
3. O download começará automaticamente

### 2.2 Instalar Node.js

1. Abra a pasta de Downloads
2. Dê duplo clique em **"node-v18.x.x-x64.msi"**
3. Clique em **"Next"** em todas as telas
4. Clique em **"Install"**
5. Clique em **"Finish"**

### 2.3 Verificar Instalação

1. Abra um **novo** Prompt de Comando (Windows + R, digite `cmd`)
2. Digite:

```cmd
node --version
```
> Deve mostrar: `v18.x.x`

```cmd
npm --version
```
> Deve mostrar: `9.x.x`

### 2.4 Instalar Yarn

No Prompt de Comando, digite:

```cmd
npm install -g yarn
```

Verifique:
```cmd
yarn --version
```

## ============================================================================
## PASSO 3: BAIXAR E INSTALAR MONGODB
## ============================================================================

### 3.1 Baixar MongoDB

1. Acesse: **https://www.mongodb.com/try/download/community**
2. Selecione:
   - **Version:** 6.0.x (ou mais recente)
   - **Platform:** Windows
   - **Package:** msi
3. Clique em **"Download"**

### 3.2 Instalar MongoDB

1. Abra a pasta de Downloads
2. Dê duplo clique em **"mongodb-windows-x86_64-6.0.x-signed.msi"**
3. Clique em **"Next"**
4. Aceite os termos e clique em **"Next"**
5. Selecione **"Complete"** e clique em **"Next"**
6. **IMPORTANTE:** Mantenha marcado:
   - ✅ **"Install MongoDB as a Service"**
   - ✅ **"Run service as Network Service user"**
7. Marque **"Install MongoDB Compass"** (opcional - interface gráfica)
8. Clique em **"Next"** e depois **"Install"**
9. Clique em **"Finish"**

### 3.3 Verificar se MongoDB está Funcionando

1. Pressione `Windows + R`
2. Digite `services.msc` e pressione Enter
3. Procure por **"MongoDB Server"**
4. Deve estar com Status: **"Em execução"**

## ============================================================================
## PASSO 4: BAIXAR E INSTALAR GIT
## ============================================================================

### 4.1 Baixar Git

1. Acesse: **https://git-scm.com/download/win**
2. O download começará automaticamente

### 4.2 Instalar Git

1. Dê duplo clique no instalador
2. Clique em **"Next"** em todas as telas (configurações padrão)
3. Clique em **"Install"**
4. Clique em **"Finish"**

## ============================================================================
## PASSO 5: COPIAR ARQUIVOS DO PROJETO
## ============================================================================

### 5.1 Criar Pasta do Projeto

1. Abra o **Explorador de Arquivos** (Windows + E)
2. Navegue até **"Este Computador"** > **"Disco Local (C:)"**
3. Clique com botão direito > **"Nova pasta"**
4. Nomeie como: **"falintil-pms"**

### 5.2 Copiar Arquivos

**Se os arquivos estão em um Pendrive:**
1. Abra o pendrive
2. Selecione as pastas **"backend"** e **"frontend"**
3. Pressione `Ctrl + C` (copiar)
4. Navegue até `C:\falintil-pms`
5. Pressione `Ctrl + V` (colar)

**Estrutura Final:**
```
C:\falintil-pms\
├── backend\
│   ├── server.py
│   ├── requirements.txt
│   └── ...
└── frontend\
    ├── src\
    ├── package.json
    └── ...
```

## ============================================================================
## PASSO 6: CONFIGURAR O BACKEND
## ============================================================================

### 6.1 Abrir PowerShell como Administrador

1. Clique no menu Iniciar
2. Digite **"PowerShell"**
3. Clique com botão direito em **"Windows PowerShell"**
4. Selecione **"Executar como administrador"**
5. Clique em **"Sim"** se aparecer a pergunta de segurança

### 6.2 Navegar até a Pasta do Backend

```powershell
cd C:\falintil-pms\backend
```

### 6.3 Criar Ambiente Virtual

```powershell
python -m venv venv
```

### 6.4 Ativar Ambiente Virtual

```powershell
.\venv\Scripts\Activate.ps1
```

> Se aparecer erro de política de execução, execute primeiro:
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```
> Digite **"S"** para confirmar, depois tente ativar novamente.

Você verá **(venv)** no início da linha.

### 6.5 Atualizar Pip

```powershell
pip install --upgrade pip
```

### 6.6 Instalar Dependências

```powershell
pip install -r requirements.txt
```
> Aguarde a instalação completar

### 6.7 Criar Arquivo de Configuração

1. Abra o **Bloco de Notas**
2. Cole o seguinte conteúdo:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave-secreta-muito-segura-falintil-2026
CORS_ORIGINS=http://localhost:3000,http://localhost
```

3. Clique em **Arquivo** > **Salvar como...**
4. Navegue até `C:\falintil-pms\backend`
5. Em **"Nome do arquivo"**, digite: `.env`
6. Em **"Tipo"**, selecione: **"Todos os arquivos (*.*)"**
7. Clique em **"Salvar"**

### 6.8 Testar o Backend

No PowerShell (ainda na pasta backend com venv ativado):

```powershell
uvicorn server:app --host 0.0.0.0 --port 8001
```

Abra o navegador e acesse: **http://localhost:8001/api/**

Deve mostrar: `{"message":"FALINTIL-FDTL PMS API","version":"1.0.0"}`

**Pressione `Ctrl + C` no PowerShell para parar**

## ============================================================================
## PASSO 7: CONFIGURAR O FRONTEND
## ============================================================================

### 7.1 Abrir Novo PowerShell como Administrador

(Mantenha o anterior aberto, abra um novo)

### 7.2 Navegar até a Pasta do Frontend

```powershell
cd C:\falintil-pms\frontend
```

### 7.3 Criar Arquivo de Configuração

1. Abra o **Bloco de Notas**
2. Cole o seguinte conteúdo:

```
REACT_APP_BACKEND_URL=http://localhost:8001
```

3. Salve como `.env` em `C:\falintil-pms\frontend`
   - Nome: `.env`
   - Tipo: **Todos os arquivos**

### 7.4 Instalar Dependências

```powershell
yarn install
```
> Aguarde a instalação

### 7.5 Criar Build de Produção

```powershell
yarn build
```
> Isso cria a pasta "build"

## ============================================================================
## PASSO 8: INSTALAR NSSM (GERENCIADOR DE SERVIÇOS)
## ============================================================================

### 8.1 Baixar NSSM

1. Acesse: **https://nssm.cc/download**
2. Clique em **"nssm 2.24 (2014-08-31)"**
3. Extraia o arquivo ZIP para `C:\nssm`

### 8.2 Criar Serviço do Backend

No PowerShell (como Administrador):

```powershell
C:\nssm\win64\nssm.exe install FALINTIL-Backend
```

Uma janela abrirá. Preencha:

**Aba Application:**
- **Path:** `C:\falintil-pms\backend\venv\Scripts\uvicorn.exe`
- **Startup directory:** `C:\falintil-pms\backend`
- **Arguments:** `server:app --host 0.0.0.0 --port 8001`

Clique em **"Install service"**

### 8.3 Iniciar o Serviço

```powershell
C:\nssm\win64\nssm.exe start FALINTIL-Backend
```

## ============================================================================
## PASSO 9: CONFIGURAR SERVIDOR WEB SIMPLES (SERVE)
## ============================================================================

### 9.1 Instalar Serve Globalmente

```powershell
npm install -g serve
```

### 9.2 Criar Script de Inicialização do Frontend

1. Abra o Bloco de Notas
2. Cole:

```batch
@echo off
cd C:\falintil-pms\frontend\build
serve -s . -l 80
```

3. Salve como `iniciar-frontend.bat` em `C:\falintil-pms`

### 9.3 Criar Serviço do Frontend com NSSM

```powershell
C:\nssm\win64\nssm.exe install FALINTIL-Frontend
```

**Aba Application:**
- **Path:** `C:\Users\[SEU_USUARIO]\AppData\Roaming\npm\serve.cmd`
- **Startup directory:** `C:\falintil-pms\frontend\build`
- **Arguments:** `-s . -l 80`

Clique em **"Install service"**

```powershell
C:\nssm\win64\nssm.exe start FALINTIL-Frontend
```

## ============================================================================
## PASSO 10: CONFIGURAR FIREWALL
## ============================================================================

### 10.1 Abrir Configurações de Firewall

1. Pressione `Windows + R`
2. Digite `wf.msc` e pressione Enter

### 10.2 Criar Regra para HTTP (Porta 80)

1. Clique em **"Regras de Entrada"** (lado esquerdo)
2. Clique em **"Nova Regra..."** (lado direito)
3. Selecione **"Porta"** > **Avançar**
4. Selecione **"TCP"** e digite **"80, 8001"** > **Avançar**
5. Selecione **"Permitir a conexão"** > **Avançar**
6. Marque todas as opções (Domínio, Particular, Público) > **Avançar**
7. Nome: **"FALINTIL-PMS"** > **Concluir**

## ============================================================================
## PASSO 11: CRIAR USUÁRIO ADMINISTRADOR
## ============================================================================

### 11.1 Abrir PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:8001/api/init-admin" -Method Post
```

## ============================================================================
## PASSO 12: TESTAR O SISTEMA
## ============================================================================

### 12.1 Acessar o Sistema

Abra o navegador e acesse:

```
http://localhost
```

### 12.2 Fazer Login

- **Email:** `admin@falintil-fdtl.tl`
- **Senha:** `admin123`

## ============================================================================
## PASSO 13: COMANDOS ÚTEIS NO WINDOWS
## ============================================================================

### Verificar Status dos Serviços

```powershell
Get-Service -Name "FALINTIL*"
```

Ou abra `services.msc` e procure por "FALINTIL"

### Reiniciar Backend

```powershell
Restart-Service -Name "FALINTIL-Backend"
```

### Parar Serviços

```powershell
Stop-Service -Name "FALINTIL-Backend"
Stop-Service -Name "FALINTIL-Frontend"
```

### Iniciar Serviços

```powershell
Start-Service -Name "FALINTIL-Backend"
Start-Service -Name "FALINTIL-Frontend"
```

### Backup do Banco de Dados

```powershell
& "C:\Program Files\MongoDB\Server\6.0\bin\mongodump.exe" --db falintil_pms --out C:\backup_falintil
```

---

# RESUMO FINAL

## Credenciais de Acesso

| Item | Valor |
|------|-------|
| **URL** | http://localhost |
| **Email** | admin@falintil-fdtl.tl |
| **Senha** | admin123 |

## Portas Utilizadas

| Porta | Serviço |
|-------|---------|
| 80 | Frontend (Web) |
| 8001 | Backend (API) |
| 27017 | MongoDB (Banco) |

## O que Fazer se Algo der Errado

### Backend não inicia
1. Verifique se MongoDB está rodando
2. Verifique se a porta 8001 não está em uso
3. Verifique os logs do serviço

### Frontend não carrega
1. Verifique se o build foi criado
2. Verifique se a porta 80 não está em uso
3. Tente acessar http://localhost:8001/api/ para testar a API

### Erro de conexão com banco
1. Verifique se MongoDB está rodando
2. Verifique o arquivo .env do backend

---

**IMPORTANTE:** Após o primeiro acesso, altere a senha do administrador!
