import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Users, UserCheck, UserX, Heart, Shield, Award, AlertTriangle, Bell } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const PIE_COLORS = ['#064e3b', '#ca8a04'];

export default function DashboardPage() {
  const { user, canEdit } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUnidade, setFilterUnidade] = useState('all');
  const [unidades, setUnidades] = useState([]);
  const [retirementAlerts, setRetirementAlerts] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUnidades();
    fetchRetirementAlerts();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/dashboard/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnidades = async () => {
    try {
      const response = await axios.get(`${API}/constants/unidades`);
      setUnidades(response.data);
    } catch (error) {
      console.error('Error fetching unidades:', error);
    }
  };

  const fetchRetirementAlerts = async () => {
    try {
      const response = await axios.get(`${API}/members/retirement-alerts`);
      setRetirementAlerts(response.data.alerts);
    } catch (error) {
      console.error('Error fetching retirement alerts:', error);
    }
  };

  const handleCheckRetirement = async () => {
    try {
      const response = await axios.post(`${API}/members/check-retirement`);
      toast.success(response.data.message);
      fetchStats();
      fetchRetirementAlerts();
    } catch (error) {
      toast.error('Erro ao verificar reformas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-900"></div>
      </div>
    );
  }

  const sexoData = stats ? [
    { name: 'Masculino', value: stats.por_sexo.masculino },
    { name: 'Feminino', value: stats.por_sexo.feminino }
  ] : [];

  const postoData = stats?.por_posto?.slice(0, 10) || [];
  const unidadeData = stats?.por_unidade?.slice(0, 8) || [];
  const sangueData = stats?.por_tipo_sanguineo || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Dashboard
          </h1>
          <p className="text-sm text-slate-500">
            Bem-vindo, {user?.nome} {user?.sobrenome}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filterUnidade} onValueChange={setFilterUnidade}>
            <SelectTrigger className="w-[200px] rounded-sm" data-testid="filter-unidade-select">
              <SelectValue placeholder="Filtrar por Unidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as Unidades</SelectItem>
              {unidades.map((unidade) => (
                <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Stats Cards - Clickable */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-emerald-500 transition-colors" 
          data-testid="stat-total"
          onClick={() => navigate('/members')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Total Membros</p>
                <p className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.total || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-700 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-emerald-500 transition-colors" 
          data-testid="stat-ativos"
          onClick={() => navigate('/members?status=Ativo')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.ativos || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-slate-500 transition-colors" 
          data-testid="stat-falecidos"
          onClick={() => navigate('/members?status=Falecido')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Falecidos</p>
                <p className="text-2xl font-bold text-slate-600 dark:text-slate-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.falecidos || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-slate-600 dark:text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-amber-500 transition-colors" 
          data-testid="stat-separacao"
          onClick={() => navigate('/members?status=Separação do Serviço')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Separação</p>
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.separacao || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-amber-600 dark:text-amber-400" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-blue-500 transition-colors" 
          data-testid="stat-reserva"
          onClick={() => navigate('/members?status=Reserva')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Reserva</p>
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.reserva || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-purple-500 transition-colors" 
          data-testid="stat-reforma"
          onClick={() => navigate('/members?status=Reforma')}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Reforma</p>
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.reforma || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status de Licença Cards */}
      <div className="mt-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Status de Licença</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-green-500 transition-colors" 
            data-testid="stat-em-servico"
            onClick={() => navigate('/members?status_licenca=Em Serviço')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Em Serviço</p>
              <p className="text-xl font-bold text-green-600 dark:text-green-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.em_servico || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-orange-500 transition-colors" 
            data-testid="stat-licenca-sem-vencimento"
            onClick={() => navigate('/members?status_licenca=Licença Sem Vencimento')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lic. Sem Vencimento</p>
              <p className="text-xl font-bold text-orange-600 dark:text-orange-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.licenca_sem_vencimento || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-red-500 transition-colors" 
            data-testid="stat-licenca-junta-medica"
            onClick={() => navigate('/members?status_licenca=Licença Junta Médica')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lic. Junta Médica</p>
              <p className="text-xl font-bold text-red-600 dark:text-red-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.licenca_junta_medica || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-pink-500 transition-colors" 
            data-testid="stat-licenca-partos"
            onClick={() => navigate('/members?status_licenca=Licença de Partos')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lic. de Partos</p>
              <p className="text-xl font-bold text-pink-600 dark:text-pink-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.licenca_partos || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-indigo-500 transition-colors" 
            data-testid="stat-licenca-estudo"
            onClick={() => navigate('/members?status_licenca=Licença de Estudo')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Lic. de Estudo</p>
              <p className="text-xl font-bold text-indigo-600 dark:text-indigo-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.licenca_estudo || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-cyan-500 transition-colors" 
            data-testid="stat-curso-exterior"
            onClick={() => navigate('/members?status_licenca=Curso no Exterior')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Curso Exterior</p>
              <p className="text-xl font-bold text-cyan-600 dark:text-cyan-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.curso_exterior || 0}
              </p>
            </CardContent>
          </Card>

          <Card 
            className="border border-border rounded-sm shadow-none card-hover cursor-pointer hover:border-teal-500 transition-colors" 
            data-testid="stat-curso-interior"
            onClick={() => navigate('/members?status_licenca=Curso no Interior')}
          >
            <CardContent className="p-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Curso Interior</p>
              <p className="text-xl font-bold text-teal-600 dark:text-teal-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {stats?.por_status_licenca?.curso_interior || 0}
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Retirement Alerts */}
      {retirementAlerts.length > 0 && (
        <Card className="border border-amber-200 dark:border-amber-800 rounded-sm shadow-none bg-amber-50 dark:bg-amber-950" data-testid="retirement-alerts">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg text-amber-800 dark:text-amber-200 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                <AlertTriangle className="h-5 w-5" />
                Alertas de Reforma ({retirementAlerts.length})
              </CardTitle>
              {canEdit && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleCheckRetirement}
                  className="border-amber-600 text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900"
                  data-testid="check-retirement-button"
                >
                  Verificar Reformas
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-amber-700 dark:text-amber-300 mb-3">
              Membros próximos da idade de reforma (58-59 anos):
            </p>
            <div className="space-y-2">
              {retirementAlerts.slice(0, 5).map((alert) => (
                <div 
                  key={alert.member_id} 
                  className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-sm border border-amber-200 dark:border-amber-800 cursor-pointer hover:bg-amber-100 dark:hover:bg-amber-900 transition-colors"
                  onClick={() => navigate(`/members/${alert.member_id}`)}
                >
                  <div>
                    <p className="font-medium text-foreground">{alert.nome}</p>
                    <p className="text-sm text-muted-foreground">NIM: {alert.nim} | {alert.posto}</p>
                  </div>
                  <Badge className="bg-amber-500 text-white">
                    {alert.idade} anos ({alert.anos_para_reforma} ano(s) para reforma)
                  </Badge>
                </div>
              ))}
              {retirementAlerts.length > 5 && (
                <p className="text-sm text-amber-600 dark:text-amber-400 text-center mt-2">
                  E mais {retirementAlerts.length - 5} membro(s)...
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Gender Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-border rounded-sm shadow-none" data-testid="stat-masculino">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Masculino</p>
                <p className="text-3xl font-bold text-emerald-700 dark:text-emerald-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_sexo?.masculino || 0}
                </p>
              </div>
              <div className="text-4xl">♂</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-border rounded-sm shadow-none" data-testid="stat-feminino">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Feminino</p>
                <p className="text-3xl font-bold text-amber-600 dark:text-amber-400" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_sexo?.feminino || 0}
                </p>
              </div>
              <div className="text-4xl">♀</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Por Unidade */}
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Membros por Unidade
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={unidadeData} layout="vertical" margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis type="number" tick={{ fontSize: 12 }} />
                  <YAxis dataKey="unidade" type="category" tick={{ fontSize: 10 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#064e3b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Por Sexo */}
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Distribuição por Sexo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sexoData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {sexoData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Por Posto */}
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Membros por Posto (Top 10)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={postoData} margin={{ left: 20, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="posto" tick={{ fontSize: 10, angle: -45, textAnchor: 'end' }} height={80} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Bar dataKey="count" fill="#065f46" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Por Tipo Sanguíneo */}
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Tipos Sanguíneos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sangueData}
                    cx="50%"
                    cy="50%"
                    labelLine={true}
                    label={({ tipo, count }) => `${tipo}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                    nameKey="tipo"
                  >
                    {sangueData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
