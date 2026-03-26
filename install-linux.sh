#!/bin/bash
# =============================================================================
# FALINTIL-FDTL PMS - Script de Instalação Automática para Linux
# =============================================================================
# Uso: sudo bash install.sh
# =============================================================================

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variáveis de configuração
INSTALL_DIR="/opt/falintil-pms"
SERVER_IP=""
MONGO_DB="falintil_pms"
JWT_SECRET=$(openssl rand -hex 32)

# Função para exibir mensagens
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se é root
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "Este script deve ser executado como root (sudo)"
        exit 1
    fi
}

# Detectar IP do servidor
detect_ip() {
    SERVER_IP=$(hostname -I | awk '{print $1}')
    log_info "IP detectado: $SERVER_IP"
    
    read -p "Usar este IP? (s/n) [s]: " confirm
    confirm=${confirm:-s}
    
    if [ "$confirm" != "s" ]; then
        read -p "Digite o IP do servidor: " SERVER_IP
    fi
}

# Instalar dependências do sistema
install_dependencies() {
    log_info "Atualizando sistema..."
    apt update && apt upgrade -y
    
    log_info "Instalando dependências básicas..."
    apt install -y curl wget git build-essential software-properties-common gnupg
}

# Instalar Python
install_python() {
    log_info "Instalando Python 3.11..."
    add-apt-repository ppa:deadsnakes/ppa -y
    apt update
    apt install -y python3.11 python3.11-venv python3.11-dev python3-pip
}

# Instalar Node.js
install_nodejs() {
    log_info "Instalando Node.js 18.x..."
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt install -y nodejs
    npm install -g yarn
}

# Instalar MongoDB
install_mongodb() {
    log_info "Instalando MongoDB 6.0..."
    
    # Detectar versão do Ubuntu
    UBUNTU_VERSION=$(lsb_release -cs)
    
    curl -fsSL https://pgp.mongodb.com/server-6.0.asc | gpg -o /usr/share/keyrings/mongodb-server-6.0.gpg --dearmor
    
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-6.0.gpg ] https://repo.mongodb.org/apt/ubuntu ${UBUNTU_VERSION}/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
    
    apt update
    apt install -y mongodb-org
    
    systemctl start mongod
    systemctl enable mongod
}

# Instalar Nginx
install_nginx() {
    log_info "Instalando Nginx..."
    apt install -y nginx
}

# Configurar aplicação
setup_application() {
    log_info "Configurando aplicação..."
    
    # Criar diretório
    mkdir -p $INSTALL_DIR
    
    # Verificar se os arquivos já existem
    if [ ! -d "$INSTALL_DIR/backend" ]; then
        log_warn "Diretório backend não encontrado!"
        log_info "Por favor, copie os arquivos do projeto para $INSTALL_DIR"
        log_info "Estrutura esperada:"
        log_info "  $INSTALL_DIR/backend/"
        log_info "  $INSTALL_DIR/frontend/"
        exit 1
    fi
    
    # Configurar Backend
    log_info "Configurando backend..."
    cd $INSTALL_DIR/backend
    
    python3.11 -m venv venv
    source venv/bin/activate
    pip install --upgrade pip
    pip install -r requirements.txt
    
    # Criar .env do backend
    cat > .env << EOF
MONGO_URL=mongodb://localhost:27017
DB_NAME=${MONGO_DB}
JWT_SECRET=${JWT_SECRET}
CORS_ORIGINS=http://localhost:3000,http://${SERVER_IP}:3000,http://${SERVER_IP}
EOF
    
    deactivate
    
    # Configurar Frontend
    log_info "Configurando frontend..."
    cd $INSTALL_DIR/frontend
    
    # Criar .env do frontend
    cat > .env << EOF
REACT_APP_BACKEND_URL=http://${SERVER_IP}
EOF
    
    yarn install
    yarn build
}

