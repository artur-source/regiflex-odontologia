import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Brain, 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown,
  Activity,
  Users,
  Calendar,
  BarChart3,
  RefreshCw,
  Lightbulb,
  Target,
  Clock,
  Percent,
  Image
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import apiService from '../services/api';

// Novo componente genérico para exibir o resultado da IA
const AIResultDisplay = ({ result }) => {
  if (!result) return null;

  // Exemplo de abstração:
  // Se o resultado for de risco (Psicologia)
  if (result.type === 'risk_prediction') {
    const isHighRisk = result.value > 50;
    const color = isHighRisk ? 'bg-red-100 text-red-800 border-red-200' : 'bg-green-100 text-green-800 border-green-200';
    const icon = isHighRisk ? <AlertTriangle className="h-5 w-5 text-red-600" /> : <Percent className="h-5 w-5 text-green-600" />;

    return (
      <div className={`p-4 border rounded-lg ${color}`}>
        <div className="flex items-center space-x-3">
          {icon}
          <div>
            <h4 className="font-medium">Risco de No-Show: {result.value}%</h4>
            <p className="text-sm">
              {isHighRisk 
                ? 'Alto risco detectado. Acompanhamento proativo recomendado.' 
                : 'Risco baixo. Acompanhamento padrão.'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Se o resultado for de análise de imagem (Odontologia/Futuro)
  if (result.type === 'image_analysis') {
    return (
      <div className="p-4 border rounded-lg bg-blue-50">
        <div className="flex items-center space-x-3">
          <Image className="h-5 w-5 text-blue-600" />
          <div>
            <h4 className="font-medium">Análise de Imagem Concluída</h4>
            <p className="text-sm">
              {result.value}
            </p>
            {result.image_url && (
              <a href={result.image_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 text-xs mt-1 block">
                Ver Imagem Analisada
              </a>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
};


const IA = () => {
  const [alertas, setAlertas] = useState([]);
  const [padroesCancelamento, setPadroesCancelamento] = useState(null);
  const [analisePaciente, setAnalisePaciente] = useState(null);
  const [pacientes, setPacientes] = useState([]);
  const [selectedPaciente, setSelectedPaciente] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
    fetchPacientes();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [alertasData, padroesData] = await Promise.all([
        apiService.getAlertasIA(),
        apiService.getPadroesCancelamento()
      ]);
      
      setAlertas(alertasData.alertas || []);
      setPadroesCancelamento(padroesData);
    } catch (error) {
      setError('Erro ao carregar dados de IA');
      console.error('Erro:', error);
    } finally {
      setLoading(false);
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

  const fetchAnalisePaciente = async (pacienteId) => {
    if (!pacienteId) return;
    
    try {
      const data = await apiService.getAnalisePaciente(pacienteId);
      setAnalisePaciente(data);
    } catch (error) {
      console.error('Erro ao analisar paciente:', error);
    }
  };

  const getSeverityColor = (severidade) => {
    const colors = {
      baixa: 'bg-blue-100 text-blue-800 border-blue-200',
      media: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      alta: 'bg-red-100 text-red-800 border-red-200'
    };
    return colors[severidade] || colors.baixa;
  };

  const getSeverityIcon = (severidade) => {
    const icons = {
      baixa: <Activity className="h-4 w-4" />,
      media: <AlertTriangle className="h-4 w-4" />,
      alta: <AlertTriangle className="h-4 w-4" />
    };
    return icons[severidade] || icons.baixa;
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <Brain className="mr-3 h-8 w-8 text-purple-600" />
            IA & Alertas Inteligentes
          </h2>
          <p className="text-gray-600">Insights automáticos baseados em análise de dados</p>
        </div>
        
        <Button onClick={fetchData} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Atualizar
        </Button>
      </div>

      {/* Error Alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="alertas" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="alertas">Alertas Ativos</TabsTrigger>
          <TabsTrigger value="padroes">Padrões de Cancelamento</TabsTrigger>
          <TabsTrigger value="analise">Análise de Paciente</TabsTrigger>
        </TabsList>

        {/* Alertas Ativos */}
        <TabsContent value="alertas" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                Alertas Inteligentes
              </CardTitle>
              <CardDescription>
                Alertas gerados automaticamente pela análise de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
              {alertas.length > 0 ? (
                <div className="space-y-4">
                  {alertas.map((alerta, index) => (
                    <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(alerta.severidade)}`}>
                      <div className="flex items-start space-x-3">
                        {getSeverityIcon(alerta.severidade)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <h4 className="font-medium">{alerta.titulo}</h4>
                            <Badge variant="outline" className="text-xs">
                              {alerta.severidade}
                            </Badge>
                          </div>
                          <p className="text-sm mb-2">{alerta.mensagem}</p>
                          {alerta.acao && (
                            <div className="flex items-center text-sm font-medium">
                              <Lightbulb className="h-3 w-3 mr-1" />
                              <span>{alerta.acao}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Brain className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Nenhum alerta no momento</p>
                  <p className="text-sm text-gray-400 mt-1">
                    A IA está monitorando seus dados continuamente
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Padrões de Cancelamento */}
        <TabsContent value="padroes" className="space-y-6">
          {padroesCancelamento && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Cancelamentos</p>
                        <p className="text-2xl font-bold text-red-600">
                          {padroesCancelamento.total_cancelamentos}
                        </p>
                      </div>
                      <TrendingDown className="h-8 w-8 text-red-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Período Analisado</p>
                        <p className="text-2xl font-bold text-gray-900">
                          {padroesCancelamento.periodo_dias} dias
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Padrões Detectados</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {padroesCancelamento.padroes?.length || 0}
                        </p>
                      </div>
                      <BarChart3 className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Padrões Identificados */}
              {padroesCancelamento.padroes?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Padrões Identificados</CardTitle>
                    <CardDescription>
                      Análise automática dos cancelamentos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {padroesCancelamento.padroes.map((padrao, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-blue-900">{padrao.descricao}</h4>
                              <p className="text-sm text-blue-700 capitalize">
                                Tipo: {padrao.tipo.replace('_', ' ')}
                              </p>
                            </div>
                            <Badge variant="outline" className="bg-white">
                              {padrao.valor} ocorrências
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Recomendações */}
              {padroesCancelamento.recomendacoes?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Lightbulb className="mr-2 h-5 w-5 text-green-600" />
                      Recomendações
                    </CardTitle>
                    <CardDescription>
                      Sugestões baseadas na análise dos dados
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {padroesCancelamento.recomendacoes.map((rec, index) => (
                        <div key={index} className="p-4 border rounded-lg bg-green-50">
                          <div className="flex items-start space-x-3">
                            <Lightbulb className="h-5 w-5 text-green-600 mt-0.5" />
                            <div>
                              <h4 className="font-medium text-green-900">{rec.descricao}</h4>
                              <p className="text-sm text-green-700 mt-1">{rec.acao}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>

        {/* Análise de Paciente */}
        <TabsContent value="analise" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Análise Individual de Paciente</CardTitle>
              <CardDescription>
                Selecione um paciente para análise detalhada
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Select 
                  value={selectedPaciente} 
                  onValueChange={(value) => {
                    setSelectedPaciente(value);
                    fetchAnalisePaciente(value);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    {pacientes.map((paciente) => (
                      <SelectItem key={paciente.id} value={paciente.id.toString()}>
                        {paciente.nome_completo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {analisePaciente && (
            <>
              {/* Exibição Abstrata do Resultado da IA */}
              <AIResultDisplay 
                result={
                  analisePaciente.risk_prediction 
                    ? { type: 'risk_prediction', value: analisePaciente.risk_prediction }
                    : { type: 'image_analysis', value: 'Análise de cárie de nível 3 detectada.', image_url: 'https://exemplo.com/imagem_analisada.jpg' }
                }
              />

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Total de Sessões</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {analisePaciente.total_sessoes}
                        </p>
                      </div>
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Sessões Realizadas</p>
                        <p className="text-2xl font-bold text-green-600">
                          {analisePaciente.sessoes_realizadas}
                        </p>
                      </div>
                      <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Frequência Semanal</p>
                        <p className="text-2xl font-bold text-purple-600">
                          {analisePaciente.frequencia_semanal}
                        </p>
                      </div>
                      <Clock className="h-8 w-8 text-purple-600" />
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-gray-600">Taxa de Comparecimento</p>
                        <p className="text-2xl font-bold text-orange-600">
                          {analisePaciente.taxa_comparecimento}%
                        </p>
                      </div>
                      <Activity className="h-8 w-8 text-orange-600" />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Alertas do Paciente */}
              {analisePaciente.alertas?.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="mr-2 h-5 w-5 text-orange-600" />
                      Alertas para este Paciente
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {analisePaciente.alertas.map((alerta, index) => (
                        <div key={index} className={`p-4 border rounded-lg ${getSeverityColor(alerta.severidade)}`}>
                          <div className="flex items-start space-x-3">
                            {getSeverityIcon(alerta.severidade)}
                            <div>
                              <h4 className="font-medium">{alerta.mensagem}</h4>
                              <p className="text-sm opacity-75 capitalize">
                                Tipo: {alerta.tipo.replace('_', ' ')}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default IA;
