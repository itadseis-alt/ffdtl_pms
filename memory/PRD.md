# FALINTIL-FDTL Personal Management System (PMS)
## PRD - Product Requirements Document

### Data de Criação: 2026-01-26

---

## 1. Visão Geral do Projeto

Sistema web de gestão de pessoal militar para FALINTIL-FDTL (Forças de Defesa de Timor-Leste).

### Stack Tecnológica
- **Backend:** FastAPI (Python)
- **Frontend:** React com Tailwind CSS + Shadcn/UI
- **Banco de Dados:** MongoDB
- **Autenticação:** JWT

---

## 2. User Personas

### Admin (Administrador)
- Gerencia usuários (RH e Superior)
- Acesso total ao sistema
- Pode editar/excluir membros
- Gerencia backups

### RH (Recursos Humanos)
- Cadastra e edita membros
- Não pode excluir membros
- Não pode gerenciar usuários

### Superior
- Apenas visualização
- Sem permissões de edição

---

## 3. Core Requirements (Implementados)

### 3.1 Autenticação e Autorização
- [x] Login com JWT
- [x] 3 níveis de acesso (Admin, RH, Superior)
- [x] Troca de senha
- [x] Desativação de usuários

### 3.2 Dashboard
- [x] Total de membros
- [x] Estatísticas por status (Ativo, Falecido, Separação, Reserva, Reforma)
- [x] Estatísticas por sexo
- [x] Gráficos por unidade
- [x] Gráficos por posto
- [x] Gráficos por tipo sanguíneo
- [x] Filtro por unidade

### 3.3 Gestão de Membros
- [x] Cadastro com 16 steps
- [x] Listagem com filtros
- [x] Visualização detalhada
- [x] Edição de membros
- [x] Exclusão (Admin)
- [x] Alteração de status
- [x] Tabs por status
- [x] Impressão de listas

### 3.4 Gestão de Usuários
- [x] CRUD de usuários
- [x] Reset de senha
- [x] Ativar/Desativar usuários

### 3.5 Sistema de Backup
- [x] Backup manual
- [x] Histórico de backups

---

## 4. O que foi Implementado (v1.0)

### Backend (server.py)
- Autenticação JWT completa
- CRUD de usuários
- CRUD de membros (16 steps)
- Dashboard statistics
- Sistema de notificações
- Upload de arquivos
- Backup do sistema
- Endpoints de constantes (postos, unidades, etc.)

### Frontend
- Login page com design institucional
- Dashboard com gráficos (Recharts)
- Página de membros com tabs por status
- Formulário de 16 steps para cadastro
- Visualização detalhada de membros
- Gestão de usuários
- Sistema de backup
- Layout responsivo com sidebar

---

## 5. Backlog Priorizado

### P0 (Crítico) - Próxima Iteração
- [ ] Integração de email (Resend) para notificações
- [ ] Cálculo automático de dias em licenças
- [ ] Relatórios PDF por step

### P1 (Alta Prioridade)
- [ ] Backup automático agendado
- [ ] Histórico de alterações por membro
- [ ] Exportação de dados em PDF completo
- [ ] Validação de idade para reforma (60 anos)

### P2 (Média Prioridade)
- [ ] Dashboard com mais filtros
- [ ] Gráficos interativos
- [ ] Busca avançada
- [ ] Importação em massa

### P3 (Baixa Prioridade)
- [ ] Multi-idioma (Tétum)
- [ ] Tema escuro
- [ ] Logs de auditoria

---

## 6. Próximos Passos

1. Configurar integração com Resend para emails
2. Implementar cálculo automático de dias em licenças
3. Melhorar geração de PDF com logo institucional
4. Implementar validação automática de idade para reforma

---

## 7. Credenciais de Teste

- **Admin:** admin@falintil-fdtl.tl / admin123

---

## 8. URLs

- **Frontend:** https://falintil-pms.preview.emergentagent.com
- **Backend API:** https://falintil-pms.preview.emergentagent.com/api