# Configurar Nginx
setup_nginx() {
    log_info "Configurando Nginx..."
    
    cat > /etc/nginx/sites-available/falintil-pms << EOF
server {
    listen 80;
    server_name ${SERVER_IP};

    # Frontend
    location / {
        root ${INSTALL_DIR}/frontend/build;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://127.0.0.1:8001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_cache_bypass \$http_upgrade;
        client_max_body_size 50M;
    }
}
EOF
    
    ln -sf /etc/nginx/sites-available/falintil-pms /etc/nginx/sites-enabled/
    rm -f /etc/nginx/sites-enabled/default
    
    nginx -t
    systemctl restart nginx
    systemctl enable nginx
}

# Criar serviço do backend
setup_backend_service() {
    log_info "Criando serviço do backend..."
    
    cat > /etc/systemd/system/falintil-backend.service << EOF
[Unit]
Description=FALINTIL-FDTL PMS Backend
After=network.target mongod.service

[Service]
Type=simple
User=root
WorkingDirectory=${INSTALL_DIR}/backend
Environment="PATH=${INSTALL_DIR}/backend/venv/bin"
ExecStart=${INSTALL_DIR}/backend/venv/bin/uvicorn server:app --host 0.0.0.0 --port 8001
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF
    
    systemctl daemon-reload
    systemctl start falintil-backend
    systemctl enable falintil-backend
}

# Configurar firewall
setup_firewall() {
    log_info "Configurando firewall..."
    
    ufw allow 80/tcp
    ufw allow 443/tcp
    ufw allow 22/tcp
    ufw --force enable
}

# Inicializar admin
init_admin() {
    log_info "Aguardando backend iniciar..."
    sleep 5
    
    log_info "Criando usuário admin..."
    curl -s -X POST http://localhost:8001/api/init-admin
}

# Criar script de backup
create_backup_script() {
    log_info "Criando script de backup..."
    
    mkdir -p /opt/backups/mongodb
    
    cat > /opt/backups/backup.sh << 'EOF'
#!/bin/bash
BACKUP_DIR="/opt/backups/mongodb"
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --db falintil_pms --out $BACKUP_DIR/$DATE
# Manter apenas os últimos 7 dias
find $BACKUP_DIR -type d -mtime +7 -exec rm -rf {} \;
EOF
    
    chmod +x /opt/backups/backup.sh
    
    # Agendar backup diário às 2h
    (crontab -l 2>/dev/null; echo "0 2 * * * /opt/backups/backup.sh") | crontab -
}

# Exibir resumo
show_summary() {
    echo ""
    echo "=============================================="
    echo -e "${GREEN}INSTALAÇÃO CONCLUÍDA COM SUCESSO!${NC}"
    echo "=============================================="
    echo ""
    echo "Acesse o sistema:"
    echo "  URL: http://${SERVER_IP}"
    echo ""
    echo "Credenciais padrão:"
    echo "  Email: admin@falintil-fdtl.tl"
    echo "  Senha: admin123"
    echo ""
    echo "IMPORTANTE: Altere a senha após o primeiro acesso!"
    echo ""
    echo "Comandos úteis:"
    echo "  Status:   sudo systemctl status falintil-backend"
    echo "  Logs:     sudo journalctl -u falintil-backend -f"
    echo "  Restart:  sudo systemctl restart falintil-backend"
    echo ""
    echo "Backup manual: /opt/backups/backup.sh"
    echo "=============================================="
}

# Main
main() {
    echo "=============================================="
    echo "FALINTIL-FDTL PMS - Instalador Automático"
    echo "=============================================="
    echo ""
    
    check_root
    detect_ip
    
    echo ""
    log_info "Iniciando instalação..."
    echo ""
    
    install_dependencies
    install_python
    install_nodejs
    install_mongodb
    install_nginx
    setup_application
    setup_nginx
    setup_backend_service
    setup_firewall
    init_admin
    create_backup_script
    
    show_summary
}

# Executar
main "$@"
