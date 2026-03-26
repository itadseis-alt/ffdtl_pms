import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { ArrowLeft, ArrowRight, Save, Plus, Trash2, Upload, Check, FileText, X } from 'lucide-react';
import { toast } from 'sonner';

const API = `${process.env.REACT_APP_BACKEND_URL}/api`;

const STEPS = [
  'Dados Pessoais', 'Documentos', 'Habilitações', 'Cursos Informais',
  'Formação Militar', 'Carreira', 'Experiência de Serviço', 'Habilidade de Língua',
  'Conhecimento Informática', 'Situação Disciplinar', 'Louvores e Condecorações', 'Licenças',
  'Estado Médico', 'Afiliação Familiar', 'Dados Vestuário', 'Equipamentos'
];

const NACIONALIDADES = [
  "Timorense", "Portuguesa", "Indonésia", "Australiana", "Brasileira", "Americana", 
  "Chinesa", "Japonesa", "Filipina", "Malaia", "Singapurense", "Tailandesa", "Vietnamita",
  "Indiana", "Paquistanesa", "Bangladeshi", "Sri Lanka", "Nepalesa", "Birmanesa",
  "Britânica", "Francesa", "Alemã", "Italiana", "Espanhola", "Holandesa", "Belga",
  "Suíça", "Austríaca", "Norueguesa", "Sueca", "Dinamarquesa", "Finlandesa",
  "Russa", "Ucraniana", "Polaca", "Checa", "Húngara", "Romena", "Búlgara",
  "Grega", "Turca", "Israelita", "Saudita", "Emiradense", "Egípcia", "Sul-Africana",
  "Nigeriana", "Queniana", "Etíope", "Marroquina", "Argelina", "Tunisina",
  "Canadiana", "Mexicana", "Colombiana", "Argentina", "Chilena", "Peruana", "Venezuelana",
  "Neo-Zelandesa", "Outra"
];

