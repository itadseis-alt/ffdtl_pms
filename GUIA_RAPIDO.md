# FALINTIL-FDTL PMS - GUIA RÁPIDO DE INSTALAÇÃO

## 📋 CHECKLIST RÁPIDO

### ✅ Software Necessário
- [ ] Python 3.10+ 
- [ ] Node.js 18+
- [ ] MongoDB 6.0+
- [ ] Yarn

---

## 🐧 LINUX (Localhost)

```bash
# 1. Instalar tudo
sudo apt update
sudo apt install -y python3 python3-pip python3-venv mongodb-org
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs
sudo npm install -g yarn
sudo systemctl start mongod

# 2. Configurar Backend
cd ~/falintil-pms/backend
python3 -m venv venv && source venv/bin/activate
pip install -r requirements.txt
echo "MONGO_URL=mongodb://localhost:27017
DB_NAME=falintil_pms
JWT_SECRET=chave123
CORS_ORIGINS=http://localhost:3000" > .env

# 3. Configurar Frontend
cd ~/falintil-pms/frontend
echo "REACT_APP_BACKEND_URL=http://localhost:8001" > .env
yarn install

# 4. Iniciar (2 terminais)
# Terminal 1:
cd backend && source venv/bin/activate && uvicorn server:app --port 8001

# Terminal 2:
cd frontend && yarn start

# 5. Acessar: http://localhost:3000
```

---

## 🪟 WINDOWS (Localhost)

```powershell
# 1. Instalar Python, Node.js, MongoDB manualmente

# 2. Configurar Backend
cd C:\falintil-pms\backend
python -m venv venv
.\venv\Scripts\Activate.ps1
pip install -r requirements.txt
# Criar .env manualmente

# 3. Configurar Frontend
cd C:\falintil-pms\frontend
yarn install
# Criar .env manualmente

# 4. Iniciar (2 PowerShell)
# PS1: cd backend; .\venv\Scripts\Activate.ps1; uvicorn server:app --port 8001
# PS2: cd frontend; yarn start

# 5. Acessar: http://localhost:3000
```

---

## 🌐 ACESSO PELA REDE

1. **Descobrir IP:**
   - Linux: `hostname -I`
   - Windows: `ipconfig`

2. **Atualizar .env:**
   - Backend: `CORS_ORIGINS=http://192.168.1.X:3000`
   - Frontend: `REACT_APP_BACKEND_URL=http://192.168.1.X:8001`

3. **Liberar Firewall:**
   - Linux: `sudo ufw allow 3000,8001/tcp`
   - Windows: Firewall → Nova Regra → Portas 3000, 8001

4. **Acessar:** `http://192.168.1.X:3000`

---

## 🖥️ SERVIDOR (Produção)

### Linux
```bash
# Nginx + Systemd
sudo apt install nginx
# Copiar arquivos para /opt/falintil-pms
# Criar serviço systemd
# Configurar Nginx como proxy reverso
# Acessar: http://IP_SERVIDOR
```

### Windows
```powershell
# IIS + NSSM
# Instalar IIS via recursos do Windows
# Usar NSSM para criar serviço do backend
# Configurar site IIS apontando para frontend/build
# Acessar: http://IP_SERVIDOR
```

---

## 🔑 CREDENCIAIS

| | |
|---|---|
| **Email** | admin@falintil-fdtl.tl |
| **Senha** | admin123 |

---

## 🛠️ COMANDOS ÚTEIS

### Linux
```bash
sudo systemctl status falintil-backend   # Ver status
sudo systemctl restart falintil-backend  # Reiniciar
sudo journalctl -u falintil-backend -f   # Ver logs
```

### Windows
```powershell
Get-Service FALINTIL*                    # Ver status
Restart-Service FALINTIL-Backend         # Reiniciar
```

---

**Guia completo:** `GUIA_INSTALACAO_SIMPLES.md`
