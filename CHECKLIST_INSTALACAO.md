# FALINTIL-FDTL PMS - CHECKLIST DE INSTALAÇÃO

## LINUX (Ubuntu)

### Preparação do Sistema
- [ ] Terminal aberto (`Ctrl + Alt + T`)
- [ ] Sistema atualizado (`sudo apt update && sudo apt upgrade -y`)
- [ ] Ferramentas básicas instaladas

### Instalação de Software
- [ ] Python 3.11 instalado (`python3.11 --version`)
- [ ] Node.js 18 instalado (`node --version`)
- [ ] Yarn instalado (`yarn --version`)
- [ ] MongoDB 6 instalado e rodando (`sudo systemctl status mongod`)
- [ ] Nginx instalado (`sudo systemctl status nginx`)

### Configuração do Projeto
- [ ] Pasta criada (`/opt/falintil-pms`)
- [ ] Arquivos copiados (backend e frontend)

### Backend
- [ ] Ambiente virtual criado (`python3.11 -m venv venv`)
- [ ] Ambiente ativado (`source venv/bin/activate`)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` criado com:
  ```
  MONGO_URL=mongodb://localhost:27017
  DB_NAME=falintil_pms
  JWT_SECRET=sua-chave-secreta
  CORS_ORIGINS=http://localhost:3000,http://localhost
  ```
- [ ] Teste manual OK (`uvicorn server:app --port 8001`)

### Frontend
- [ ] Arquivo `.env` criado com:
  ```
  REACT_APP_BACKEND_URL=http://localhost:8001
  ```
- [ ] Dependências instaladas (`yarn install`)
- [ ] Build criado (`yarn build`)

### Serviços
- [ ] Nginx configurado (`/etc/nginx/sites-available/falintil-pms`)
- [ ] Site ativado (`ln -sf ...`)
- [ ] Nginx testado (`sudo nginx -t`)
- [ ] Serviço backend criado (`/etc/systemd/system/falintil-backend.service`)
- [ ] Serviço backend iniciado (`sudo systemctl start falintil-backend`)
- [ ] Serviços habilitados para auto-start

### Finalização
- [ ] Admin inicializado (`curl -X POST http://localhost:8001/api/init-admin`)
- [ ] Sistema acessível em `http://localhost`
- [ ] Login funcionando (admin@falintil-fdtl.tl / admin123)

---

## WINDOWS

### Preparação
- [ ] Conta de administrador disponível

### Instalação de Software
- [ ] Python 3.11 instalado (com PATH marcado!)
- [ ] Node.js 18 instalado
- [ ] Yarn instalado (`npm install -g yarn`)
- [ ] MongoDB 6 instalado (como serviço)
- [ ] Git instalado
- [ ] NSSM baixado e extraído em `C:\nssm`

### Configuração do Projeto
- [ ] Pasta criada (`C:\falintil-pms`)
- [ ] Arquivos copiados (backend e frontend)

### Backend
- [ ] PowerShell aberto como Administrador
- [ ] Ambiente virtual criado (`python -m venv venv`)
- [ ] Ambiente ativado (`.\venv\Scripts\Activate.ps1`)
- [ ] Dependências instaladas (`pip install -r requirements.txt`)
- [ ] Arquivo `.env` criado em `C:\falintil-pms\backend\.env`
- [ ] Teste manual OK (`uvicorn server:app --port 8001`)

### Frontend
- [ ] Arquivo `.env` criado em `C:\falintil-pms\frontend\.env`
- [ ] Dependências instaladas (`yarn install`)
- [ ] Build criado (`yarn build`)
- [ ] Serve instalado (`npm install -g serve`)

### Serviços Windows
- [ ] Serviço backend criado com NSSM
- [ ] Serviço backend iniciado
- [ ] Serviço frontend criado (opcional)
- [ ] Firewall configurado (portas 80, 8001)

### Finalização
- [ ] Admin inicializado (PowerShell: `Invoke-RestMethod ...`)
- [ ] Sistema acessível em `http://localhost`
- [ ] Login funcionando (admin@falintil-fdtl.tl / admin123)

---

## VERIFICAÇÃO FINAL

### Funcionalidades a Testar
- [ ] Login funciona
- [ ] Dashboard carrega com gráficos
- [ ] Menu lateral navega corretamente
- [ ] Criar novo membro funciona
- [ ] Upload de foto funciona
- [ ] Visualizar membro funciona
- [ ] Imprimir lista funciona
- [ ] Tema claro/escuro funciona

### Credenciais Padrão
```
URL:   http://localhost
Email: admin@falintil-fdtl.tl
Senha: admin123
```

⚠️ **ALTERE A SENHA APÓS O PRIMEIRO ACESSO!**
