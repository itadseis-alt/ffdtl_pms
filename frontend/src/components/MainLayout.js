import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { 
  LayoutDashboard, Users, UserCog, Bell, LogOut, Menu, X, ChevronDown, Key, User,
  Database, Settings, Shield, Sun, Moon, Activity
} from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO = "https://static.prod-images.emergentagent.com/jobs/c19a0984-e82e-494a-88ed-ca23a6e50af4/images/79d39cdf6f7a79fab98f970d607b22ce980c214e0ef3771881e5abae75ac250c.png";

export default function MainLayout({ children }) {
  const { user, logout, changePassword, isAdmin, isRH, isSuperior } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [passwordDialog, setPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({ senha_atual: '', nova_senha: '', confirmacao_senha: '' });

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await axios.get(`${API}/notifications`);
      setNotifications(response.data.slice(0, 5));
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await axios.get(`${API}/notifications/unread-count`);
      setUnreadCount(response.data.count);
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleChangePassword = async () => {
    if (passwordData.nova_senha !== passwordData.confirmacao_senha) {
      toast.error('As senhas não coincidem');
      return;
    }
    
    try {
      await changePassword(passwordData.senha_atual, passwordData.nova_senha, passwordData.confirmacao_senha);
      toast.success('Senha alterada com sucesso');
      setPasswordDialog(false);
      setPasswordData({ senha_atual: '', nova_senha: '', confirmacao_senha: '' });
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao alterar senha');
    }
  };

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['admin', 'rh', 'superior'] },
    { name: 'Membros', href: '/members', icon: Users, roles: ['admin', 'rh', 'superior'] },
    { name: 'Usuários', href: '/users', icon: UserCog, roles: ['admin'] },
    { name: 'Backup', href: '/backup', icon: Database, roles: ['admin'] },
    { name: 'Logs de Atividade', href: '/activity-logs', icon: Activity, roles: ['admin'] },
  ];

  const filteredNavigation = navigation.filter(item => item.roles.includes(user?.role));

  const getRoleName = (role) => {
    const roles = { admin: 'Administrador', rh: 'Recursos Humanos', superior: 'Superior' };
    return roles[role] || role;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar - Mobile */}
      <div className={`fixed inset-0 z-50 lg:hidden ${sidebarOpen ? '' : 'pointer-events-none'}`}>
        <div 
          className={`fixed inset-0 bg-slate-900/50 transition-opacity ${sidebarOpen ? 'opacity-100' : 'opacity-0'}`}
          onClick={() => setSidebarOpen(false)}
        />
        <div className={`fixed inset-y-0 left-0 w-64 bg-slate-900 dark:bg-slate-950 transform transition-transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <SidebarContent 
            navigation={filteredNavigation} 
            location={location} 
            onClose={() => setSidebarOpen(false)} 
            isMobile={true}
          />
        </div>
      </div>

      {/* Sidebar - Desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64">
        <div className="flex flex-col flex-grow bg-slate-900 dark:bg-slate-950">
          <SidebarContent navigation={filteredNavigation} location={location} isMobile={false} />
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-muted-foreground hover:text-foreground"
            >
              <Menu className="h-6 w-6" />
            </button>

            <div className="flex-1 lg:flex-none" />

            <div className="flex items-center gap-4">
              {/* Theme Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                data-testid="theme-toggle"
              >
                {theme === 'light' ? (
                  <Moon className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <Sun className="h-5 w-5 text-muted-foreground" />
                )}
              </Button>

              {/* Notifications */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="relative" data-testid="notifications-button">
                    <Bell className="h-5 w-5 text-muted-foreground" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                        {unreadCount}
                      </span>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-80">
                  <div className="px-3 py-2 border-b border-border">
                    <h4 className="font-semibold text-foreground">Notificações</h4>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="px-3 py-4 text-center text-muted-foreground text-sm">
                      Nenhuma notificação
                    </div>
                  ) : (
                    notifications.map((notif) => (
                      <DropdownMenuItem key={notif.notification_id} className="flex flex-col items-start p-3">
                        <span className="font-medium text-foreground">{notif.titulo}</span>
                        <span className="text-sm text-muted-foreground">{notif.mensagem}</span>
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* User Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center gap-2" data-testid="user-menu-button">
                    <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center text-emerald-800 dark:text-emerald-100 font-medium">
                      {user?.nome?.charAt(0)}
                    </div>
                    <div className="hidden sm:block text-left">
                      <p className="text-sm font-medium text-foreground">{user?.nome}</p>
                      <p className="text-xs text-muted-foreground">{getRoleName(user?.role)}</p>
                    </div>
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-3 py-2 border-b border-border">
                    <p className="font-medium text-foreground">{user?.nome} {user?.sobrenome}</p>
                    <p className="text-sm text-muted-foreground">{user?.email}</p>
                  </div>
                  <DropdownMenuItem onClick={() => setPasswordDialog(true)} data-testid="change-password-menu">
                    <Key className="h-4 w-4 mr-2" /> Alterar Senha
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600" data-testid="logout-button">
                    <LogOut className="h-4 w-4 mr-2" /> Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-border py-4 px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-muted-foreground">
            FALINTIL-FDTL: Divisão de Comunicação e Sistema de Informação @2026
          </p>
        </footer>
      </div>

      {/* Password Change Dialog */}
      <Dialog open={passwordDialog} onOpenChange={setPasswordDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar Senha</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Senha Atual *</Label>
              <Input
                type="password"
                value={passwordData.senha_atual}
                onChange={(e) => setPasswordData({ ...passwordData, senha_atual: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Nova Senha *</Label>
              <Input
                type="password"
                value={passwordData.nova_senha}
                onChange={(e) => setPasswordData({ ...passwordData, nova_senha: e.target.value })}
                className="rounded-sm"
              />
            </div>
            <div className="space-y-2">
              <Label>Confirmar Nova Senha *</Label>
              <Input
                type="password"
                value={passwordData.confirmacao_senha}
                onChange={(e) => setPasswordData({ ...passwordData, confirmacao_senha: e.target.value })}
                className="rounded-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPasswordDialog(false)} className="rounded-sm">
              Cancelar
            </Button>
            <Button onClick={handleChangePassword} className="bg-emerald-900 hover:bg-emerald-800 rounded-sm">
              Alterar Senha
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SidebarContent({ navigation, location, onClose, isMobile = false }) {
  const prefix = isMobile ? 'mobile-' : 'desktop-';
  return (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <Link to="/dashboard" className="flex items-center gap-3">
          <img src={LOGO} alt="FALINTIL-FDTL" className="w-10 h-10" />
          <div>
            <h1 className="text-sm font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              FALINTIL-FDTL
            </h1>
            <p className="text-xs text-slate-400">PMS</p>
          </div>
        </Link>
        {onClose && (
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <X className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navigation.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.href || location.pathname.startsWith(item.href + '/');
          
          return (
            <Link
              key={item.name}
              to={item.href}
              onClick={onClose}
              className={`flex items-center gap-3 px-3 py-2 rounded-sm text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-900 text-white'
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
              data-testid={`${prefix}nav-${item.name.toLowerCase()}`}
            >
              <Icon className="h-5 w-5" />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-2 text-slate-400">
          <Shield className="h-4 w-4" />
          <span className="text-xs">Sistema Seguro</span>
        </div>
      </div>
    </div>
  );
}
