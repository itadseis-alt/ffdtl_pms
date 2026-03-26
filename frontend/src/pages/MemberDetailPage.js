import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '../components/ui/dialog';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../components/ui/dropdown-menu';
import { ArrowLeft, Edit, Printer, FileText, User, FileCheck, GraduationCap, Award, Briefcase, Globe, Monitor, Gavel, Medal, Calendar, Heart, Users, Shirt, Package, ChevronDown } from 'lucide-react';
import { toast } from 'sonner';
import { useReactToPrint } from 'react-to-print';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;
const LOGO = "https://static.prod-images.emergentagent.com/jobs/c19a0984-e82e-494a-88ed-ca23a6e50af4/images/79d39cdf6f7a79fab98f970d607b22ce980c214e0ef3771881e5abae75ac250c.png";

const STATUS_COLORS = {
  'Ativo': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-100',
  'Falecido': 'bg-slate-200 text-slate-800 dark:bg-slate-700 dark:text-slate-100',
  'Separação do Serviço': 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-100',
  'Reserva': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
  'Reforma': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-100'
};

const MEMBER_STATUS = ['Ativo', 'Falecido', 'Separação do Serviço', 'Reserva', 'Reforma'];

const TABS = [
  { id: 'pessoais', label: 'Dados Pessoais', icon: User },
  { id: 'documentos', label: 'Documentos', icon: FileCheck },
  { id: 'habilitacoes', label: 'Habilitações', icon: GraduationCap },
  { id: 'cursos', label: 'Cursos', icon: Award },
  { id: 'formacao', label: 'Formação Militar', icon: Award },
  { id: 'carreira', label: 'Carreira', icon: Award },
  { id: 'experiencia', label: 'Experiência', icon: Briefcase },
  { id: 'linguas', label: 'Línguas', icon: Globe },
  { id: 'informatica', label: 'Informática', icon: Monitor },
  { id: 'disciplinar', label: 'Disciplinar', icon: Gavel },
  { id: 'louvores', label: 'Louvores', icon: Medal },
  { id: 'licencas', label: 'Licenças', icon: Calendar },
  { id: 'medico', label: 'Estado Médico', icon: Heart },
  { id: 'familia', label: 'Família', icon: Users },
  { id: 'vestuario', label: 'Vestuário', icon: Shirt },
  { id: 'equipamentos', label: 'Equipamentos', icon: Package },
];

