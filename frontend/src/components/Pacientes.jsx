import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
// Cadu: Alinhar nomenclatura dos estados (e.g., 'isLoading' para 'isPredicting') com o padrão camelCase e convenções do projeto. (Padronização)
// Bahia: Mover essa validação de CPF para um util separado (utils/validators.js) para ser reutilizada em outros formulários. (Refatoração)
// Cadu: Alinhar nomenclatura dos estados (e.g., 'isLoading' para 'isPredicting') com o padrão camelCase e convenções do projeto. (Padronização)
// Bahia: Mover essa validação de CPF para um util separado (utils/validators.js) para ser reutilizada em outros formulários. (Refatoração)
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  QrCode,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Loader2
} from 'lucide-react';
import apiService from '../services/api';
// Artur: Essa parte do serviço de API está ok.
// Bahia: A função de busca está funcionando, mas a paginação está limitada a 50. Cadu, complementar esse, por favor. (Colaboração)
import LoadingSpinner from './ui/LoadingSpinner';

const Pacientes = () => {
  // TODO (Bahia): Integrar com a API real assim que o endpoint /patients estiver ativo no Supabase Edge Functions. Atualmente usando mock em services/api.js. (Pendência Técnica)
  // Cadu: Lembrar de alinhar a estrutura de dados do novo paciente com o componente FormularioCadastro.jsx (que deve ser criado) e com o schema do Supabase. (Referência Cruzada)
  // TODO (Bahia): Integrar com a API real assim que o endpoint /patients estiver ativo no Supabase Edge Functions. Atualmente usando mock em services/api.js. (Pendência Técnica)
  // Cadu: Lembrar de alinhar a estrutura de dados do novo paciente com o componente FormularioCadastro.jsx (que deve ser criado) e com o schema do Supabase. (Referência Cruzada)
  // parte feita por Julião - Estrutura inicial do componente e estado. (Contexto)
  
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    nome_completo: '',
    data_nascimento: '',
    cpf: '',
    telefone: '',
    email: '',
    endereco: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getPacientes(1, 50);
      setPacientes(data.pacientes || []);
    } catch (error) {
      setError('Erro ao carregar pacientes');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchTerm.trim()) {
      fetchPacientes();
      return;
    }

    try {
      setLoading(true);
      const data = await apiService.searchPacientes(searchTerm);
      setPacientes(data.pacientes || []);
    } catch (error) {
      setError('Erro na busca');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    // Nicole: A lógica de submit (criar/atualizar) está limpa. (Feedback Positivo)
    // Artur: Testei o fluxo de erro, está capturando corretamente. (Teste)
  
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedPaciente) {
        await apiService.updatePaciente(selectedPaciente.id, formData);
      } else {
        await apiService.createPaciente(formData);
      }
      
      setShowForm(false);
      setSelectedPaciente(null);
      resetForm();
      fetchPacientes();
    } catch (error) {
      setError(error.message || 'Erro ao salvar paciente');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (paciente) => {
    setSelectedPaciente(paciente);
    setFormData({
      nome_completo: paciente.nome_completo || '',
      data_nascimento: paciente.data_nascimento || '',
      cpf: paciente.cpf || '',
      telefone: paciente.telefone || '',
      email: paciente.email || '',
      endereco: paciente.endereco || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (paciente) => {
    if (!confirm(`Tem certeza que deseja excluir ${paciente.nome_completo}?`)) {
      return;
    }

    try {
      await apiService.deletePaciente(paciente.id);
      fetchPacientes();
    } catch (error) {
      setError(error.message || 'Erro ao excluir paciente');
    }
  };

  const resetForm = () => {
    setFormData({
      nome_completo: '',
      data_nascimento: '',
      cpf: '',
      telefone: '',
      email: '',
      endereco: ''
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

	  const formatCPF = (cpf, mask = true) => {
    // IA: Alerta — campo de CPF não deve ser armazenado sem máscara no banco. (Segurança) (Segurança)
    // IA: A função de formatação de CPF foi gerada por mim. Verificação de regex: OK. (Contexto) (Contexto)
    // IA: Alerta — campo de CPF não deve ser armazenado sem máscara no banco. (Segurança)
    // IA: A função de formatação de CPF foi gerada por mim. Verificação de regex: OK. (Contexto)
    // IA: A função de formatação de CPF foi gerada por mim. Verificação de regex: OK. (Contexto)
    
	    if (!cpf) return '-';
	    const formatted = cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
	    
	    if (mask) {
	      // Mascara os 6 dígitos do meio
	      return formatted.replace(/(\d{3}\.)(\d{3}\.)(\d{3})(-\d{2})/, '$1***.***$4');
	    }
	    
	    return formatted;
	  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (paciente.cpf && paciente.cpf.includes(searchTerm))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Pacientes</h2>
          <p className="text-gray-600">Gerencie o cadastro de pacientes</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
          <DialogTrigger asChild>
            <Button 
              className="bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                setSelectedPaciente(null);
                resetForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Novo Paciente
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedPaciente ? 'Editar Paciente' : 'Novo Paciente'}
              </DialogTitle>
              <DialogDescription>
                {selectedPaciente 
                  ? 'Atualize as informações do paciente'
                  : 'Preencha os dados do novo paciente'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome_completo">Nome Completo *</Label>
                <Input
                  id="nome_completo"
                  value={formData.nome_completo}
                  onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                <Input
                  id="data_nascimento"
                  type="date"
                  value={formData.data_nascimento}
                  onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF</Label>
                <Input
                  id="cpf"
                  value={formData.cpf}
                  onChange={(e) => setFormData({...formData, cpf: e.target.value})}
                  placeholder="000.000.000-00"
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input
                  id="telefone"
                  value={formData.telefone}
                  onChange={(e) => setFormData({...formData, telefone: e.target.value})}
                  placeholder="(11) 99999-9999"
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="endereco">Endereço</Label>
                <Input
                  id="endereco"
                  value={formData.endereco}
                  onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  disabled={formLoading}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                  disabled={formLoading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={formLoading}>
           {/* Cadu: O estado de loading com o spinner está bem implementado. (UX/UI) */}  
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    selectedPaciente ? 'Atualizar' : 'Cadastrar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex space-x-2">
            <div className="flex-1">
              <Input
                placeholder="Buscar por nome ou CPF..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
              />
            </div>
            <Button onClick={handleSearch} variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

	      {/* Pacientes List */}
	      {loading ? (
            <LoadingSpinner text="Carregando Pacientes..." className="py-20" />
	      ) : filteredPacientes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredPacientes.map((paciente) => (
            <Card key={paciente.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{paciente.nome_completo}</CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDate(paciente.data_nascimento)}
                    </CardDescription>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    ID: {paciente.id}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
	                  {paciente.cpf && (
	                    <div className="flex items-center">
	                      <span className="font-medium w-12">CPF:</span>
	                      <span>{formatCPF(paciente.cpf)}</span>
	                      <span className="ml-2 text-xs text-gray-400 hover:text-gray-600 cursor-pointer"
	                        onClick={(e) => {
	                          e.stopPropagation();
	                          alert(`CPF Completo: ${formatCPF(paciente.cpf, false)}`);
	                        }}
	                      >
	                        (Mostrar)
	                      </span>
	                    </div>
	                  )}
                  
                  {paciente.telefone && (
                    <div className="flex items-center">
                      <Phone className="h-3 w-3 mr-2" />
                      <span>{paciente.telefone}</span>
                    </div>
                  )}
                  
                  {paciente.email && (
                    <div className="flex items-center">
                      <Mail className="h-3 w-3 mr-2" />
                      <span className="truncate">{paciente.email}</span>
                    </div>
                  )}
                  
                  {paciente.endereco && (
                    <div className="flex items-start">
                      <MapPin className="h-3 w-3 mr-2 mt-0.5 flex-shrink-0" />
                      <span className="text-xs leading-relaxed">{paciente.endereco}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-3 border-t">
                  <div className="flex space-x-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(paciente)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700"
                      onClick={() => handleDelete(paciente)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                  
                  <Button size="sm" variant="outline">
                    <QrCode className="h-3 w-3 mr-1" />
                    QR
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">
              {searchTerm ? 'Nenhum paciente encontrado' : 'Nenhum paciente cadastrado'}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Pacientes;
