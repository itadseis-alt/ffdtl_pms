# FALINTIL-FDTL Personal Management System (PMS)
## PRD - Product Requirements Document

### Data de Criação: 2026-01-26
### Última Atualização: 2026-03-26

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
- [x] Cards clicáveis para navegação rápida por status

### 3.3 Gestão de Membros
- [x] Cadastro com 16 steps
- [x] Listagem com filtros
- [x] Visualização detalhada
- [x] Edição de membros
- [x] Exclusão (Admin)
- [x] Alteração de status
- [x] Tabs por status
- [x] Impressão de listas
- [x] Upload de fotos e documentos
- [x] Visualização de anexos/PDFs

### 3.4 Gestão de Usuários
- [x] CRUD de usuários
- [x] Reset de senha
- [x] Ativar/Desativar usuários

### 3.5 Sistema de Backup
- [x] Backup manual
- [x] Histórico de backups

### 3.6 Impressão
- [x] Cabeçalho institucional: "FALINTIL-Forças de Defesa de Timor-Leste (F-FDTL)"
- [x] Subtítulo: "Quartel General"
- [x] Impressão por step individual
- [x] Impressão de ficha completa

---

## 4. Changelog

### v1.1 (2026-03-26)
- **Correção:** Foto de perfil exibindo corretamente (helper getFileUrl)
- **Correção:** Anexos/PDFs abrindo sem erro de autenticação
- **Correção:** Texto visível em dropdowns/selects (CSS fix)
- **Correção:** Dashboard cards clicáveis navegando para lista filtrada
- **Melhoria:** Cabeçalho de impressão atualizado com nome completo institucional
- **Melhoria:** MembersPage lendo query params da URL para filtro automático

### v1.0 (2026-01-26)
- Backend completo com autenticação JWT
- CRUD de usuários e membros
- Dashboard com estatísticas
- Formulário de 16 steps
- Sistema de upload de arquivos
- Tema claro/escuro

---

## 5. Backlog Priorizado

### P0 (Crítico) - Próxima Iteração
- [ ] Integração de email (Resend) para notificações de reforma
- [ ] Cálculo automático de dias em licenças

### P1 (Alta Prioridade)
- [ ] Backup automático agendado
- [ ] Histórico de alterações por membro
- [ ] Relatórios PDF por step
- [ ] Validação de idade para reforma (60 anos)

### P2 (Média Prioridade)
- [ ] Dashboard com mais filtros
- [ ] Gráficos interativos
- [ ] Busca avançada
- [ ] Importação em massa

### P3 (Baixa Prioridade)
- [ ] Multi-idioma (Tétum)
- [ ] Logs de auditoria

---

## 6. Próximos Passos

1. Configurar integração com Resend para emails de alerta de reforma
2. Implementar backup automático agendado
3. Adicionar validação automática de idade para reforma

---

## 7. Credenciais de Teste

- **Admin:** admin@falintil-fdtl.tl / admin123

---

## 8. URLs

- **Frontend:** https://falintil-pms.preview.emergentagent.com
- **Backend API:** https://falintil-pms.preview.emergentagent.com/api
