import { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Database, Download, RefreshCw, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

export default function BackupPage() {
  const [backups, setBackups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/backups`);
      setBackups(response.data);
    } catch (error) {
      toast.error('Erro ao carregar backups');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setCreating(true);
    try {
      const response = await axios.post(`${API}/backup`);
      toast.success('Backup criado com sucesso');
      fetchBackups();
    } catch (error) {
      toast.error('Erro ao criar backup');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Backup do Sistema
          </h1>
          <p className="text-sm text-slate-500">
            Gerencie os backups dos dados do sistema
          </p>
        </div>
        <Button
          onClick={handleCreateBackup}
          disabled={creating}
          className="bg-emerald-900 hover:bg-emerald-800 rounded-sm"
          data-testid="create-backup-button"
        >
          {creating ? (
            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Database className="h-4 w-4 mr-2" />
          )}
          {creating ? 'Criando...' : 'Criar Backup Manual'}
        </Button>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Total Backups</p>
                <p className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {backups.length}
                </p>
              </div>
              <Database className="h-8 w-8 text-emerald-900" />
            </div>
          </CardContent>
        </Card>
        
        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Último Backup</p>
                <p className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  {backups.length > 0 
                    ? new Date(backups[0]?.created_at).toLocaleDateString('pt-PT')
                    : 'Nenhum'}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="border border-slate-200 rounded-sm shadow-none">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-500 uppercase tracking-wide">Tipo de Backup</p>
                <p className="text-lg font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  Automático + Manual
                </p>
              </div>
              <HardDrive className="h-8 w-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backups Table */}
      <Card className="border border-slate-200 rounded-sm shadow-none">
        <CardHeader className="border-b border-slate-200">
          <CardTitle className="text-lg" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Histórico de Backups
          </CardTitle>
        </CardHeader>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead className="font-semibold">ID do Backup</TableHead>
                <TableHead className="font-semibold">Data/Hora</TableHead>
                <TableHead className="font-semibold">Membros</TableHead>
                <TableHead className="font-semibold">Usuários</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-900 mx-auto"></div>
                  </TableCell>
                </TableRow>
              ) : backups.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-slate-500">
                    Nenhum backup encontrado
                  </TableCell>
                </TableRow>
              ) : (
                backups.map((backup) => (
                  <TableRow key={backup.backup_id} className="hover:bg-slate-50">
                    <TableCell className="font-mono text-sm">{backup.backup_id.substring(0, 8)}...</TableCell>
                    <TableCell>
                      {new Date(backup.created_at).toLocaleString('pt-PT', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>{backup.stats?.members_count || 0}</TableCell>
                    <TableCell>{backup.stats?.users_count || 0}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