export default function MemberDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { canEdit } = useAuth();
  const printStepRef = useRef();
  const printAllRef = useRef();
  
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pessoais');
  const [statusDialog, setStatusDialog] = useState({ open: false, newStatus: '' });

  useEffect(() => {
    fetchMember();
  }, [id]);

  const fetchMember = async () => {
    try {
      const response = await axios.get(`${API}/members/${id}`);
      setMember(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do membro');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async () => {
    try {
      await axios.put(`${API}/members/${id}/status?status=${statusDialog.newStatus}`);
      toast.success('Status alterado com sucesso');
      setStatusDialog({ open: false, newStatus: '' });
      fetchMember();
    } catch (error) {
      toast.error('Erro ao alterar status');
    }
  };

  const handlePrintStep = useReactToPrint({
    contentRef: printStepRef,
    documentTitle: `Membro_${member?.nim}_${activeTab}`
  });

  const handlePrintAll = useReactToPrint({
    contentRef: printAllRef,
    documentTitle: `Membro_${member?.nim}_Completo`
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  if (!member) return null;

  const InfoRow = ({ label, value }) => (
    <div className="grid grid-cols-2 py-2 border-b border-border">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium">{value || '-'}</span>
    </div>
  );

  const DocumentRow = ({ label, value, anexo }) => (
    <div className="grid grid-cols-3 py-2 border-b border-border items-center">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm text-foreground font-medium">{value || '-'}</span>
      {anexo && (
        <a href={anexo} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-1 print-hide-anexo">
          <FileText className="h-4 w-4" /> Ver Anexo
        </a>
      )}
    </div>
  );

  const ListSection = ({ title, items, fields }) => {
    if (!items || items.length === 0) return <p className="text-sm text-muted-foreground">Nenhum registro</p>;
    return (
      <div className="space-y-4">
        {items.map((item, idx) => (
          <Card key={idx} className="border border-border rounded-sm shadow-none">
            <CardContent className="p-4">
              {fields.map((field) => (
                <InfoRow key={field.key} label={field.label} value={item[field.key]} />
              ))}
              {item.anexo && (
                <div className="mt-2 print-hide-anexo">
                  <a href={item.anexo} target="_blank" rel="noopener noreferrer" className="text-sm text-emerald-600 hover:underline flex items-center gap-1">
                    <FileText className="h-4 w-4" /> {item.anexo_nome || 'Ver Anexo'}
                  </a>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  // Render all sections for complete print
  const renderAllSections = () => (
    <div className="space-y-8">
      {/* Dados Pessoais */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">1. Dados Pessoais</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
          <div>
            <InfoRow label="Nome" value={member.nome} />
            <InfoRow label="NIM" value={member.nim} />
            <InfoRow label="Posto" value={member.posto} />
            <InfoRow label="Atual Função" value={member.atual_funcao} />
            <InfoRow label="Unidade" value={member.unidade} />
            <InfoRow label="Sexo" value={member.sexo === 'M' ? 'Masculino' : 'Feminino'} />
            <InfoRow label="Data de Nascimento" value={member.data_nascimento} />
          </div>
          <div>
            <InfoRow label="Naturalidade" value={member.naturalidade} />
            <InfoRow label="Estado Civil" value={member.estado_civil} />
            <InfoRow label="Residência Atual" value={member.residencia_atual} />
            <InfoRow label="Município" value={member.municipio} />
            <InfoRow label="Nacionalidade" value={member.nacionalidade} />
            <InfoRow label="Nº de Contacto" value={member.numero_contacto} />
            <InfoRow label="E-mail" value={member.email} />
            <InfoRow label="Tipo Sanguíneo" value={member.tipo_sanguineo} />
          </div>
        </div>
      </div>

      {/* Documentos */}
      <div className="print-break">
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">2. Documentos de Identificação</h3>
        <InfoRow label="Payroll No" value={member.payroll_no} />
        <InfoRow label="NISS No" value={member.niss_no} />
        <InfoRow label="No. Utente" value={member.utente_no} />
        <InfoRow label="Cartão Eleitoral" value={member.cartao_eleitoral} />
        <InfoRow label="Bilhete de Identidade" value={member.bilhete_identidade} />
        <InfoRow label="Certidão de RDTL" value={member.certidao_rdtl} />
        <InfoRow label="Passaporte" value={member.passaporte} />
        <InfoRow label="Cartão de Condução" value={member.cartao_conducao?.join(', ')} />
      </div>

      {/* Habilitações */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">3. Habilitações Literárias</h3>
        <ListSection items={member.habilitacoes} fields={[
          { key: 'ano_estudo', label: 'Ano de Estudo' },
          { key: 'grau_estudo', label: 'Grau de Estudo' },
          { key: 'area_estudo', label: 'Área de Estudo' },
          { key: 'local_curso', label: 'Local do Curso' }
        ]} />
      </div>

      {/* Cursos */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">4. Cursos Informais</h3>
        <ListSection items={member.cursos_informais} fields={[
          { key: 'descricao', label: 'Descrição' },
          { key: 'periodo_inicio', label: 'Período Início' },
          { key: 'periodo_fim', label: 'Período Fim' },
          { key: 'local_curso', label: 'Local do Curso' }
        ]} />
      </div>

      {/* Formação Militar */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">5. Formação na Carreira Militar</h3>
        <ListSection items={member.formacao_militar} fields={[
          { key: 'ano_periodo', label: 'Ano/Período' },
          { key: 'tipo_formacao', label: 'Tipo de Formação' },
          { key: 'instituto', label: 'Instituto' },
          { key: 'valor', label: 'Valor' },
          { key: 'resultado', label: 'Resultado' }
        ]} />
      </div>

      {/* Carreira */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">6. Carreira de Formação</h3>
        <ListSection items={member.carreira} fields={[
          { key: 'posto', label: 'Posto/Galões' },
          { key: 'data_promocao', label: 'Data de Promoção' },
          { key: 'lugar_promocao', label: 'Lugar de Promoção' }
        ]} />
      </div>

      {/* Experiência */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">7. Experiência de Serviço</h3>
        <ListSection items={member.experiencia_servico} fields={[
          { key: 'desde', label: 'Desde' },
          { key: 'unidade_componente', label: 'Unidade/Componente' },
          { key: 'funcao_desempenho', label: 'Função Desempenhada' }
        ]} />
      </div>

      {/* Línguas */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">8. Habilidade de Língua</h3>
        <ListSection items={member.habilidade_lingua} fields={[
          { key: 'lingua', label: 'Língua' },
          { key: 'falar', label: 'Falar' },
          { key: 'escrever', label: 'Escrever' },
          { key: 'ouvir', label: 'Ouvir' }
        ]} />
      </div>

      {/* Informática */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">9. Conhecimento Informática</h3>
        <InfoRow label="Conhecimento Informática" value={member.conhecimento_informatica} />
        <InfoRow label="Outras Informações" value={member.outras_informacoes} />
      </div>

      {/* Disciplinar */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">10. Situação Disciplinar</h3>
        <ListSection items={member.situacao_disciplinar} fields={[
          { key: 'tipo_caso', label: 'Tipo do Caso' },
          { key: 'tipo_punicao', label: 'Tipo de Punição' },
          { key: 'local_processo', label: 'Local do Processo' },
          { key: 'data_cumprimento', label: 'Data de Cumprimento' },
          { key: 'duracao_pena', label: 'Duração da Pena' },
          { key: 'data_anula', label: 'Data Anula do Processo' }
        ]} />
      </div>

      {/* Louvores */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">11. Louvores e Condecorações</h3>
        <ListSection items={member.louvores} fields={[
          { key: 'tipo_louvor', label: 'Tipo de Louvor' },
          { key: 'tipo_condecoracao', label: 'Tipo de Condecoração' },
          { key: 'data', label: 'Data' },
          { key: 'concebida_por', label: 'Concebida por' }
        ]} />
      </div>

      {/* Licenças */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">12. Licenças</h3>
        <ListSection items={member.licencas} fields={[
          { key: 'tipo_licenca', label: 'Tipo de Licença' },
          { key: 'data_inicio', label: 'Data Início' },
          { key: 'data_fim', label: 'Data Fim' },
          { key: 'concebida_por', label: 'Concebida por' },
          { key: 'quantos_dias', label: 'Quantos Dias' },
          { key: 'quantas_vezes', label: 'Quantas Vezes' }
        ]} />
      </div>

      {/* Estado Médico */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">13. Estado Médico</h3>
        <ListSection items={member.estado_medico} fields={[
          { key: 'estado_fisico', label: 'Estado Físico' },
          { key: 'estado_mental', label: 'Estado Mental' },
          { key: 'causas', label: 'Causas' }
        ]} />
      </div>

      {/* Família */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">14. Afiliação Familiar</h3>
        <InfoRow label="Nome do Pai" value={member.nome_pai} />
        <InfoRow label="Nome da Mãe" value={member.nome_mae} />
        <InfoRow label="Nome do/a Cônjuge" value={member.nome_conjuge} />
        {member.filhos && member.filhos.length > 0 && (
          <div className="mt-2">
            {member.filhos.map((filho, idx) => (
              <InfoRow key={idx} label={`${idx + 1}º Filho(a)`} value={filho} />
            ))}
          </div>
        )}
      </div>

      {/* Vestuário */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">15. Dados Vestuário</h3>
        <ListSection items={member.vestuario} fields={[
          { key: 'tipo_vestuario', label: 'Tipo de Vestuário' },
          { key: 'medida_tamanho', label: 'Medida/Tamanho' }
        ]} />
      </div>

      {/* Equipamentos */}
      <div>
        <h3 className="text-lg font-semibold text-foreground mb-4 border-b border-border pb-2">16. Equipamentos</h3>
        <h4 className="text-sm font-semibold text-foreground mb-2">Equipamentos em Posse</h4>
        <ListSection items={member.equipamentos} fields={[
          { key: 'equipamento', label: 'Equipamento/Material' },
          { key: 'tipo', label: 'Tipo' },
          { key: 'numero_identificacao', label: 'Número Identificação' },
          { key: 'quantidade', label: 'Quantidade' },
          { key: 'data_inicio', label: 'Data Início' }
        ]} />
        {member.entregas_equipamentos && member.entregas_equipamentos.length > 0 && (
          <>
            <h4 className="text-sm font-semibold text-foreground mb-2 mt-4">Entregas de Equipamentos</h4>
            <ListSection items={member.entregas_equipamentos} fields={[
              { key: 'equipamento', label: 'Equipamento/Material' },
              { key: 'data_entrega', label: 'Data de Entrega' },
              { key: 'recebido_por', label: 'Recebido por' }
            ]} />
          </>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/members')} className="rounded-sm" data-testid="back-button">
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {member.nome}
            </h1>
            <p className="text-sm text-muted-foreground">NIM: {member.nim}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {canEdit && (
            <>
              <Select 
                value={member.status} 
                onValueChange={(v) => setStatusDialog({ open: true, newStatus: v })}
              >
                <SelectTrigger className="w-[180px] rounded-sm" data-testid="status-select">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MEMBER_STATUS.map((status) => (
                    <SelectItem key={status} value={status}>{status}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                onClick={() => navigate(`/members/${id}/edit`)}
                className="rounded-sm"
                data-testid="edit-member-button"
              >
                <Edit className="h-4 w-4 mr-2" /> Editar
              </Button>
            </>
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="rounded-sm" data-testid="print-dropdown">
                <Printer className="h-4 w-4 mr-2" /> Imprimir <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={handlePrintStep} data-testid="print-step-option">
                <FileText className="h-4 w-4 mr-2" /> Imprimir Step Atual
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handlePrintAll} data-testid="print-all-option">
                <FileText className="h-4 w-4 mr-2" /> Imprimir Dados Completos
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Profile Card - Hidden in print */}
      <Card className="border border-border rounded-sm shadow-none no-print">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="flex-shrink-0 print-hide-photo">
              {member.foto_perfil ? (
                <img src={member.foto_perfil} alt={member.nome} className="w-32 h-32 rounded-sm object-cover border border-border" />
              ) : (
                <div className="w-32 h-32 rounded-sm bg-muted flex items-center justify-center text-muted-foreground text-4xl font-bold border border-border">
                  {member.nome?.charAt(0)}
                </div>
              )}
            </div>
            <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Posto</p>
                <p className="font-semibold text-foreground">{member.posto}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Unidade</p>
                <p className="font-semibold text-foreground">{member.unidade}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>
                <Badge className={`${STATUS_COLORS[member.status]} rounded-sm mt-1`}>{member.status}</Badge>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Idade</p>
                <p className="font-semibold text-foreground">{member.idade} anos</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Sexo</p>
                <p className="font-semibold text-foreground">{member.sexo === 'M' ? 'Masculino' : 'Feminino'}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">Tipo Sanguíneo</p>
                <p className="font-semibold text-foreground">{member.tipo_sanguineo}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs Navigation - Hidden in print */}
      <div className="flex overflow-x-auto gap-1 pb-2 no-print">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className={`rounded-sm whitespace-nowrap ${activeTab === tab.id ? 'bg-emerald-700 text-white' : ''}`}
              data-testid={`tab-${tab.id}`}
            >
              <Icon className="h-4 w-4 mr-1" /> {tab.label}
            </Button>
          );
        })}
      </div>

      {/* Tab Content - For Step Print */}
      <div ref={printStepRef}>
        {/* Print Header */}
        <div className="hidden print:block mb-6">
          <div className="flex items-center justify-between border-b pb-4">
            <img src={LOGO} alt="Logo" className="h-16 w-16" />
            <div className="text-center">
              <h2 className="text-xl font-bold">FALINTIL-FDTL</h2>
              <p className="text-sm">Ficha do Membro - {member.nome}</p>
              <p className="text-xs text-muted-foreground">NIM: {member.nim} | {new Date().toLocaleDateString('pt-PT')}</p>
            </div>
            <div className="w-16"></div>
          </div>
        </div>

        <Card className="border border-border rounded-sm shadow-none">
          <CardHeader className="border-b border-border">
            <CardTitle className="text-lg text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
              {TABS.find(t => t.id === activeTab)?.label}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            {activeTab === 'pessoais' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
                <div>
                  <InfoRow label="Nome" value={member.nome} />
                  <InfoRow label="NIM" value={member.nim} />
                  <InfoRow label="Posto" value={member.posto} />
                  <InfoRow label="Atual Função" value={member.atual_funcao} />
                  <InfoRow label="Unidade" value={member.unidade} />
                  <InfoRow label="Sexo" value={member.sexo === 'M' ? 'Masculino' : 'Feminino'} />
                  <InfoRow label="Data de Nascimento" value={member.data_nascimento} />
                </div>
                <div>
                  <InfoRow label="Naturalidade" value={member.naturalidade} />
                  <InfoRow label="Estado Civil" value={member.estado_civil} />
                  <InfoRow label="Residência Atual" value={member.residencia_atual} />
                  <InfoRow label="Município" value={member.municipio} />
                  <InfoRow label="Nacionalidade" value={member.nacionalidade} />
                  <InfoRow label="Nº de Contacto" value={member.numero_contacto} />
                  <InfoRow label="E-mail" value={member.email} />
                  <InfoRow label="Tipo Sanguíneo" value={member.tipo_sanguineo} />
                </div>
              </div>
            )}

            {activeTab === 'documentos' && (
              <div>
                <DocumentRow label="Payroll No" value={member.payroll_no} anexo={member.payroll_anexo} />
                <DocumentRow label="NISS No" value={member.niss_no} anexo={member.niss_anexo} />
                <DocumentRow label="No. Utente" value={member.utente_no} anexo={member.utente_anexo} />
                <DocumentRow label="Cartão Eleitoral" value={member.cartao_eleitoral} anexo={member.cartao_eleitoral_anexo} />
                <DocumentRow label="Bilhete de Identidade" value={member.bilhete_identidade} anexo={member.bilhete_identidade_anexo} />
                <DocumentRow label="Certidão de RDTL" value={member.certidao_rdtl} anexo={member.certidao_rdtl_anexo} />
                <DocumentRow label="Passaporte" value={member.passaporte} anexo={member.passaporte_anexo} />
                <DocumentRow label="Cartão de Condução" value={member.cartao_conducao?.join(', ')} anexo={member.cartao_conducao_anexo} />
              </div>
            )}

            {activeTab === 'habilitacoes' && (
              <ListSection items={member.habilitacoes} fields={[
                { key: 'ano_estudo', label: 'Ano de Estudo' },
                { key: 'grau_estudo', label: 'Grau de Estudo' },
                { key: 'area_estudo', label: 'Área de Estudo' },
                { key: 'local_curso', label: 'Local do Curso' }
              ]} />
            )}

            {activeTab === 'cursos' && (
              <ListSection items={member.cursos_informais} fields={[
                { key: 'descricao', label: 'Descrição' },
                { key: 'periodo_inicio', label: 'Período Início' },
                { key: 'periodo_fim', label: 'Período Fim' },
                { key: 'local_curso', label: 'Local do Curso' }
              ]} />
            )}

            {activeTab === 'formacao' && (
              <ListSection items={member.formacao_militar} fields={[
                { key: 'ano_periodo', label: 'Ano/Período' },
                { key: 'tipo_formacao', label: 'Tipo de Formação' },
                { key: 'instituto', label: 'Instituto' },
                { key: 'valor', label: 'Valor' },
                { key: 'resultado', label: 'Resultado' }
              ]} />
            )}

            {activeTab === 'carreira' && (
              <ListSection items={member.carreira} fields={[
                { key: 'posto', label: 'Posto/Galões' },
                { key: 'data_promocao', label: 'Data de Promoção' },
                { key: 'lugar_promocao', label: 'Lugar de Promoção' }
              ]} />
            )}

            {activeTab === 'experiencia' && (
              <ListSection items={member.experiencia_servico} fields={[
                { key: 'desde', label: 'Desde' },
                { key: 'unidade_componente', label: 'Unidade/Componente' },
                { key: 'funcao_desempenho', label: 'Função Desempenhada' }
              ]} />
            )}

            {activeTab === 'linguas' && (
              <ListSection items={member.habilidade_lingua} fields={[
                { key: 'lingua', label: 'Língua' },
                { key: 'falar', label: 'Falar' },
                { key: 'escrever', label: 'Escrever' },
                { key: 'ouvir', label: 'Ouvir' }
              ]} />
            )}

            {activeTab === 'informatica' && (
              <div>
                <InfoRow label="Conhecimento Informática" value={member.conhecimento_informatica} />
                <InfoRow label="Outras Informações" value={member.outras_informacoes} />
              </div>
            )}

            {activeTab === 'disciplinar' && (
              <ListSection items={member.situacao_disciplinar} fields={[
                { key: 'tipo_caso', label: 'Tipo do Caso' },
                { key: 'tipo_punicao', label: 'Tipo de Punição' },
                { key: 'local_processo', label: 'Local do Processo' },
                { key: 'data_cumprimento', label: 'Data de Cumprimento' },
                { key: 'duracao_pena', label: 'Duração da Pena' },
                { key: 'data_anula', label: 'Data Anula do Processo' }
              ]} />
            )}

            {activeTab === 'louvores' && (
              <ListSection items={member.louvores} fields={[
                { key: 'tipo_louvor', label: 'Tipo de Louvor' },
                { key: 'tipo_condecoracao', label: 'Tipo de Condecoração' },
                { key: 'data', label: 'Data' },
                { key: 'concebida_por', label: 'Concebida por' }
              ]} />
            )}

            {activeTab === 'licencas' && (
              <ListSection items={member.licencas} fields={[
                { key: 'tipo_licenca', label: 'Tipo de Licença' },
                { key: 'data_inicio', label: 'Data Início' },
                { key: 'data_fim', label: 'Data Fim' },
                { key: 'concebida_por', label: 'Concebida por' },
                { key: 'quantos_dias', label: 'Quantos Dias' },
                { key: 'quantas_vezes', label: 'Quantas Vezes' }
              ]} />
            )}

            {activeTab === 'medico' && (
              <ListSection items={member.estado_medico} fields={[
                { key: 'estado_fisico', label: 'Estado Físico' },
                { key: 'estado_mental', label: 'Estado Mental' },
                { key: 'causas', label: 'Causas' }
              ]} />
            )}

            {activeTab === 'familia' && (
              <div>
                <InfoRow label="Nome do Pai" value={member.nome_pai} />
                <InfoRow label="Nome da Mãe" value={member.nome_mae} />
                <InfoRow label="Nome do/a Cônjuge" value={member.nome_conjuge} />
                {member.filhos && member.filhos.length > 0 && (
                  <div className="mt-4">
                    <p className="text-sm text-muted-foreground mb-2">Filhos:</p>
                    {member.filhos.map((filho, idx) => (
                      <InfoRow key={idx} label={`${idx + 1}º Filho(a)`} value={filho} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'vestuario' && (
              <ListSection items={member.vestuario} fields={[
                { key: 'tipo_vestuario', label: 'Tipo de Vestuário' },
                { key: 'medida_tamanho', label: 'Medida/Tamanho' }
              ]} />
            )}

            {activeTab === 'equipamentos' && (
              <div className="space-y-6">
                <div>
                  <h4 className="text-sm font-semibold text-foreground mb-4">Equipamentos em Posse</h4>
                  <ListSection items={member.equipamentos} fields={[
                    { key: 'equipamento', label: 'Equipamento/Material' },
                    { key: 'tipo', label: 'Tipo' },
                    { key: 'numero_identificacao', label: 'Número Identificação' },
                    { key: 'quantidade', label: 'Quantidade' },
                    { key: 'data_inicio', label: 'Data Início' }
                  ]} />
                </div>
                {member.entregas_equipamentos && member.entregas_equipamentos.length > 0 && (
                  <div>
                    <h4 className="text-sm font-semibold text-foreground mb-4">Entregas de Equipamentos</h4>
                    <ListSection items={member.entregas_equipamentos} fields={[
                      { key: 'equipamento', label: 'Equipamento/Material' },
                      { key: 'data_entrega', label: 'Data de Entrega' },
                      { key: 'recebido_por', label: 'Recebido por' }
                    ]} />
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Print Footer */}
        <div className="hidden print:block mt-6 pt-4 border-t">
          <p className="text-xs text-center text-muted-foreground">
            FALINTIL-FDTL: Divisão de Comunicação e Sistema de Informação @2026
          </p>
        </div>
      </div>

      {/* Hidden Complete Print Area */}
      <div className="hidden">
        <div ref={printAllRef} className="p-8">
          {/* Print Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between border-b pb-4">
              <img src={LOGO} alt="Logo" className="h-16 w-16" />
              <div className="text-center">
                <h2 className="text-xl font-bold">FALINTIL-FDTL</h2>
                <p className="text-sm">Ficha Completa do Membro</p>
                <p className="text-lg font-semibold">{member.nome}</p>
                <p className="text-xs">NIM: {member.nim} | {new Date().toLocaleDateString('pt-PT')}</p>
              </div>
              <div className="w-16"></div>
            </div>
          </div>

          {renderAllSections()}

          {/* Print Footer */}
          <div className="mt-6 pt-4 border-t">
            <p className="text-xs text-center">
              FALINTIL-FDTL: Divisão de Comunicação e Sistema de Informação @2026
            </p>
          </div>
        </div>
      </div>

      {/* Status Change Dialog */}
      <Dialog open={statusDialog.open} onOpenChange={(open) => setStatusDialog({ ...statusDialog, open })}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Alteração de Status</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            Tem certeza que deseja alterar o status do membro <strong>{member.nome}</strong> para <strong>{statusDialog.newStatus}</strong>?
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setStatusDialog({ open: false, newStatus: '' })}>
              Cancelar
            </Button>
            <Button onClick={handleStatusChange} className="bg-emerald-700 hover:bg-emerald-600" data-testid="confirm-status-change">
              Confirmar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
