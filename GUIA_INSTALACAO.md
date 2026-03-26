# FALINTIL-FDTL PMS - Guia de Instalação Local
## Sistema de Gestão de Pessoal Militar

---

# ÍNDICE

1. [Requisitos do Sistema](#1-requisitos-do-sistema)
2. [Instalação no Linux (Ubuntu/Debian)](#2-instalação-no-linux-ubuntudebian)
3. [Instalação no Windows](#3-instalação-no-windows)
4. [Configuração do MongoDB](#4-configuração-do-mongodb)
5. [Configuração da Rede Interna](#5-configuração-da-rede-interna)
6. [Execução do Sistema](#6-execução-do-sistema)
7. [Acesso pela Rede Interna](#7-acesso-pela-rede-interna)
8. [Manutenção e Backup](#8-manutenção-e-backup)
9. [Resolução de Problemas](#9-resolução-de-problemas)

---

# 1. REQUISITOS DO SISTEMA

## Hardware Mínimo (Servidor)
- **Processador:** 2 cores (recomendado 4 cores)
- **Memória RAM:** 4 GB (recomendado 8 GB)
- **Disco:** 50 GB SSD (recomendado 100 GB para arquivos)
- **Rede:** Placa de rede Gigabit

## Software Necessário
| Componente | Versão Mínima |
|------------|---------------|
| Python | 3.10+ |
| Node.js | 18.x+ |
| MongoDB | 6.0+ |
| Git | 2.x |

---

# 2. INSTALAÇÃO NO LINUX (Ubuntu/Debian)

## Passo 2.1: Atualizar o Sistema

```bash
sudo apt update && sudo apt upgrade -y
```

## Passo 2.2: Instalar Dependências Básicas

```bash
sudo apt install -y curl wget git build-essential software-properties-common
```

## Passo 2.3: Instalar Python 3.10+

```bash
# Verificar versão atual
python3 --version

# Se necessário instalar Python 3.10+
sudo add-apt-repository ppa:deadsnakes/ppa -y
sudo apt update
sudo apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
```

## Passo 2.4: Instalar Node.js 18.x

```bash
# Usando NodeSource
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Verificar instalação
node --version
npm --version

# Instalar Yarn (gerenciador de pacotes)
sudo npm install -g yarn
```

## Passo 2.5: Instalar MongoDB 6.0

```bash
# Importar chave GPG do MongoDB
curl -fsSL https://pgp.mongodb.com/server-6.0.asc | sudo gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor

# Adicionar repositório (Ubuntu 22.04)
echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Instalar MongoDB
sudo apt update
sudo apt install -y mongodb-org

# Iniciar e habilitar MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod

# Verificar status
sudo systemctl status mongod
```

## Passo 2.6: Criar Diretório do Projeto

```bash
# Criar diretório para a aplicação
sudo mkdir -p /opt/falintil-pms
sudo chown $USER:$USER /opt/falintil-pms
cd /opt/falintil-pms
```

## Passo 2.7: Copiar Arquivos do Projeto

```bash
# Opção 1: Copiar de um pendrive/disco
cp -r /media/usb/falintil-pms/* /opt/falintil-pms/

# Opção 2: Clonar do repositório (se disponível)
# git clone https://seu-repositorio.git /opt/falintil-pms
```

## Passo 2.8: Configurar Backend

```bash
cd /opt/falintil-pms/backend

# Criar ambiente virtual Python
python3.11 -m venv venv

# Ativar ambiente virtual
source venv/bin/activate

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt
```

## Passo 2.9: Configurar Variáveis de Ambiente do Backend

```bash
# Criar arquivo .env
cat > /opt/falintil-pms/backend/.env << 'EOF'
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-2026
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
EOF
```

**IMPORTANTE:** Substitua `192.168.1.100` pelo IP do seu servidor na rede interna.

## Passo 2.10: Configurar Frontend

```bash
cd /opt/falintil-pms/frontend

# Instalar dependências
yarn install
```

## Passo 2.11: Configurar Variáveis de Ambiente do Frontend

```bash
# Criar arquivo .env
cat > /opt/falintil-pms/frontend/.env << 'EOF'
REACT_APP_BACKEND_URL=http://192.168.1.100:8001
EOF
```

**IMPORTANTE:** Substitua `192.168.1.100` pelo IP do seu servidor.

## Passo 2.12: Build do Frontend para Produção

```bash
cd /opt/falintil-pms/frontend

# Criar build de produção
yarn build
```

## Passo 2.13: Instalar e Configurar Nginx

```bash
# Instalar Nginx
sudo apt install -y nginx

# Criar configuração do site
sudo tee /etc/nginx/sites-available/falintil-pms << 'EOF'
server {
    listen 80;
    server_name 192.168.1.100;  # Altere para o IP do servidor

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        client_max_body_size 50M;
    }
}
EOF

# Ativar site
sudo ln -sf /etc/nginx/sites-available/falintil-pms /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default

# Testar configuração
sudo nginx -t

# Reiniciar Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## Passo 2.14: Criar Serviço do Backend (Systemd)

```bash
sudo tee /etc/systemd/system/falintil-backend.service << 'EOF'
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
EOF

# Recarregar systemd
sudo systemctl daemon-reload

# Iniciar e habilitar serviço
sudo systemctl start falintil-backend
sudo systemctl enable falintil-backend

# Verificar status
sudo systemctl status falintil-backend
```

## Passo 2.15: Configurar Firewall

```bash
# Permitir portas necessárias
sudo ufw allow 80/tcp      # HTTP
sudo ufw allow 443/tcp     # HTTPS (futuro)
sudo ufw allow 22/tcp      # SSH (administração)

# Ativar firewall
sudo ufw enable

# Verificar status
sudo ufw status
```

## Passo 2.16: Inicializar Admin

```bash
# Criar usuário admin inicial
curl -X POST http://localhost:8001/api/init-admin
```

---

# 3. INSTALAÇÃO NO WINDOWS

## Passo 3.1: Baixar e Instalar Softwares

### 3.1.1 Python 3.11+
1. Acesse: https://www.python.org/downloads/
2. Baixe Python 3.11.x (Windows installer 64-bit)
3. Execute o instalador
4. **IMPORTANTE:** Marque "Add Python to PATH"
5. Clique em "Install Now"

### 3.1.2 Node.js 18.x
1. Acesse: https://nodejs.org/
2. Baixe a versão LTS (18.x ou superior)
3. Execute o instalador
4. Aceite as configurações padrão

### 3.1.3 MongoDB 6.0
1. Acesse: https://www.mongodb.com/try/download/community
2. Selecione:
   - Version: 6.0.x
   - Platform: Windows
   - Package: MSI
3. Execute o instalador
4. Selecione "Complete" installation
5. Marque "Install MongoDB as a Service"
6. Marque "Install MongoDB Compass" (opcional - interface gráfica)

### 3.1.4 Git
1. Acesse: https://git-scm.com/download/win
2. Baixe e execute o instalador
3. Aceite as configurações padrão

## Passo 3.2: Criar Diretório do Projeto

```cmd
# Abrir PowerShell como Administrador

# Criar diretório
mkdir C:\falintil-pms
cd C:\falintil-pms
```

## Passo 3.3: Copiar Arquivos do Projeto

```cmd
# Copiar arquivos do pendrive/disco para C:\falintil-pms
# Ou usar o Windows Explorer para copiar as pastas 'backend' e 'frontend'
```

## Passo 3.4: Configurar Backend

```cmd
# Abrir PowerShell como Administrador
cd C:\falintil-pms\backend

# Criar ambiente virtual
python -m venv venv

# Ativar ambiente virtual
.\venv\Scripts\activate

# Instalar dependências
pip install --upgrade pip
pip install -r requirements.txt
```

## Passo 3.5: Criar Arquivo .env do Backend

Crie o arquivo `C:\falintil-pms\backend\.env` com o seguinte conteúdo:

```
MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=sua-chave-secreta-muito-segura-aqui-2026
CORS_ORIGINS=http://localhost:3000,http://192.168.1.100:3000
```

**IMPORTANTE:** Substitua `192.168.1.100` pelo IP do servidor Windows.

## Passo 3.6: Configurar Frontend

```cmd
# Abrir novo PowerShell como Administrador
cd C:\falintil-pms\frontend

# Instalar Yarn globalmente
npm install -g yarn

# Instalar dependências
yarn install
```

## Passo 3.7: Criar Arquivo .env do Frontend

Crie o arquivo `C:\falintil-pms\frontend\.env` com o seguinte conteúdo:

```
REACT_APP_BACKEND_URL=http://192.168.1.100:8001
```

## Passo 3.8: Build do Frontend

```cmd
cd C:\falintil-pms\frontend
yarn build
```

## Passo 3.9: Instalar IIS (Servidor Web)

1. Abra o **Painel de Controle**
2. Vá em **Programas** > **Ativar ou desativar recursos do Windows**
3. Marque **Serviços de Informações da Internet**
4. Expanda e marque também:
   - Ferramentas de Gerenciamento da Web > Console de Gerenciamento do IIS
   - Serviços da World Wide Web > Recursos de Desenvolvimento de Aplicativos > ASP.NET
5. Clique OK e aguarde a instalação

## Passo 3.10: Configurar IIS para o Frontend

1. Abra o **Gerenciador do IIS** (inetmgr)
2. Clique com botão direito em **Sites** > **Adicionar Site**
3. Configure:
   - Nome do site: `FALINTIL-PMS`
   - Caminho físico: `C:\falintil-pms\frontend\build`
   - Associação: Tipo HTTP, IP: Todos não atribuídos, Porta: 80
4. Clique OK

## Passo 3.11: Configurar URL Rewrite (IIS)

1. Baixe e instale o URL Rewrite Module: https://www.iis.net/downloads/microsoft/url-rewrite
2. No Gerenciador do IIS, selecione o site FALINTIL-PMS
3. Clique em "URL Rewrite"
4. Adicione uma regra de reescrita para SPA

Crie o arquivo `C:\falintil-pms\frontend\build\web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Passo 3.12: Configurar Reverse Proxy para API (IIS)

1. Instale o Application Request Routing (ARR):
   https://www.iis.net/downloads/microsoft/application-request-routing

2. No Gerenciador do IIS, selecione o servidor
3. Clique em "Application Request Routing"
4. Habilite o proxy

5. No site FALINTIL-PMS, adicione regra de URL Rewrite:

Adicione ao `web.config`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<configuration>
  <system.webServer>
    <rewrite>
      <rules>
        <rule name="API Proxy" stopProcessing="true">
          <match url="^api/(.*)" />
          <action type="Rewrite" url="http://localhost:8001/api/{R:1}" />
        </rule>
        <rule name="React Routes" stopProcessing="true">
          <match url=".*" />
          <conditions logicalGrouping="MatchAll">
            <add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" />
            <add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" />
            <add input="{REQUEST_URI}" pattern="^/api" negate="true" />
          </conditions>
          <action type="Rewrite" url="/index.html" />
        </rule>
      </rules>
    </rewrite>
  </system.webServer>
</configuration>
```

## Passo 3.13: Criar Serviço do Backend (NSSM)

1. Baixe NSSM (Non-Sucking Service Manager):
   https://nssm.cc/download

2. Extraia para `C:\nssm`

3. Abra PowerShell como Administrador:

```cmd
# Instalar o backend como serviço Windows
C:\nssm\win64\nssm.exe install FALINTIL-Backend

# Na janela que abrir, configure:
# Path: C:\falintil-pms\backend\venv\Scripts\uvicorn.exe
# Startup directory: C:\falintil-pms\backend
# Arguments: server:app --host 0.0.0.0 --port 8001

# Ou via linha de comando:
C:\nssm\win64\nssm.exe install FALINTIL-Backend "C:\falintil-pms\backend\venv\Scripts\uvicorn.exe" "server:app --host 0.0.0.0 --port 8001"
C:\nssm\win64\nssm.exe set FALINTIL-Backend AppDirectory "C:\falintil-pms\backend"

# Iniciar o serviço
C:\nssm\win64\nssm.exe start FALINTIL-Backend
```

## Passo 3.14: Configurar Firewall do Windows

1. Abra o **Windows Defender Firewall com Segurança Avançada**
2. Clique em **Regras de Entrada** > **Nova Regra**
3. Selecione **Porta** > Próximo
4. Selecione **TCP**, Portas específicas: `80, 8001`
5. Permitir conexão > Próximo
6. Marque todos os perfis > Próximo
7. Nome: `FALINTIL-PMS` > Concluir

## Passo 3.15: Inicializar Admin

```cmd
# Abrir PowerShell
Invoke-RestMethod -Uri "http://localhost:8001/api/init-admin" -Method Post
```

---

# 4. CONFIGURAÇÃO DO MONGODB

## 4.1 Criar Usuário de Banco de Dados (Recomendado para Produção)

```bash
# Linux
mongosh

# Windows
# Abra o MongoDB Compass ou mongosh
```

Execute os comandos:

```javascript
// Conectar ao admin
use admin

// Criar usuário administrador
db.createUser({
  user: "falintil_admin",
  pwd: "senha_segura_aqui",
  roles: [
    { role: "userAdminAnyDatabase", db: "admin" },
    { role: "readWriteAnyDatabase", db: "admin" }
  ]
})

// Criar banco de dados e usuário específico
use falintil_pms

db.createUser({
  user: "falintil_app",
  pwd: "senha_app_segura_aqui",
  roles: [{ role: "readWrite", db: "falintil_pms" }]
})
```

## 4.2 Atualizar String de Conexão

Atualize o arquivo `.env` do backend:

```
MONGO_URL=mongodb://falintil_app:senha_app_segura_aqui@localhost:27017/falintil_pms?authSource=falintil_pms
```

---

# 5. CONFIGURAÇÃO DA REDE INTERNA

## 5.1 Descobrir o IP do Servidor

### Linux:
```bash
ip addr show
# ou
hostname -I
```

### Windows:
```cmd
ipconfig
```

Anote o IP da interface de rede (exemplo: `192.168.1.100`)

## 5.2 Configurar IP Estático (Recomendado)

### Linux (Netplan - Ubuntu 20.04+):

```bash
sudo nano /etc/netplan/01-network-config.yaml
```

```yaml
network:
  version: 2
  ethernets:
    enp0s3:  # Nome da interface (verifique com: ip link)
      addresses:
        - 192.168.1.100/24
      gateway4: 192.168.1.1
      nameservers:
        addresses:
          - 8.8.8.8
          - 8.8.4.4
```

```bash
sudo netplan apply
```

### Windows:
1. Painel de Controle > Rede e Internet > Central de Rede
2. Clique na conexão ativa > Propriedades
3. Selecione "Protocolo IP Versão 4 (TCP/IPv4)" > Propriedades
4. Selecione "Usar o seguinte endereço IP"
5. Configure:
   - Endereço IP: 192.168.1.100
   - Máscara: 255.255.255.0
   - Gateway: 192.168.1.1
   - DNS: 8.8.8.8

## 5.3 Atualizar Configurações do Sistema

### Backend (.env):
```
CORS_ORIGINS=http://192.168.1.100,http://192.168.1.100:80,http://localhost:3000
```

### Frontend (.env):
```
REACT_APP_BACKEND_URL=http://192.168.1.100
```

**Nota:** Se usar Nginx/IIS, o frontend pode usar o mesmo IP sem porta (porta 80 é padrão).

---

# 6. EXECUÇÃO DO SISTEMA

## 6.1 Linux - Iniciar Todos os Serviços

```bash
# Verificar MongoDB
sudo systemctl status mongod

# Verificar Backend
sudo systemctl status falintil-backend

# Verificar Nginx
sudo systemctl status nginx

# Se algum não estiver rodando:
sudo systemctl start mongod
sudo systemctl start falintil-backend
sudo systemctl start nginx
```

## 6.2 Windows - Iniciar Todos os Serviços

1. **MongoDB:** Serviço inicia automaticamente
   - Verificar: `services.msc` > MongoDB Server

2. **Backend:** 
   - Verificar: `services.msc` > FALINTIL-Backend
   - Ou: `nssm status FALINTIL-Backend`

3. **IIS:**
   - Verificar: Gerenciador do IIS > Sites > FALINTIL-PMS (deve estar verde)

---

# 7. ACESSO PELA REDE INTERNA

## 7.1 Do Servidor (localhost)

```
http://localhost
```

## 7.2 De Outros Computadores na Rede

```
http://192.168.1.100
```

(Substitua pelo IP real do servidor)

## 7.3 Credenciais Padrão

- **Email:** admin@falintil-fdtl.tl
- **Senha:** admin123

**IMPORTANTE:** Altere a senha do admin após o primeiro acesso!

---

# 8. MANUTENÇÃO E BACKUP

## 8.1 Backup do Banco de Dados

### Linux:
```bash
# Criar diretório de backup
mkdir -p /opt/backups/mongodb

# Backup completo
mongodump --db falintil_pms --out /opt/backups/mongodb/$(date +%Y%m%d_%H%M%S)

# Agendar backup diário (cron)
crontab -e
# Adicionar linha:
0 2 * * * mongodump --db falintil_pms --out /opt/backups/mongodb/$(date +\%Y\%m\%d)
```

### Windows:
```cmd
# Criar pasta de backup
mkdir C:\backups\mongodb

# Backup
"C:\Program Files\MongoDB\Server\6.0\bin\mongodump.exe" --db falintil_pms --out C:\backups\mongodb\%date:~-4%%date:~3,2%%date:~0,2%
```

## 8.2 Restaurar Backup

```bash
# Linux
mongorestore --db falintil_pms /opt/backups/mongodb/20260326/falintil_pms

# Windows
mongorestore --db falintil_pms C:\backups\mongodb\20260326\falintil_pms
```

## 8.3 Logs do Sistema

### Linux:
```bash
# Logs do backend
sudo journalctl -u falintil-backend -f

# Logs do Nginx
sudo tail -f /var/log/nginx/error.log
sudo tail -f /var/log/nginx/access.log

# Logs do MongoDB
sudo tail -f /var/log/mongodb/mongod.log
```

### Windows:
- Backend: Visualizador de Eventos > Logs do Windows > Aplicativo
- IIS: `C:\inetpub\logs\LogFiles`
- MongoDB: `C:\Program Files\MongoDB\Server\6.0\log`

---

# 9. RESOLUÇÃO DE PROBLEMAS

## Problema: "Conexão recusada"

**Causa:** Serviço não está rodando ou firewall bloqueando

**Solução:**
```bash
# Linux
sudo systemctl status falintil-backend
sudo systemctl restart falintil-backend
sudo ufw status

# Windows
services.msc  # Verificar serviços
netsh advfirewall firewall show rule name=all | findstr "FALINTIL"
```

## Problema: "CORS Error" no navegador

**Causa:** Configuração de CORS incorreta

**Solução:**
Verifique o arquivo `backend/.env`:
```
CORS_ORIGINS=http://192.168.1.100,http://192.168.1.100:80
```

Reinicie o backend após alteração.

## Problema: Página em branco no frontend

**Causa:** Build não foi feito ou caminho incorreto

**Solução:**
```bash
# Rebuild do frontend
cd /opt/falintil-pms/frontend  # ou C:\falintil-pms\frontend
yarn build

# Verificar se arquivos existem
ls build/  # Linux
dir build  # Windows
```

## Problema: MongoDB não conecta

**Causa:** Serviço parado ou autenticação incorreta

**Solução:**
```bash
# Linux
sudo systemctl status mongod
sudo systemctl restart mongod

# Testar conexão
mongosh
```

## Problema: Upload de arquivos falha

**Causa:** Limite de tamanho ou permissões

**Solução:**
```bash
# Nginx - aumentar limite
sudo nano /etc/nginx/nginx.conf
# Adicionar dentro de http {}:
client_max_body_size 50M;

sudo systemctl restart nginx
```

---

# RESUMO DE COMANDOS

## Linux - Comandos Úteis

```bash
# Status dos serviços
sudo systemctl status mongod falintil-backend nginx

# Reiniciar tudo
sudo systemctl restart mongod falintil-backend nginx

# Ver logs em tempo real
sudo journalctl -u falintil-backend -f

# Verificar portas em uso
sudo netstat -tlnp | grep -E '80|8001|27017'
```

## Windows - Comandos Úteis

```cmd
# Status dos serviços
sc query MongoDB
sc query FALINTIL-Backend

# Reiniciar serviços
net stop FALINTIL-Backend && net start FALINTIL-Backend

# Verificar portas em uso
netstat -an | findstr "80 8001 27017"
```

---

# CONTATOS E SUPORTE

Para suporte técnico adicional:
- Documentação do MongoDB: https://docs.mongodb.com/
- Documentação do FastAPI: https://fastapi.tiangolo.com/
- Documentação do React: https://react.dev/

---

**Documento criado em:** Março 2026
**Versão:** 1.0
**Sistema:** FALINTIL-FDTL Personal Management System
