import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { Search, Plus, Eye, Edit, Trash2, Printer, FileDown, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO = "https://static.prod-images.emergentagent.com/jobs/c19a0984-e82e-494a-88ed-ca23a6e50af4/images/79d39cdf6f7a79fab98f970d607b22ce980c214e0ef3771881e5abae75ac250c.png";

const STATUS_COLORS = {
  'Ativo': 'bg-emerald-100 text-emerald-800',
  'Falecido': 'bg-slate-200 text-slate-800',
  'Separação do Serviço': 'bg-amber-100 text-amber-800',
  'Reserva': 'bg-blue-100 text-blue-800',
  'Reforma': 'bg-purple-100 text-purple-800'
};

export default function MembersPage() {
  const { canEdit, canDelete } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef();
  
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('Ativo');
  const [searchNome, setSearchNome] = useState('');
  const [searchNim, setSearchNim] = useState('');
  const [postoFilter, setPostoFilter] = useState('');
  const [municipioFilter, setMunicipioFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  
  // Constants
  const [postos, setPostos] = useState({});
  const [municipios, setMunicipios] = useState([]);
  
  // Delete dialog
  const [deleteDialog, setDeleteDialog] = useState({ open: false, member: null });
  
  // Status change dialog
  const [statusDialog, setStatusDialog] = useState({ open: false, member: null, newStatus: '' });

  useEffect(() => {
    fetchConstants();
  }, []);

  useEffect(() => {
    fetchMembers();
  }, [page, statusFilter]);

  const fetchConstants = async () => {
    try {
      const [postosRes, municipiosRes] = await Promise.all([
        axios.get(`${API}/constants/postos`),
        axios.get(`${API}/constants/municipios`)
      ]);
      setPostos(postosRes.data);
      setMunicipios(municipiosRes.data);
    } catch (error) {
      console.error('Error fetching constants:', error);
    }
  };

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (statusFilter) params.append('status', statusFilter);
      if (searchNome) params.append('nome', searchNome);
      if (searchNim) params.append('nim', searchNim);
      if (postoFilter) params.append('posto', postoFilter);
      if (municipioFilter) params.append('municipio', municipioFilter);
      
      const response = await axios.get(`${API}/members?${params.toString()}`);
      setMembers(response.data.members);
      setTotal(response.data.total);
    } catch (error) {
      toast.error('Erro ao carregar membros');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setPage(1);
    fetchMembers();
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`${API}/members/${deleteDialog.member.member_id}`);
      toast.success('Membro excluído com sucesso');
      setDeleteDialog({ open: false, member: null });
      fetchMembers();
    } catch (error) {
      toast.error('Erro ao excluir membro');
    }
  };

  const handleStatusChange = async () => {
    try {
      await axios.put(`${API}/members/${statusDialog.member.member_id}/status?status=${statusDialog.newStatus}`);
      toast.success('Status alterado com sucesso');
      setStatusDialog({ open: false, member: null, newStatus: '' });
      fetchMembers();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handlePrint = useReactToPrint({
    contentRef: printRef,
    documentTitle: `Lista_Membros_${statusFilter}_${new Date().toISOString().split('T')[0]}`
  });

  const allPostos = Object.values(postos).flat();
  const totalPages = Math.ceil(total / limit);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Gestão de Membros
          </h1>
          <p className="text-sm text-slate-500">
            {total} membro(s) encontrado(s)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <Button
              onClick={() => navigate('/members/new')}
              className="bg-emerald-900 hover:bg-emerald-800 rounded-sm"
              data-testid="add-member-button"
            >
              <Plus className="h-4 w-4 mr-2" /> Novo Membro
            </Button>
          )}
          <Button
            variant="outline"
            onClick={handlePrint}
            className="rounded-sm"
            data-testid="print-list-button"
          >
            <Printer className="h-4 w-4 mr-2" /> Imprimir
          </Button>
        </div>
      </div>

      {/* Status Tabs */}
      <Tabs value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
        <TabsList className="bg-slate-100 rounded-sm">
          <TabsTrigger value="Ativo" className="rounded-sm" data-testid="tab-ativos">Ativos</TabsTrigger>
          <TabsTrigger value="Falecido" className="rounded-sm" data-testid="tab-falecidos">Falecidos</TabsTrigger>
          <TabsTrigger value="Separação do Serviço" className="rounded-sm" data-testid="tab-separacao">Separação</TabsTrigger>
          <TabsTrigger value="Reserva" className="rounded-sm" data-testid="tab-reserva">Reserva</TabsTrigger>
          <TabsTrigger value="Reforma" className="rounded-sm" data-testid="tab-reforma">Reforma</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Filters */}
      <Card className="border border-slate-200 rounded-sm shadow-none">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="text-slate-600"
            >
              <Filter className="h-4 w-4 mr-2" /> Filtros
            </Button>
          </div>
          
          <div className={`grid grid-cols-1 md:grid-cols-4 gap-4 ${showFilters ? '' : 'hidden md:grid'}`}>
            <div>
              <Input
                placeholder="Buscar por nome..."
                value={searchNome}
                onChange={(e) => setSearchNome(e.target.value)}
                className="rounded-sm"
                data-testid="search-nome-input"
              />
            </div>
            <div>
              <Input
                placeholder="Buscar por NIM..."
                value={searchNim}
                onChange={(e) => setSearchNim(e.target.value)}
                className="rounded-sm"
                data-testid="search-nim-input"
              />
            </div>
            <div>
              <Select value={postoFilter} onValueChange={setPostoFilter}>
                <SelectTrigger className="rounded-sm" data-testid="filter-posto-select">
                  <SelectValue placeholder="Filtrar por Posto" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Postos</SelectItem>
                  {allPostos.map((posto) => (
                    <SelectItem key={posto} value={posto}>{posto}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Select value={municipioFilter} onValueChange={setMunicipioFilter}>
                <SelectTrigger className="rounded-sm" data-testid="filter-municipio-select">
                  <SelectValue placeholder="Filtrar por Município" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os Municípios</SelectItem>
                  {municipios.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch} className="bg-emerald-900 hover:bg-emerald-800 rounded-sm" data-testid="apply-filters-button">
              <Search className="h-4 w-4 mr-2" /> Buscar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <div ref={printRef}>
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <img src={LOGO} alt="Logo" className="h-16 w-16" />
            <div className="text-center">
              <h2 className="text-xl font-bold">FALINTIL-FDTL</h2>
              <p className="text-sm">Lista de Membros - {statusFilter}</p>
              <p className="text-xs text-slate-500">{new Date().toLocaleDateString('pt-PT')}</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        <Card className="border border-slate-200 rounded-sm shadow-none">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50">
                  <TableHead className="font-semibold">Foto</TableHead>
                  <TableHead className="font-semibold">NIM</TableHead>
                  <TableHead className="font-semibold">Nome</TableHead>
                  <TableHead className="font-semibold">Posto</TableHead>
                  <TableHead className="font-semibold">Unidade</TableHead>
                  <TableHead className="font-semibold">Município</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold no-print">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-900 mx-auto"></div>
                    </TableCell>
                  </TableRow>
                ) : members.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-slate-500">
                      Nenhum membro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  members.map((member) => (
                    <TableRow key={member.member_id} className="hover:bg-slate-50">
                      <TableCell>
                        {member.foto_perfil ? (
                          <img src={member.foto_perfil} alt={member.nome} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-sm">
                            {member.nome?.charAt(0)}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="font-medium">{member.nim}</TableCell>
                      <TableCell>{member.nome}</TableCell>
                      <TableCell>{member.posto}</TableCell>
                      <TableCell className="text-sm">{member.unidade}</TableCell>
                      <TableCell>{member.municipio}</TableCell>
                      <TableCell>
                        <Badge className={`${STATUS_COLORS[member.status]} rounded-sm`}>
                          {member.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="no-print">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/members/${member.member_id}`)}
                            data-testid={`view-member-${member.nim}`}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {canEdit && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/members/${member.member_id}/edit`)}
                              data-testid={`edit-member-${member.nim}`}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeleteDialog({ open: true, member })}
                              className="text-red-600 hover:text-red-700"
                              data-testid={`delete-member-${member.nim}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
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

        {/* Print Footer */}
        <div className="hidden print:block mt-6 pt-4 border-t">
          <p className="text-xs text-center text-slate-500">
            FALINTIL-FDTL: Divisão de Comunicação e Sistema de Informação @2026
          </p>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between no-print">
          <p className="text-sm text-slate-500">
            Página {page} de {totalPages}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="rounded-sm"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="rounded-sm"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Delete Dialog */}
      <Dialog open={deleteDialog.open} onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
          </DialogHeader>
          <p className="text-slate-600">
            Tem certeza que deseja excluir o membro <strong>{deleteDialog.member?.nome}</strong>?
            Esta ação não pode ser desfeita.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialog({ open: false, member: null })}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete} data-testid="confirm-delete-button">
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
