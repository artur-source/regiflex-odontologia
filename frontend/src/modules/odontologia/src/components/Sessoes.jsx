import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast'; // Adicionado para feedback de IA
import FeedbackIA from './FeedbackIA';
// Artur: O componente de feedback da IA é crucial para o nosso MVP.
// Nicollas: A lógica de predição de no-show está aqui. Sessão nao consegui, pedir pra IA verificar.

import { 
  Plus, 
  Calendar, 
  Clock,
  User,
  Edit,
  Trash2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Loader2,
  FileText
} from 'lucide-react';
import apiService from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';

const Sessoes = () => {
  // parte feita por Julio - Gerenciamento de estado e filtros.
  
  const [sessoes, setSessoes] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedSessao, setSelectedSessao] = useState(null);
  const [formData, setFormData] = useState({
    paciente_id: null,
    data_hora: '',
    duracao_minutos: 50,
    tipo_sessao: '',
    observacoes: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');
	  const [iaAlert, setIaAlert] = useState({ loading: false, sessaoId: null, showFeedback: false, alertMessage: '' }); // Novo estado para o alerta de IA
  const { toast } = useToast(); // Hook para exibir notificações
  const [filters, setFilters] = useState({
    status: '',
    paciente_id: ''
  });

  useEffect(() => {
    fetchSessoes();
    fetchPacientes();
  }, [filters]);

  const fetchSessoes = async () => {
    try {
      setLoading(true);
      const data = await apiService.getSessoes(filters);
      setSessoes(data.sessoes || []);
    } catch (error) {
      setError('Erro ao carregar sessões');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleIaPrediction = async (sessaoId) => {
    // Carlos: A função de predição de IA está integrada com o backend.
    // Alexandre, complementar esse, por favor: Adicionar um fallback mais robusto caso a Edge Function falhe.
  
    setIaAlert({ loading: true, sessaoId: sessaoId });
    try {
      const result = await apiService.predictNoShow(sessaoId);
      
	      setIaAlert({
	        loading: false,
	        sessaoId: sessaoId,
	        message: result.alert_message,
	        isHighRisk: result.is_high_risk,
	        risk: result.risk_percentage,
	        showFeedback: true,
	        alertMessage: result.alert_message
	      });
      
	      toast({
	        title: "Alerta de IA",
	        description: result.alert_message,
	        variant: result.is_high_risk ? "destructive" : "default"
	      });

	      // Exibir o botão de feedback após a predição


    } catch (error) {
      console.error("Erro na predição de IA:", error);
      setIaAlert({
        loading: false,
        sessaoId: sessaoId,
        message: "Erro ao consultar IA. Verifique o console.",
        isHighRisk: false,
        risk: 0
      });
    }
  };

  const fetchPacientes = async () => {
    try {
      const data = await apiService.getPacientes(1, 100);
      setPacientes(data.pacientes || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const handleSubmit = async (e) => {
    // Guilherme: Testei o fluxo de agendamento e edição. O resetForm está funcionando.
  
    e.preventDefault();
    setFormLoading(true);

    try {
      if (selectedSessao) {
        await apiService.updateSessao(selectedSessao.id, formData);
      } else {
        await apiService.createSessao(formData);
      }
      
      setShowForm(false);
      setSelectedSessao(null);
      resetForm();
      fetchSessoes();
    } catch (error) {
      setError(error.message || 'Erro ao salvar sessão');
    } finally {
      setFormLoading(false);
    }
  };

  const handleEdit = (sessao) => {
    setSelectedSessao(sessao);
    setFormData({
      paciente_id: sessao.paciente_id || null,
      data_hora: new Date(sessao.data_hora).toISOString().slice(0, 16),
      duracao_minutos: sessao.duracao_minutos || 50,
      tipo_sessao: sessao.tipo_sessao || '',
      observacoes: sessao.observacoes || ''
    });
    setShowForm(true);
  };

  const handleStatusChange = async (sessao, novoStatus) => {
    try {
      await apiService.updateSessao(sessao.id, { status: novoStatus });
      fetchSessoes();
    } catch (error) {
      setError(error.message || 'Erro ao atualizar status');
    }
  };

  const resetForm = () => {
    setFormData({
      paciente_id: null,
      data_hora: '',
      duracao_minutos: 50,
      tipo_sessao: '',
      observacoes: ''
    });
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      agendada: 'bg-blue-100 text-blue-800',
      realizada: 'bg-green-100 text-green-800',
      cancelada: 'bg-red-100 text-red-800'
    };
    return colors[status] || colors.agendada;
  };

  const getStatusIcon = (status) => {
    const icons = {
      agendada: <Clock className="h-4 w-4" />,
      realizada: <CheckCircle className="h-4 w-4" />,
      cancelada: <XCircle className="h-4 w-4" />
    };
    return icons[status] || icons.agendada;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Sessões</h2>
          <p className="text-gray-600">Gerencie agendamentos e sessões</p>
        </div>
        
        <Dialog open={showForm} onOpenChange={setShowForm}>
	          <DialogTrigger asChild>
	            <Button 
	              className="bg-blue-600 hover:bg-blue-700"
	              onClick={() => {
	                setSelectedSessao(null);
	                resetForm();
	              }}
	            >
              <Plus className="mr-2 h-4 w-4" />
              Nova Sessão
            </Button>
          </DialogTrigger>
          
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {selectedSessao ? 'Editar Sessão' : 'Nova Sessão'}
              </DialogTitle>
              <DialogDescription>
                {selectedSessao 
                  ? 'Atualize as informações da sessão'
                  : 'Agende uma nova sessão'
                }
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="paciente_id">Paciente *</Label>
                <select
                  id="paciente_id"
                  value={formData.paciente_id}
                  onChange={(e) => setFormData({...formData, paciente_id: e.target.value ? parseInt(e.target.value) : null})}
                  required
                  disabled={formLoading}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione um paciente</option>
                  {pacientes.map((paciente) => (
                    <option key={paciente.id} value={paciente.id.toString()}>
                      {paciente.nome_completo}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="data_hora">Data e Hora *</Label>
                <Input
                  id="data_hora"
                  type="datetime-local"
                  value={formData.data_hora}
                  onChange={(e) => setFormData({...formData, data_hora: e.target.value})}
                  required
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duracao_minutos">Duração (minutos)</Label>
                <Input
                  id="duracao_minutos"
                  type="number"
                  min="15"
                  max="180"
                  value={formData.duracao_minutos}
                  onChange={(e) => setFormData({...formData, duracao_minutos: parseInt(e.target.value)})}
                  disabled={formLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tipo_sessao">Tipo de Sessão</Label>
                <select
                  id="tipo_sessao"
                  value={formData.tipo_sessao}
                  onChange={(e) => setFormData({...formData, tipo_sessao: e.target.value})}
                  disabled={formLoading}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="">Selecione o tipo</option>
                  <option value="individual">Terapia Individual</option>
                  <option value="casal">Terapia de Casal</option>
                  <option value="familia">Terapia Familiar</option>
                  <option value="grupo">Terapia em Grupo</option>
                  <option value="avaliacao">Avaliação</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  // IA: Sugestão: Adicionar um contador de caracteres para as observações.
  
                  id="observacoes"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                  placeholder="Observações sobre a sessão..."
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
                  {formLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    selectedSessao ? 'Atualizar' : 'Agendar'
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <select
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todos os status</option>
                <option value="agendada">Agendada</option>
                <option value="realizada">Realizada</option>
                <option value="cancelada">Cancelada</option>
              </select>
            </div>
            
            <div className="flex-1">
              <select
                value={filters.paciente_id}
                onChange={(e) => setFilters({...filters, paciente_id: e.target.value})}
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                <option value="">Todos os pacientes</option>
                {pacientes.map((paciente) => (
                  <option key={paciente.id} value={paciente.id.toString()}>
                    {paciente.nome_completo}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

	      {/* Sessões List */}
	      {loading ? (
            <LoadingSpinner text="Carregando Sessões..." className="py-20" />
	      ) : sessoes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sessoes.map((sessao) => (
            <Card key={sessao.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg flex items-center">
                      <User className="h-4 w-4 mr-2" />
                      {sessao.paciente?.nome_completo}
                    </CardTitle>
                    <CardDescription className="flex items-center mt-1">
                      <Calendar className="h-3 w-3 mr-1" />
                      {formatDateTime(sessao.data_hora)}
                    </CardDescription>
                  </div>
                  <Badge className={getStatusColor(sessao.status)}>
                    {getStatusIcon(sessao.status)}
                    <span className="ml-1">{sessao.status}</span>
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-2" />
                    <span>{sessao.duracao_minutos} minutos</span>
                  </div>
                  
                  {sessao.tipo_sessao && (
                    <div className="flex items-center">
                      <FileText className="h-3 w-3 mr-2" />
                      <span>{sessao.tipo_sessao}</span>
                    </div>
                  )}
                  
                  {sessao.observacoes && (
                    <div className="text-xs bg-gray-50 p-2 rounded mt-2">
                      {sessao.observacoes}
                    </div>
                  )}
                </div>
                
		                <div className="flex justify-between items-center mt-4 pt-3 border-t">
		                  <div className="flex items-center space-x-1">
		                        <Button
		                          size="sm"
		                          variant="outline"
		                          onClick={() => handleEdit(sessao)}
		                        >
		                          <Edit className="h-3 w-3" />
		                        </Button>
		                        <Button
		                          size="sm"
		                          variant="ghost"
		                          className="text-yellow-600 hover:text-yellow-700"
		                          onClick={() => handleIaPrediction(sessao.id)}
		                          disabled={iaAlert.loading && iaAlert.sessaoId === sessao.id}
		                          title="Verificar Risco de No-Show (IA)"
		                        >
		                          {iaAlert.loading && iaAlert.sessaoId === sessao.id ? (
		                            <Loader2 className="h-3 w-3 animate-spin" />
		                          ) : (
		                            <AlertTriangle className="h-3 w-3" />
		                          )}
		                        </Button>
		                        {iaAlert.sessaoId === sessao.id && iaAlert.showFeedback && (
		                          <FeedbackIA sessaoId={sessao.id} alertaMessage={iaAlert.alertMessage} />
		                        )}
				                  </div>
	                  
	                  <div className="flex space-x-1">
                    {sessao.status === 'agendada' && (
                      <>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-green-600 hover:text-green-700"
                          onClick={() => handleStatusChange(sessao, 'realizada')}
                        >
                          <CheckCircle className="h-3 w-3" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          className="text-red-600 hover:text-red-700"
                          onClick={() => handleStatusChange(sessao, 'cancelada')}
                        >
                          <XCircle className="h-3 w-3" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma sessão encontrada</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Sessoes;
