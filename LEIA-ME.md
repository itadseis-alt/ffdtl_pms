# FALINTIL-FDTL PMS - Guia Rápido de Instalação

## Arquivos Disponíveis

| Arquivo | Descrição |
|---------|-----------|
| `GUIA_INSTALACAO.md` | Guia completo passo a passo |
| `install-linux.sh` | Script automático para Linux |
| `install-windows.bat` | Script automático para Windows |

---

## Instalação Rápida - Linux

```bash
# 1. Copie os arquivos para o servidor
scp -r falintil-pms/ usuario@servidor:/opt/

# 2. Execute o instalador
cd /opt/falintil-pms
sudo bash install-linux.sh
```

---

## Instalação Rápida - Windows

1. Copie a pasta `falintil-pms` para `C:\`
2. Clique direito em `install-windows.bat` → "Executar como administrador"
3. Siga as instruções na tela

---

## Acesso ao Sistema

| Item | Valor |
|------|-------|
| **URL** | `http://[IP-DO-SERVIDOR]` |
| **Email** | `admin@falintil-fdtl.tl` |
| **Senha** | `admin123` |

⚠️ **Altere a senha após o primeiro acesso!**

---

## Comandos Úteis

### Linux
```bash
# Ver status dos serviços
sudo systemctl status mongod falintil-backend nginx

# Reiniciar backend
sudo systemctl restart falintil-backend

# Ver logs
sudo journalctl -u falintil-backend -f

# Backup manual
/opt/backups/backup.sh
```

### Windows
```cmd
# Ver status do serviço
sc query FALINTIL-Backend

# Reiniciar backend
net stop FALINTIL-Backend && net start FALINTIL-Backend

# Ver logs
C:\nssm\nssm.exe status FALINTIL-Backend
```

---

## Estrutura de Diretórios

```
/opt/falintil-pms/          (Linux)
C:\falintil-pms\            (Windows)
├── backend/
│   ├── server.py           # Servidor FastAPI
│   ├── requirements.txt    # Dependências Python
│   ├── .env               # Configurações
│   └── venv/              # Ambiente virtual
├── frontend/
│   ├── src/               # Código fonte React
│   ├── build/             # Build de produção
│   ├── package.json       # Dependências Node
│   └── .env               # Configurações
└── install-*.sh/.bat      # Scripts de instalação
```

---

## Portas Utilizadas

| Porta | Serviço |
|-------|---------|
| 80 | Nginx/IIS (Frontend + API) |
| 8001 | Backend FastAPI |
| 27017 | MongoDB |

---

## Suporte

Em caso de problemas, consulte o arquivo `GUIA_INSTALACAO.md` para instruções detalhadas de resolução.
