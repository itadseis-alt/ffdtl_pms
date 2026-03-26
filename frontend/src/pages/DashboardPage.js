import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Users, UserCheck, UserX, Heart, Shield, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const COLORS = ['#064e3b', '#065f46', '#047857', '#059669', '#10b981', '#34d399', '#6ee7b7', '#a7f3d0'];
const PIE_COLORS = ['#064e3b', '#ca8a04'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filterUnidade, setFilterUnidade] = useState('all');
  const [unidades, setUnidades] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchUnidades();
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-total">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Total Membros</p>
                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.total || 0}
                </p>
              </div>
              <Users className="h-8 w-8 text-emerald-900" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-ativos">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Ativos</p>
                <p className="text-2xl font-bold text-emerald-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.ativos || 0}
                </p>
              </div>
              <UserCheck className="h-8 w-8 text-emerald-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-falecidos">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Falecidos</p>
                <p className="text-2xl font-bold text-slate-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.falecidos || 0}
                </p>
              </div>
              <Heart className="h-8 w-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-separacao">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Separação</p>
                <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.separacao || 0}
                </p>
              </div>
              <UserX className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-reserva">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Reserva</p>
                <p className="text-2xl font-bold text-blue-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.reserva || 0}
                </p>
              </div>
              <Shield className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none card-hover" data-testid="stat-reforma">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Reforma</p>
                <p className="text-2xl font-bold text-purple-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_status?.reforma || 0}
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gender Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-slate-200 rounded-sm shadow-none" data-testid="stat-masculino">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Masculino</p>
                <p className="text-3xl font-bold text-emerald-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {stats?.por_sexo?.masculino || 0}
                </p>
              </div>
              <div className="text-4xl">♂</div>
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none" data-testid="stat-feminino">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Feminino</p>
                <p className="text-3xl font-bold text-amber-600" style={{ fontFamily: 'Outfit, sans-serif' }}>
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
