import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { Plus, Edit, Trash2, Key, UserX, UserCheck, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ROLE_LABELS = {
  admin: 'Administrador',
  rh: 'Recursos Humanos',
  superior: 'Superior'
};

const ROLE_COLORS = {
  admin: 'bg-purple-100 text-purple-800',
  rh: 'bg-blue-100 text-blue-800',
  superior: 'bg-amber-100 text-amber-800'
};

export default function UsersPage() {
  const { user: currentUser, isAdmin } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState('all');
  
  // Create/Edit dialog
  const [createDialog, setCreateDialog] = useState({ open: false, user: null });
  const [formData, setFormData] = useState({
    nome: '', sobrenome: '', email: '', senha: '', confirmacao_senha: '', role: 'rh', foto_perfil: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  
  // Password reset dialog
  const [passwordDialog, setPasswordDialog] = useState({ open: false, user: null });
  const [passwordData, setPasswordData] = useState({ nova_senha: '', confirmacao_senha: '' });
  
  // Delete/Disable dialog
  const [actionDialog, setActionDialog] = useState({ open: false, user: null, action: '' });

  useEffect(() => {
    fetchUsers();
  }, [filterRole]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = filterRole !== 'all' ? `?role=${filterRole}` : '';
      const response = await axios.get(`${API}/users${params}`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!formData.nome || !formData.sobrenome || !formData.email || !formData.senha) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }
    if (formData.senha !== formData.confirmacao_senha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      await axios.post(`${API}/users`, formData);
      toast.success('Usuário criado com sucesso');
      setCreateDialog({ open: false, user: null });
      setFormData({ nome: '', sobrenome: '', email: '', senha: '', confirmacao_senha: '', role: 'rh', foto_perfil: '' });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao criar usuário');
    }
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${API}/users/${createDialog.user.user_id}`, {
        nome: formData.nome,
        sobrenome: formData.sobrenome,
        email: formData.email
      });
      toast.success('Usuário atualizado com sucesso');
      setCreateDialog({ open: false, user: null });
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao atualizar usuário');
    }
  };

  const handleResetPassword = async () => {
    if (passwordData.nova_senha !== passwordData.confirmacao_senha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      await axios.put(`${API}/users/${passwordDialog.user.user_id}/reset-password`, passwordData);
      toast.success('Senha alterada com sucesso');
      setPasswordDialog({ open: false, user: null });
      setPasswordData({ nova_senha: '', confirmacao_senha: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
    }
  };

  const handleToggleActive = async () => {
    try {
      await axios.put(`${API}/users/${actionDialog.user.user_id}`, {
        is_active: !actionDialog.user.is_active
      });
      toast.success(`Usuário ${actionDialog.user.is_active ? 'desativado' : 'ativado'} com sucesso`);
      setActionDialog({ open: false, user: null, action: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao alterar status do usuário');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/users/${actionDialog.user.user_id}`);
      toast.success('Usuário excluído com sucesso');
      setActionDialog({ open: false, user: null, action: '' });
      fetchUsers();
    } catch (error) {
      toast.error('Erro ao excluir usuário');
    }
  };

  const openCreateDialog = (user = null) => {
    if (user) {
      setFormData({
        nome: user.nome,
        sobrenome: user.sobrenome,
        email: user.email,
        senha: '',
        confirmacao_senha: '',
        role: user.role,
        foto_perfil: user.foto_perfil || ''
      });
    } else {
      setFormData({ nome: '', sobrenome: '', email: '', senha: '', confirmacao_senha: '', role: 'rh', foto_perfil: '' });
    }
    setCreateDialog({ open: true, user });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Gestão de Usuários
          </h1>
          <p className="text-sm text-slate-500">
            {users.length} usuário(s) cadastrado(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-[180px] rounded-sm" data-testid="filter-role-select">
              <SelectValue placeholder="Filtrar por função" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="admin">Administrador</SelectItem>
              <SelectItem value="rh">RH</SelectItem>
              <SelectItem value="superior">Superior</SelectItem>
            </SelectContent>
          </Select>
          <Button
            onClick={() => openCreateDialog()}
            className="bg-emerald-900 hover:bg-emerald-800 rounded-sm"
            data-testid="add-user-button"
          >
            <Plus className="h-4 w-4 mr-2" /> Novo Usuário
          </Button>
        </div>
      </div>

      {/* Table */}
      <Card className="border border-slate-200 rounded-sm shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">Nome</TableHead>
                <TableHead className="font-semibold">Email</TableHead>
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="font-semibold">Status</TableHead>
                <TableHead className="font-semibold">Criado em</TableHead>
                <TableHead className="font-semibold">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-slate-500">
                    Nenhum usuário encontrado
                  </TableCell>
                </TableRow>
              ) : (
                users.map((user) => (
                  <TableRow key={user.user_id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {user.foto_perfil ? (
                          <img src={user.foto_perfil} alt={user.nome} className="w-8 h-8 rounded-full object-cover" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-sm font-medium">
                            {user.nome?.charAt(0)}
                          </div>
                        )}
                        <span className="font-medium">{user.nome} {user.sobrenome}</span>
                      </div>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <Badge className={`${ROLE_COLORS[user.role]} rounded-sm`}>
                        {ROLE_LABELS[user.role]}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${user.is_active ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'} rounded-sm`}>
                        {user.is_active ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('pt-PT')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openCreateDialog(user)}
                          title="Editar"
                          data-testid={`edit-user-${user.email}`}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setPasswordDialog({ open: true, user })}
                          title="Alterar Senha"
                          data-testid={`reset-password-${user.email}`}
                        >
                          <Key className="h-4 w-4" />
                        </Button>
                        {user.user_id !== currentUser?.user_id && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionDialog({ open: true, user, action: 'toggle' })}
                              title={user.is_active ? 'Desativar' : 'Ativar'}
                              className={user.is_active ? 'text-amber-600' : 'text-emerald-600'}
                            >
                              {user.is_active ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setActionDialog({ open: true, user, action: 'delete' })}
                              className="text-red-600"
                              title="Excluir"
                              data-testid={`delete-user-${user.email}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={createDialog.open} onOpenChange={(open) => setCreateDialog({ ...createDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{createDialog.user ? 'Editar Usuário' : 'Novo Usuário'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome *</Label>
                <Input
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="rounded-sm"
                  data-testid="user-nome-input"
                />
              </div>
              <div className="space-y-2">
                <Label>Sobrenome *</Label>
                <Input
                  value={formData.sobrenome}
                  onChange={(e) => setFormData({ ...formData, sobrenome: e.target.value })}
                  className="rounded-sm"
                  data-testid="user-sobrenome-input"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="rounded-sm"
                data-testid="user-email-input"
              />
            </div>
            {!createDialog.user && (
              <>
                <div className="space-y-2">
                  <Label>Senha *</Label>
                  <div className="relative">
                    <Input
                      type={showPassword ? "text" : "password"}
                      value={formData.senha}
                      onChange={(e) => setFormData({ ...formData, senha: e.target.value })}
                      className="rounded-sm pr-10"
                      data-testid="user-senha-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Confirmar Senha *</Label>
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={formData.confirmacao_senha}
                    onChange={(e) => setFormData({ ...formData, confirmacao_senha: e.target.value })}
                    className="rounded-sm"
                    data-testid="user-confirmacao-senha-input"
                  />
                </div>
              </>
            )}
            <div className="space-y-2">
              <Label>Função *</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })} disabled={!!createDialog.user}>
                <SelectTrigger className="rounded-sm" data-testid="user-role-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rh">Recursos Humanos</SelectItem>
                  <SelectItem value="superior">Superior</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateDialog({ open: false, user: null })} className="rounded-sm">
              Cancelar
            </Button>
            <Button
              onClick={createDialog.user ? handleUpdate : handleCreate}
              className="bg-emerald-900 hover:bg-emerald-800 rounded-sm"
              data-testid="save-user-button"
            >
              {createDialog.user ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog open={passwordDialog.open} onOpenChange={(open) => setPasswordDialog({ ...passwordDialog, open })}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
            <DialogDescription>
              Alterando senha do usuário: {passwordDialog.user?.nome} {passwordDialog.user?.sobrenome}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Nova Senha *</Label>
              <Input
                type="password"
                value={passwordData.nova_senha}
                onChange={(e) => setPasswordData({ ...passwordData, nova_senha: e.target.value })}
                className="rounded-sm"
                data-testid="new-password-input"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha *</Label>
              <Input
                type="password"
                value={passwordData.confirmacao_senha}
                onChange={(e) => setPasswordData({ ...passwordData, confirmacao_senha: e.target.value })}
                className="rounded-sm"
                data-testid="confirm-password-input"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog({ open: false, user: null })} className="rounded-sm">
              Cancelar
            </Button>
            <Button onClick={handleResetPassword} className="bg-emerald-900 hover:bg-emerald-800 rounded-sm" data-testid="save-password-button">
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Dialog (Toggle/Delete) */}
      <Dialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionDialog.action === 'delete' ? 'Confirmar Exclusão' : 
               actionDialog.user?.is_active ? 'Desativar Usuário' : 'Ativar Usuário'}
            </DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            {actionDialog.action === 'delete'
              ? `Tem certeza que deseja excluir o usuário ${actionDialog.user?.nome} ${actionDialog.user?.sobrenome}? Esta ação não pode ser desfeita.`
              : actionDialog.user?.is_active
              ? `Deseja desativar o usuário ${actionDialog.user?.nome} ${actionDialog.user?.sobrenome}? Ele não poderá mais acessar o sistema.`
              : `Deseja ativar o usuário ${actionDialog.user?.nome} ${actionDialog.user?.sobrenome}?`}
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialog({ open: false, user: null, action: '' })}>
              Cancelar
            </Button>
            <Button
              variant={actionDialog.action === 'delete' ? 'destructive' : 'default'}
              onClick={actionDialog.action === 'delete' ? handleDelete : handleToggleActive}
              className={actionDialog.action !== 'delete' ? 'bg-emerald-900 hover:bg-emerald-800' : ''}
              data-testid="confirm-action-button"
            >
              {actionDialog.action === 'delete' ? 'Excluir' : 'Confirmar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
