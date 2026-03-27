import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Badge } from '../components/ui/badge';
import { Search, Download, ChevronLeft, ChevronRight, Activity, User, Clock } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const ACTION_COLORS = {
  'LOGIN': 'bg-blue-100 text-blue-800',
  'CRIAR_MEMBRO': 'bg-green-100 text-green-800',
  'ATUALIZAR_MEMBRO': 'bg-amber-100 text-amber-800',
  'EXCLUIR_MEMBRO': 'bg-red-100 text-red-800',
  'CRIAR_USUARIO': 'bg-emerald-100 text-emerald-800',
  'ATUALIZAR_USUARIO': 'bg-yellow-100 text-yellow-800',
  'BACKUP': 'bg-purple-100 text-purple-800',
};

export default function ActivityLogsPage() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  
  // Filters
  const [searchEmail, setSearchEmail] = useState('');
  const [searchAction, setSearchAction] = useState('');
  const [dataInicio, setDataInicio] = useState('');
  const [dataFim, setDataFim] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (searchEmail) params.append('user_email', searchEmail);
      if (searchAction && searchAction !== 'all') params.append('action', searchAction);
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      
      const response = await axios.get(`${API}/activity-logs?${params.toString()}`);
      setLogs(response.data.logs);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Erro ao carregar logs de atividade');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchLogs();
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (dataInicio) params.append('data_inicio', dataInicio);
      if (dataFim) params.append('data_fim', dataFim);
      
      const response = await axios.get(`${API}/activity-logs/export?${params.toString()}`);
      
      // Create CSV content
      const headers = ['Data/Hora', 'Usuário', 'Email', 'Função', 'Ação', 'Detalhes'];
      const rows = response.data.map(log => [
        log.data_formatada,
        log.user_id,
        log.user_email,
        log.user_role,
        log.action,
        log.details || ''
      ]);
      
      const csvContent = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      // Download
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `activity_logs_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      
      toast.success('Logs exportados com sucesso');
    } catch (error) {
      toast.error('Erro ao exportar logs');
    }
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
            <Activity className="h-6 w-6" />
            Logs de Atividade
          </h1>
          <p className="text-sm text-muted-foreground">
            Registro de todas as atividades do sistema
          </p>
        </div>
        <Button
          onClick={handleExport}
          className="bg-emerald-900 hover:bg-emerald-800 rounded-sm"
          data-testid="export-logs-button"
        >
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      {/* Filters */}
      <Card className="border border-border rounded-sm shadow-none">
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div>
              <Input
                placeholder="Buscar por email..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                className="rounded-sm"
                data-testid="search-email-input"
              />
            </div>
            <div>
              <Select value={searchAction} onValueChange={setSearchAction}>
                <SelectTrigger className="rounded-sm" data-testid="filter-action-select">
                  <SelectValue placeholder="Filtrar por Ação" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as Ações</SelectItem>
                  <SelectItem value="LOGIN">Login</SelectItem>
                  <SelectItem value="CRIAR_MEMBRO">Criar Membro</SelectItem>
                  <SelectItem value="ATUALIZAR_MEMBRO">Atualizar Membro</SelectItem>
                  <SelectItem value="EXCLUIR_MEMBRO">Excluir Membro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Input
                type="date"
                placeholder="Data início"
                value={dataInicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="rounded-sm"
                data-testid="filter-data-inicio"
              />
            </div>
            <div>
              <Input
                type="date"
                placeholder="Data fim"
                value={dataFim}
                onChange={(e) => setDataFim(e.target.value)}
                className="rounded-sm"
                data-testid="filter-data-fim"
              />
            </div>
            <div>
              <Button onClick={handleSearch} className="bg-emerald-900 hover:bg-emerald-800 rounded-sm w-full" data-testid="apply-filters-button">
                <Search className="h-4 w-4 mr-2" /> Buscar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Total: <strong className="text-foreground">{total}</strong> registro(s)</span>
        <span>Página {page} de {totalPages || 1}</span>
      </div>

      {/* Table */}
      <Card className="border border-border rounded-sm shadow-none">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" /> Data/Hora
                  </div>
                </TableHead>
                <TableHead className="font-semibold">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" /> Usuário
                  </div>
                </TableHead>
                <TableHead className="font-semibold">Função</TableHead>
                <TableHead className="font-semibold">Ação</TableHead>
                <TableHead className="font-semibold">Detalhes</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : logs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Nenhum registro encontrado
                  </TableCell>
                </TableRow>
              ) : (
                logs.map((log) => (
                  <TableRow key={log.log_id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {log.data_formatada}
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium text-foreground">{log.user_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="rounded-sm capitalize">
                        {log.user_role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={`${ACTION_COLORS[log.action] || 'bg-slate-100 text-slate-800'} rounded-sm`}>
                        {log.action?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-md truncate text-sm text-muted-foreground">
                      {log.details || '-'}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Mostrando {((page - 1) * limit) + 1} - {Math.min(page * limit, total)} de {total}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" /> Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-sm"
            >
              Próximo <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