export default function MemberFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState({});
  
  // Constants
  const [postos, setPostos] = useState({});
  const [unidades, setUnidades] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [estadoCivil, setEstadoCivil] = useState([]);
  const [tiposSanguineos, setTiposSanguineos] = useState([]);
  const [grausEstudo, setGrausEstudo] = useState([]);
  const [tiposPunicao, setTiposPunicao] = useState([]);
  const [tiposLicenca, setTiposLicenca] = useState([]);
  const [cartaoConducao, setCartaoConducao] = useState([]);
  
  // Form data
  const [formData, setFormData] = useState({
    // Step 1: Dados Pessoais
    nome: '', nim: '', posto: '', atual_funcao: '', unidade: '', sexo: '',
    data_nascimento: '', naturalidade: '', estado_civil: '', residencia_atual: '',
    municipio: '', nacionalidade: '', numero_contacto: '', email: '', tipo_sanguineo: '',
    foto_perfil: '', foto_perfil_nome: '', status: 'Ativo',
    
    // Step 2: Documentos
    payroll_no: '', payroll_anexo: '', payroll_anexo_nome: '',
    niss_no: '', niss_anexo: '', niss_anexo_nome: '',
    utente_no: '', utente_anexo: '', utente_anexo_nome: '',
    cartao_eleitoral: '', cartao_eleitoral_anexo: '', cartao_eleitoral_anexo_nome: '',
    bilhete_identidade: '', bilhete_identidade_anexo: '', bilhete_identidade_anexo_nome: '',
    certidao_rdtl: '', certidao_rdtl_anexo: '', certidao_rdtl_anexo_nome: '',
    passaporte: '', passaporte_anexo: '', passaporte_anexo_nome: '',
    cartao_conducao: [], cartao_conducao_anexo: '', cartao_conducao_anexo_nome: '',
    
    // Step 3: Habilitações
    habilitacoes: [],
    
    // Step 4: Cursos Informais
    cursos_informais: [],
    
    // Step 5: Formação Militar
    formacao_militar: [],
    
    // Step 6: Carreira
    carreira: [],
    
    // Step 7: Experiência de Serviço
    experiencia_servico: [],
    
    // Step 8: Habilidade de Língua
    habilidade_lingua: [],
    
    // Step 9: Conhecimento Informática
    conhecimento_informatica: '', outras_informacoes: '', informatica_anexo: '', informatica_anexo_nome: '',
    
    // Step 10: Situação Disciplinar
    situacao_disciplinar: [],
    
    // Step 11: Louvores
    louvores: [],
    
    // Step 12: Licenças
    licencas: [],
    
    // Step 13: Estado Médico
    estado_medico: [],
    
    // Step 14: Afiliação Familiar
    nome_pai: '', nome_mae: '', nome_conjuge: '', filhos: [], familia_anexo: '', familia_anexo_nome: '',
    
    // Step 15: Vestuário
    vestuario: [],
    
    // Step 16: Equipamentos
    equipamentos: [], entregas_equipamentos: []
  });

  useEffect(() => {
    fetchConstants();
    if (isEdit) {
      fetchMember();
    }
  }, [id]);

  const fetchConstants = async () => {
    try {
      const [postosRes, unidadesRes, municipiosRes, estadoCivilRes, tiposSanguineosRes, 
             grausEstudoRes, tiposPunicaoRes, tiposLicencaRes, cartaoConducaoRes] = await Promise.all([
        axios.get(`${API}/constants/postos`),
        axios.get(`${API}/constants/unidades`),
        axios.get(`${API}/constants/municipios`),
        axios.get(`${API}/constants/estado-civil`),
        axios.get(`${API}/constants/tipos-sanguineos`),
        axios.get(`${API}/constants/graus-estudo`),
        axios.get(`${API}/constants/tipos-punicao`),
        axios.get(`${API}/constants/tipos-licenca`),
        axios.get(`${API}/constants/cartao-conducao`)
      ]);
      setPostos(postosRes.data);
      setUnidades(unidadesRes.data);
      setMunicipios(municipiosRes.data);
      setEstadoCivil(estadoCivilRes.data);
      setTiposSanguineos(tiposSanguineosRes.data);
      setGrausEstudo(grausEstudoRes.data);
      setTiposPunicao(tiposPunicaoRes.data);
      setTiposLicenca(tiposLicencaRes.data);
      setCartaoConducao(cartaoConducaoRes.data);
    } catch (error) {
      console.error('Error fetching constants:', error);
    }
  };

  const fetchMember = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API}/members/${id}`);
      setFormData(response.data);
    } catch (error) {
      toast.error('Erro ao carregar dados do membro');
      navigate('/members');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleArrayAdd = (field, template) => {
    setFormData(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), { ...template }]
    }));
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  const handleArrayChange = (field, index, key, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].map((item, i) => i === index ? { ...item, [key]: value } : item)
    }));
  };

  const handleFileUpload = async (field, file, nameField = null) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    setUploadingFiles(prev => ({ ...prev, [field]: true }));
    
    try {
      const response = await axios.post(`${API}/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleInputChange(field, `${API}/files/${response.data.file_id}`);
      if (nameField) {
        handleInputChange(nameField, file.name);
      }
      toast.success('Arquivo enviado com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [field]: false }));
    }
  };

  const handleArrayFileUpload = async (arrayField, index, file) => {
    const formDataUpload = new FormData();
    formDataUpload.append('file', file);
    
    const uploadKey = `${arrayField}_${index}`;
    setUploadingFiles(prev => ({ ...prev, [uploadKey]: true }));
    
    try {
      const response = await axios.post(`${API}/upload`, formDataUpload, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      handleArrayChange(arrayField, index, 'anexo', `${API}/files/${response.data.file_id}`);
      handleArrayChange(arrayField, index, 'anexo_nome', file.name);
      toast.success('Arquivo enviado com sucesso');
    } catch (error) {
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploadingFiles(prev => ({ ...prev, [uploadKey]: false }));
    }
  };

  const clearFile = (field, nameField = null) => {
    handleInputChange(field, '');
    if (nameField) {
      handleInputChange(nameField, '');
    }
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.nome || !formData.nim || !formData.posto || !formData.unidade || 
        !formData.sexo || !formData.data_nascimento || !formData.naturalidade ||
        !formData.estado_civil || !formData.municipio || !formData.nacionalidade || !formData.tipo_sanguineo) {
      toast.error('Por favor, preencha todos os campos obrigatórios do Step 1');
      setCurrentStep(0);
      return;
    }

    setSaving(true);
    try {
      if (isEdit) {
        await axios.put(`${API}/members/${id}`, formData);
        toast.success('Membro atualizado com sucesso');
      } else {
        await axios.post(`${API}/members`, formData);
        toast.success('Membro cadastrado com sucesso');
      }
      navigate('/members');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Erro ao salvar membro');
    } finally {
      setSaving(false);
    }
  };

  // File Upload Field Component
  const FileUploadField = ({ label, field, value, nameField, fileName }) => (
    <div className="space-y-2">
      <Label className="text-foreground">{label}</Label>
      {value ? (
        <div className="flex items-center gap-2 p-2 border border-border rounded-sm bg-muted/50">
          <FileText className="h-4 w-4 text-emerald-600" />
          <span className="text-sm text-foreground flex-1 truncate">{fileName || 'Documento anexado'}</span>
          <a href={value} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm hover:underline">
            Ver
          </a>
          <Button variant="ghost" size="sm" onClick={() => clearFile(field, nameField)} className="h-6 w-6 p-0">
            <X className="h-4 w-4 text-red-500" />
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={(e) => e.target.files[0] && handleFileUpload(field, e.target.files[0], nameField)}
            className="rounded-sm"
            disabled={uploadingFiles[field]}
          />
          {uploadingFiles[field] && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80">
              <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // Array File Upload Component
  const ArrayFileUpload = ({ arrayField, index, item }) => {
    const uploadKey = `${arrayField}_${index}`;
    return (
      <div className="space-y-2 md:col-span-2">
        <Label className="text-foreground">Anexo PDF</Label>
        {item.anexo ? (
          <div className="flex items-center gap-2 p-2 border border-border rounded-sm bg-muted/50">
            <FileText className="h-4 w-4 text-emerald-600" />
            <span className="text-sm text-foreground flex-1 truncate">{item.anexo_nome || 'Documento anexado'}</span>
            <a href={item.anexo} target="_blank" rel="noopener noreferrer" className="text-emerald-600 text-sm hover:underline">
              Ver
            </a>
            <Button variant="ghost" size="sm" onClick={() => {
              handleArrayChange(arrayField, index, 'anexo', '');
              handleArrayChange(arrayField, index, 'anexo_nome', '');
            }} className="h-6 w-6 p-0">
              <X className="h-4 w-4 text-red-500" />
            </Button>
          </div>
        ) : (
          <div className="relative">
            <Input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => e.target.files[0] && handleArrayFileUpload(arrayField, index, e.target.files[0])}
              className="rounded-sm"
              disabled={uploadingFiles[uploadKey]}
            />
            {uploadingFiles[uploadKey] && (
              <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                <div className="animate-spin h-4 w-4 border-2 border-emerald-600 border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate('/members')} className="rounded-sm">
          <ArrowLeft className="h-4 w-4 mr-2" /> Voltar
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            {isEdit ? 'Editar Membro' : 'Novo Membro'}
          </h1>
        </div>
      </div>

      {/* Stepper */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {STEPS.map((step, index) => (
          <button
            key={index}
            onClick={() => setCurrentStep(index)}
            className={`flex items-center gap-2 px-3 py-2 rounded-sm text-sm whitespace-nowrap transition-colors ${
              currentStep === index
                ? 'bg-amber-500 text-white'
                : index < currentStep
                ? 'bg-emerald-700 text-white'
                : 'bg-muted text-muted-foreground'
            }`}
            data-testid={`step-${index + 1}`}
          >
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center text-xs">
              {index < currentStep ? <Check className="h-3 w-3" /> : index + 1}
            </span>
            <span className="hidden md:inline">{step}</span>
          </button>
        ))}
      </div>

      {/* Form Content */}
      <Card className="border border-border rounded-sm shadow-none">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            Step {currentStep + 1}: {STEPS[currentStep]}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {/* Step 1: Dados Pessoais */}
          {currentStep === 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Nome *</Label>
                <Input value={formData.nome} onChange={(e) => handleInputChange('nome', e.target.value)} className="rounded-sm" data-testid="input-nome" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">NIM *</Label>
                <Input value={formData.nim} onChange={(e) => handleInputChange('nim', e.target.value)} className="rounded-sm" data-testid="input-nim" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Posto *</Label>
                <Select value={formData.posto} onValueChange={(v) => handleInputChange('posto', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-posto">
                    <SelectValue placeholder="Selecione o posto" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(postos).map(([category, items]) => (
                      <div key={category}>
                        <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">{category}</div>
                        {items.map((item) => (
                          <SelectItem key={item} value={item}>{item}</SelectItem>
                        ))}
                      </div>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Atual Função</Label>
                <Input value={formData.atual_funcao} onChange={(e) => handleInputChange('atual_funcao', e.target.value)} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Unidade *</Label>
                <Select value={formData.unidade} onValueChange={(v) => handleInputChange('unidade', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-unidade">
                    <SelectValue placeholder="Selecione a unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {unidades.map((unidade) => (
                      <SelectItem key={unidade} value={unidade}>{unidade}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Sexo *</Label>
                <Select value={formData.sexo} onValueChange={(v) => handleInputChange('sexo', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-sexo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">M</SelectItem>
                    <SelectItem value="F">F</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Data de Nascimento *</Label>
                <Input type="date" value={formData.data_nascimento} onChange={(e) => handleInputChange('data_nascimento', e.target.value)} className="rounded-sm" data-testid="input-data-nascimento" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Naturalidade *</Label>
                <Select value={formData.naturalidade} onValueChange={(v) => handleInputChange('naturalidade', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-naturalidade">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Estado Civil *</Label>
                <Select value={formData.estado_civil} onValueChange={(v) => handleInputChange('estado_civil', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-estado-civil">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {estadoCivil.map((ec) => (
                      <SelectItem key={ec} value={ec}>{ec}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Residência Atual</Label>
                <Input value={formData.residencia_atual} onChange={(e) => handleInputChange('residencia_atual', e.target.value)} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Município *</Label>
                <Select value={formData.municipio} onValueChange={(v) => handleInputChange('municipio', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-municipio">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {municipios.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nacionalidade *</Label>
                <Select value={formData.nacionalidade} onValueChange={(v) => handleInputChange('nacionalidade', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-nacionalidade">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {NACIONALIDADES.map((n) => (
                      <SelectItem key={n} value={n}>{n}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Nº de Contacto</Label>
                <Input value={formData.numero_contacto} onChange={(e) => handleInputChange('numero_contacto', e.target.value)} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">E-mail</Label>
                <Input type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="rounded-sm" />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Tipo Sanguíneo *</Label>
                <Select value={formData.tipo_sanguineo} onValueChange={(v) => handleInputChange('tipo_sanguineo', v)}>
                  <SelectTrigger className="rounded-sm" data-testid="select-tipo-sanguineo">
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposSanguineos.map((ts) => (
                      <SelectItem key={ts} value={ts}>{ts}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 md:col-span-2">
                <FileUploadField 
                  label="Foto de Perfil" 
                  field="foto_perfil" 
                  value={formData.foto_perfil}
                  nameField="foto_perfil_nome"
                  fileName={formData.foto_perfil_nome}
                />
                {formData.foto_perfil && (
                  <img src={formData.foto_perfil} alt="Preview" className="w-24 h-24 object-cover rounded-sm mt-2" />
                )}
              </div>
            </div>
          )}

          {/* Step 2: Documentos */}
          {currentStep === 1 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-foreground">Payroll No</Label>
                <Input value={formData.payroll_no} onChange={(e) => handleInputChange('payroll_no', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo Payroll" field="payroll_anexo" value={formData.payroll_anexo} nameField="payroll_anexo_nome" fileName={formData.payroll_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">NISS No</Label>
                <Input value={formData.niss_no} onChange={(e) => handleInputChange('niss_no', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo NISS" field="niss_anexo" value={formData.niss_anexo} nameField="niss_anexo_nome" fileName={formData.niss_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">No. Utente</Label>
                <Input value={formData.utente_no} onChange={(e) => handleInputChange('utente_no', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo Utente" field="utente_anexo" value={formData.utente_anexo} nameField="utente_anexo_nome" fileName={formData.utente_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">Cartão Eleitoral</Label>
                <Input value={formData.cartao_eleitoral} onChange={(e) => handleInputChange('cartao_eleitoral', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo Cartão Eleitoral" field="cartao_eleitoral_anexo" value={formData.cartao_eleitoral_anexo} nameField="cartao_eleitoral_anexo_nome" fileName={formData.cartao_eleitoral_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">Bilhete de Identidade</Label>
                <Input value={formData.bilhete_identidade} onChange={(e) => handleInputChange('bilhete_identidade', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo BI" field="bilhete_identidade_anexo" value={formData.bilhete_identidade_anexo} nameField="bilhete_identidade_anexo_nome" fileName={formData.bilhete_identidade_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">Certidão de RDTL</Label>
                <Input value={formData.certidao_rdtl} onChange={(e) => handleInputChange('certidao_rdtl', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo Certidão RDTL" field="certidao_rdtl_anexo" value={formData.certidao_rdtl_anexo} nameField="certidao_rdtl_anexo_nome" fileName={formData.certidao_rdtl_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">Passaporte</Label>
                <Input value={formData.passaporte} onChange={(e) => handleInputChange('passaporte', e.target.value)} className="rounded-sm" />
              </div>
              <FileUploadField label="Anexo Passaporte" field="passaporte_anexo" value={formData.passaporte_anexo} nameField="passaporte_anexo_nome" fileName={formData.passaporte_anexo_nome} />
              
              <div className="space-y-2">
                <Label className="text-foreground">Cartão de Condução</Label>
                <div className="flex flex-wrap gap-2">
                  {cartaoConducao.map((cc) => (
                    <label key={cc} className="flex items-center gap-2">
                      <Checkbox
                        checked={formData.cartao_conducao?.includes(cc)}
                        onCheckedChange={(checked) => {
                          const current = formData.cartao_conducao || [];
                          if (checked) {
                            handleInputChange('cartao_conducao', [...current, cc]);
                          } else {
                            handleInputChange('cartao_conducao', current.filter(c => c !== cc));
                          }
                        }}
                      />
                      <span className="text-sm text-foreground">{cc}</span>
                    </label>
                  ))}
                </div>
              </div>
              <FileUploadField label="Anexo Cartão Condução" field="cartao_conducao_anexo" value={formData.cartao_conducao_anexo} nameField="cartao_conducao_anexo_nome" fileName={formData.cartao_conducao_anexo_nome} />
            </div>
          )}

          {/* Step 3: Habilitações */}
          {currentStep === 2 && (
            <div className="space-y-4">
              {formData.habilitacoes?.map((hab, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Habilitação {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('habilitacoes', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Ano de Estudo</Label>
                        <Input type="number" value={hab.ano_estudo || ''} onChange={(e) => handleArrayChange('habilitacoes', index, 'ano_estudo', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Grau de Estudo</Label>
                        <Select value={hab.grau_estudo || ''} onValueChange={(v) => handleArrayChange('habilitacoes', index, 'grau_estudo', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {grausEstudo.map((g) => (
                              <SelectItem key={g} value={g}>{g}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Área de Estudo</Label>
                        <Input value={hab.area_estudo || ''} onChange={(e) => handleArrayChange('habilitacoes', index, 'area_estudo', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Local do Curso</Label>
                        <Input value={hab.local_curso || ''} onChange={(e) => handleArrayChange('habilitacoes', index, 'local_curso', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="habilitacoes" index={index} item={hab} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('habilitacoes', { ano_estudo: '', grau_estudo: '', area_estudo: '', local_curso: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Habilitação
              </Button>
            </div>
          )}

          {/* Step 4: Cursos Informais */}
          {currentStep === 3 && (
            <div className="space-y-4">
              {formData.cursos_informais?.map((curso, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Curso {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('cursos_informais', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground">Descrição Tipo de Curso ou Treinamento</Label>
                        <Textarea value={curso.descricao || ''} onChange={(e) => handleArrayChange('cursos_informais', index, 'descricao', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Período Início</Label>
                        <Input type="date" value={curso.periodo_inicio || ''} onChange={(e) => handleArrayChange('cursos_informais', index, 'periodo_inicio', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Período Fim</Label>
                        <Input type="date" value={curso.periodo_fim || ''} onChange={(e) => handleArrayChange('cursos_informais', index, 'periodo_fim', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Local do Curso</Label>
                        <Input value={curso.local_curso || ''} onChange={(e) => handleArrayChange('cursos_informais', index, 'local_curso', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="cursos_informais" index={index} item={curso} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('cursos_informais', { descricao: '', periodo_inicio: '', periodo_fim: '', local_curso: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Curso
              </Button>
            </div>
          )}

          {/* Step 5: Formação Militar */}
          {currentStep === 4 && (
            <div className="space-y-4">
              {formData.formacao_militar?.map((form, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Formação {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('formacao_militar', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Ano/Período</Label>
                        <Input type="date" value={form.ano_periodo || ''} onChange={(e) => handleArrayChange('formacao_militar', index, 'ano_periodo', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Formação</Label>
                        <Input value={form.tipo_formacao || ''} onChange={(e) => handleArrayChange('formacao_militar', index, 'tipo_formacao', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Instituto</Label>
                        <Input value={form.instituto || ''} onChange={(e) => handleArrayChange('formacao_militar', index, 'instituto', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Valor</Label>
                        <Input type="number" step="0.01" value={form.valor || ''} onChange={(e) => handleArrayChange('formacao_militar', index, 'valor', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Resultado</Label>
                        <Select value={form.resultado || ''} onValueChange={(v) => handleArrayChange('formacao_militar', index, 'resultado', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Passa">Passa</SelectItem>
                            <SelectItem value="Não Passa">Não Passa</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <ArrayFileUpload arrayField="formacao_militar" index={index} item={form} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('formacao_militar', { ano_periodo: '', tipo_formacao: '', instituto: '', valor: '', resultado: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Formação
              </Button>
            </div>
          )}

          {/* Step 6: Carreira */}
          {currentStep === 5 && (
            <div className="space-y-4">
              {formData.carreira?.map((car, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Promoção {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('carreira', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Posto/Galões</Label>
                        <Select value={car.posto || ''} onValueChange={(v) => handleArrayChange('carreira', index, 'posto', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione o posto" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(postos).map(([category, items]) => (
                              <div key={category}>
                                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground bg-muted">{category}</div>
                                {items.map((item) => (
                                  <SelectItem key={item} value={item}>{item}</SelectItem>
                                ))}
                              </div>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data de Promoção</Label>
                        <Input type="date" value={car.data_promocao || ''} onChange={(e) => handleArrayChange('carreira', index, 'data_promocao', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Lugar de Promoção</Label>
                        <Input value={car.lugar_promocao || ''} onChange={(e) => handleArrayChange('carreira', index, 'lugar_promocao', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="carreira" index={index} item={car} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('carreira', { posto: '', data_promocao: '', lugar_promocao: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Promoção
              </Button>
            </div>
          )}

          {/* Step 7: Experiência de Serviço */}
          {currentStep === 6 && (
            <div className="space-y-4">
              {formData.experiencia_servico?.map((exp, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Experiência {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('experiencia_servico', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Desde (Ano)</Label>
                        <Input type="number" value={exp.desde || ''} onChange={(e) => handleArrayChange('experiencia_servico', index, 'desde', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Unidade/Componente</Label>
                        <Select value={exp.unidade_componente || ''} onValueChange={(v) => handleArrayChange('experiencia_servico', index, 'unidade_componente', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {unidades.map((u) => (
                              <SelectItem key={u} value={u}>{u}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground">Função Desempenhada</Label>
                        <Input value={exp.funcao_desempenho || ''} onChange={(e) => handleArrayChange('experiencia_servico', index, 'funcao_desempenho', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="experiencia_servico" index={index} item={exp} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('experiencia_servico', { desde: '', unidade_componente: '', funcao_desempenho: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Experiência
              </Button>
            </div>
          )}

          {/* Step 8: Habilidade de Língua */}
          {currentStep === 7 && (
            <div className="space-y-4">
              {formData.habilidade_lingua?.map((ling, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Língua {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('habilidade_lingua', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Língua</Label>
                        <Input value={ling.lingua || ''} onChange={(e) => handleArrayChange('habilidade_lingua', index, 'lingua', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={ling.falar || false} onCheckedChange={(c) => handleArrayChange('habilidade_lingua', index, 'falar', c)} />
                        <Label className="text-foreground">Falar</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={ling.escrever || false} onCheckedChange={(c) => handleArrayChange('habilidade_lingua', index, 'escrever', c)} />
                        <Label className="text-foreground">Escrever</Label>
                      </div>
                      <div className="flex items-center gap-2">
                        <Checkbox checked={ling.ouvir || false} onCheckedChange={(c) => handleArrayChange('habilidade_lingua', index, 'ouvir', c)} />
                        <Label className="text-foreground">Ouvir</Label>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('habilidade_lingua', { lingua: '', falar: false, escrever: false, ouvir: false })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Língua
              </Button>
            </div>
          )}

          {/* Step 9: Conhecimento Informática */}
          {currentStep === 8 && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-foreground">Conhecimento Informática</Label>
                <Textarea value={formData.conhecimento_informatica} onChange={(e) => handleInputChange('conhecimento_informatica', e.target.value)} className="rounded-sm" rows={4} />
              </div>
              <div className="space-y-2">
                <Label className="text-foreground">Outras Informações Adicionadas</Label>
                <Textarea value={formData.outras_informacoes} onChange={(e) => handleInputChange('outras_informacoes', e.target.value)} className="rounded-sm" rows={4} />
              </div>
              <FileUploadField label="Anexo" field="informatica_anexo" value={formData.informatica_anexo} nameField="informatica_anexo_nome" fileName={formData.informatica_anexo_nome} />
            </div>
          )}

          {/* Step 10: Situação Disciplinar */}
          {currentStep === 9 && (
            <div className="space-y-4">
              {formData.situacao_disciplinar?.map((disc, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Caso Disciplinar {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('situacao_disciplinar', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo do Caso</Label>
                        <Input value={disc.tipo_caso || ''} onChange={(e) => handleArrayChange('situacao_disciplinar', index, 'tipo_caso', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Punição</Label>
                        <Select value={disc.tipo_punicao || ''} onValueChange={(v) => handleArrayChange('situacao_disciplinar', index, 'tipo_punicao', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposPunicao.map((tp) => (
                              <SelectItem key={tp} value={tp}>{tp}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Local do Processo</Label>
                        <Input value={disc.local_processo || ''} onChange={(e) => handleArrayChange('situacao_disciplinar', index, 'local_processo', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data de Cumprimento de Punição</Label>
                        <Input type="date" value={disc.data_cumprimento || ''} onChange={(e) => handleArrayChange('situacao_disciplinar', index, 'data_cumprimento', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Duração de Pena</Label>
                        <Input value={disc.duracao_pena || ''} onChange={(e) => handleArrayChange('situacao_disciplinar', index, 'duracao_pena', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data Anula do Processo</Label>
                        <Input type="date" value={disc.data_anula || ''} onChange={(e) => handleArrayChange('situacao_disciplinar', index, 'data_anula', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="situacao_disciplinar" index={index} item={disc} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('situacao_disciplinar', { tipo_caso: '', tipo_punicao: '', local_processo: '', data_cumprimento: '', duracao_pena: '', data_anula: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Caso
              </Button>
            </div>
          )}

          {/* Step 11: Louvores e Condecorações */}
          {currentStep === 10 && (
            <div className="space-y-4">
              {formData.louvores?.map((louv, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Louvor/Condecoração {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('louvores', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Louvor</Label>
                        <Input value={louv.tipo_louvor || ''} onChange={(e) => handleArrayChange('louvores', index, 'tipo_louvor', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Condecoração</Label>
                        <Input value={louv.tipo_condecoracao || ''} onChange={(e) => handleArrayChange('louvores', index, 'tipo_condecoracao', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data</Label>
                        <Input type="date" value={louv.data || ''} onChange={(e) => handleArrayChange('louvores', index, 'data', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Concebida por</Label>
                        <Input value={louv.concebida_por || ''} onChange={(e) => handleArrayChange('louvores', index, 'concebida_por', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="louvores" index={index} item={louv} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('louvores', { tipo_louvor: '', tipo_condecoracao: '', data: '', concebida_por: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Louvor
              </Button>
            </div>
          )}

          {/* Step 12: Licenças */}
          {currentStep === 11 && (
            <div className="space-y-4">
              {formData.licencas?.map((lic, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Licença {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('licencas', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Licença</Label>
                        <Select value={lic.tipo_licenca || ''} onValueChange={(v) => handleArrayChange('licencas', index, 'tipo_licenca', v)}>
                          <SelectTrigger className="rounded-sm">
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                          <SelectContent>
                            {tiposLicenca.map((tl) => (
                              <SelectItem key={tl} value={tl}>{tl}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data Início</Label>
                        <Input type="date" value={lic.data_inicio || ''} onChange={(e) => handleArrayChange('licencas', index, 'data_inicio', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Data Fim</Label>
                        <Input type="date" value={lic.data_fim || ''} onChange={(e) => handleArrayChange('licencas', index, 'data_fim', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Concebida por</Label>
                        <Input value={lic.concebida_por || ''} onChange={(e) => handleArrayChange('licencas', index, 'concebida_por', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Quantos Dias</Label>
                        <Input type="number" value={lic.quantos_dias || ''} onChange={(e) => handleArrayChange('licencas', index, 'quantos_dias', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Quantas Vezes</Label>
                        <Input type="number" value={lic.quantas_vezes || ''} onChange={(e) => handleArrayChange('licencas', index, 'quantas_vezes', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="licencas" index={index} item={lic} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('licencas', { tipo_licenca: '', data_inicio: '', data_fim: '', concebida_por: '', quantos_dias: '', quantas_vezes: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Licença
              </Button>
            </div>
          )}

          {/* Step 13: Estado Médico */}
          {currentStep === 12 && (
            <div className="space-y-4">
              {formData.estado_medico?.map((med, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Condição Médica {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('estado_medico', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Estado Físico</Label>
                        <Input value={med.estado_fisico || ''} onChange={(e) => handleArrayChange('estado_medico', index, 'estado_fisico', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Estado Mental</Label>
                        <Input value={med.estado_mental || ''} onChange={(e) => handleArrayChange('estado_medico', index, 'estado_mental', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2 md:col-span-2">
                        <Label className="text-foreground">Causas</Label>
                        <Textarea value={med.causas || ''} onChange={(e) => handleArrayChange('estado_medico', index, 'causas', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="estado_medico" index={index} item={med} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('estado_medico', { estado_fisico: '', estado_mental: '', causas: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Condição
              </Button>
            </div>
          )}

          {/* Step 14: Afiliação Familiar */}
          {currentStep === 13 && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground">Nome do Pai</Label>
                  <Input value={formData.nome_pai} onChange={(e) => handleInputChange('nome_pai', e.target.value)} className="rounded-sm" />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground">Nome da Mãe</Label>
                  <Input value={formData.nome_mae} onChange={(e) => handleInputChange('nome_mae', e.target.value)} className="rounded-sm" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label className="text-foreground">Nome do/a Cônjuge</Label>
                  <Input value={formData.nome_conjuge} onChange={(e) => handleInputChange('nome_conjuge', e.target.value)} className="rounded-sm" />
                </div>
              </div>
              
              <div className="space-y-4">
                <Label className="text-foreground">Filhos</Label>
                {formData.filhos?.map((filho, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Input
                      value={filho}
                      onChange={(e) => {
                        const newFilhos = [...formData.filhos];
                        newFilhos[index] = e.target.value;
                        handleInputChange('filhos', newFilhos);
                      }}
                      className="rounded-sm"
                      placeholder={`${index + 1}º Filho(a)`}
                    />
                    <Button variant="ghost" size="sm" onClick={() => {
                      const newFilhos = formData.filhos.filter((_, i) => i !== index);
                      handleInputChange('filhos', newFilhos);
                    }} className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                <Button variant="outline" onClick={() => handleInputChange('filhos', [...(formData.filhos || []), ''])} className="rounded-sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Filho(a)
                </Button>
              </div>
              
              <FileUploadField label="Anexo" field="familia_anexo" value={formData.familia_anexo} nameField="familia_anexo_nome" fileName={formData.familia_anexo_nome} />
            </div>
          )}

          {/* Step 15: Dados Vestuário */}
          {currentStep === 14 && (
            <div className="space-y-4">
              {formData.vestuario?.map((vest, index) => (
                <Card key={index} className="border border-border rounded-sm">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <h4 className="font-medium text-foreground">Vestuário {index + 1}</h4>
                      <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('vestuario', index)} className="text-red-600">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="text-foreground">Tipo de Vestuário</Label>
                        <Input value={vest.tipo_vestuario || ''} onChange={(e) => handleArrayChange('vestuario', index, 'tipo_vestuario', e.target.value)} className="rounded-sm" />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-foreground">Medida/Tamanho</Label>
                        <Input value={vest.medida_tamanho || ''} onChange={(e) => handleArrayChange('vestuario', index, 'medida_tamanho', e.target.value)} className="rounded-sm" />
                      </div>
                      <ArrayFileUpload arrayField="vestuario" index={index} item={vest} />
                    </div>
                  </CardContent>
                </Card>
              ))}
              <Button variant="outline" onClick={() => handleArrayAdd('vestuario', { tipo_vestuario: '', medida_tamanho: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                <Plus className="h-4 w-4 mr-2" /> Adicionar Vestuário
              </Button>
            </div>
          )}

          {/* Step 16: Equipamentos */}
          {currentStep === 15 && (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium text-foreground mb-4">Equipamentos em Posse</h4>
                {formData.equipamentos?.map((equip, index) => (
                  <Card key={index} className="border border-border rounded-sm mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-medium text-foreground">Equipamento {index + 1}</h5>
                        <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('equipamentos', index)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Equipamento ou Material</Label>
                          <Input value={equip.equipamento || ''} onChange={(e) => handleArrayChange('equipamentos', index, 'equipamento', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Tipo</Label>
                          <Input value={equip.tipo || ''} onChange={(e) => handleArrayChange('equipamentos', index, 'tipo', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Número Identificação</Label>
                          <Input value={equip.numero_identificacao || ''} onChange={(e) => handleArrayChange('equipamentos', index, 'numero_identificacao', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Quantidade</Label>
                          <Input type="number" value={equip.quantidade || ''} onChange={(e) => handleArrayChange('equipamentos', index, 'quantidade', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Data Início</Label>
                          <Input type="date" value={equip.data_inicio || ''} onChange={(e) => handleArrayChange('equipamentos', index, 'data_inicio', e.target.value)} className="rounded-sm" />
                        </div>
                        <ArrayFileUpload arrayField="equipamentos" index={index} item={equip} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" onClick={() => handleArrayAdd('equipamentos', { equipamento: '', tipo: '', numero_identificacao: '', quantidade: '', data_inicio: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Equipamento
                </Button>
              </div>

              <div>
                <h4 className="font-medium text-foreground mb-4">Entregas de Equipamentos</h4>
                {formData.entregas_equipamentos?.map((entrega, index) => (
                  <Card key={index} className="border border-border rounded-sm mb-4">
                    <CardContent className="p-4">
                      <div className="flex justify-between items-start mb-4">
                        <h5 className="font-medium text-foreground">Entrega {index + 1}</h5>
                        <Button variant="ghost" size="sm" onClick={() => handleArrayRemove('entregas_equipamentos', index)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-foreground">Equipamento/Material</Label>
                          <Input value={entrega.equipamento || ''} onChange={(e) => handleArrayChange('entregas_equipamentos', index, 'equipamento', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Data de Entrega</Label>
                          <Input type="date" value={entrega.data_entrega || ''} onChange={(e) => handleArrayChange('entregas_equipamentos', index, 'data_entrega', e.target.value)} className="rounded-sm" />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-foreground">Recebido por</Label>
                          <Input value={entrega.recebido_por || ''} onChange={(e) => handleArrayChange('entregas_equipamentos', index, 'recebido_por', e.target.value)} className="rounded-sm" />
                        </div>
                        <ArrayFileUpload arrayField="entregas_equipamentos" index={index} item={entrega} />
                      </div>
                    </CardContent>
                  </Card>
                ))}
                <Button variant="outline" onClick={() => handleArrayAdd('entregas_equipamentos', { equipamento: '', data_entrega: '', recebido_por: '', anexo: '', anexo_nome: '' })} className="rounded-sm">
                  <Plus className="h-4 w-4 mr-2" /> Adicionar Entrega
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation Buttons */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
          disabled={currentStep === 0}
          className="rounded-sm"
        >
          <ArrowLeft className="h-4 w-4 mr-2" /> Anterior
        </Button>
        
        <div className="flex gap-2">
          {currentStep < STEPS.length - 1 ? (
            <Button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="bg-emerald-700 hover:bg-emerald-600 rounded-sm"
            >
              Próximo <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={saving}
              className="bg-emerald-700 hover:bg-emerald-600 rounded-sm"
              data-testid="submit-member-button"
            >
              <Save className="h-4 w-4 mr-2" /> {saving ? 'Salvando...' : 'Salvar'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
