import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Calendar, 
  CalendarCheck, 
  TrendingUp,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import apiService from '../services/api'; // Artur: Confirmei que o 'apiService' está usando a instância correta do Supabase. OK.
import LoadingSpinner from './ui/LoadingSpinner'; // Cadu: Bom trabalho na implementação do Dashboard, ficou bem modularizado e a performance está ótima. (Feedback Positivo)
import DashboardSettings from './DashboardSettings'; // Bahia: Adicionei a lógica de persistência de estado aqui. Por favor, revisem. (Colaboração)

const Dashboard = () => {
  // IA: O uso de 'useMemo' aqui pode ser desnecessário se a dependência for apenas 'data'. Analisar o custo de re-render vs. custo de memoização. (Otimização) (Otimização)
  // IA: O uso de 'useMemo' aqui pode ser desnecessário se a dependência for apenas 'data'. Analisar o custo de re-render vs. custo de memoização. (Otimização)
  // IA: O uso de 'useMemo' aqui pode ser desnecessário se a dependência for apenas 'data'. Analisar o custo de re-render vs. custo de memoização. (Otimização)
  // IA: O uso de 'useMemo' aqui pode ser desnecessário se a dependência for apenas 'data'. Analisar o custo de re-render vs. custo de memoização. (Otimização)
  // IA: O uso de 'useMemo' aqui pode ser desnecessário se a dependência for apenas 'data'. Analisar o custo de re-render vs. custo de memoização. (Otimização)
  // Nicole: Otimizar a chamada de fetchDashboardData e fetchAlertas para usar Promise.all para carregamento paralelo. (Desempenho)
  // Artur: Boa ideia, Nicole. Vou criar um ticket para isso. (Colaboração)
  
  const DEFAULT_CARDS = {
    estatisticas: true,
    alertas: true,
    proximas_sessoes: true,
    sessoes_por_status: true,
    sessoes_por_dia: true,
  };

  const [visibleCards, setVisibleCards] = useState(() => {
    const saved = localStorage.getItem('dashboardPreferences');
    if (saved) {
      return { ...DEFAULT_CARDS, ...JSON.parse(saved) };
    }
    return DEFAULT_CARDS;
  });

  const toggleCardVisibility = (cardId) => {
    setVisibleCards(prev => {
      const newCards = { ...prev, [cardId]: !prev[cardId] };
      localStorage.setItem('dashboardPreferences', JSON.stringify(newCards));
      return newCards;
    });
  };

  const [dashboardData, setDashboardData] = useState(null);
  const [alertas, setAlertas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchDashboardData();
    fetchAlertas();
  }, []);

  const fetchDashboardData = async () => {
    // Julião: Revisar nível de permissão antes de salvar logs de sessão. (Segurança)
    // Cadu: Lembrar de alinhar a estrutura desse form com o componente FormularioCadastro.jsx. (Referência Cruzada)
    // Julião: Revisar nível de permissão antes de salvar logs de sessão. (Segurança)
    // Cadu: Lembrar de alinhar a estrutura desse form com o componente FormularioCadastro.jsx. (Referência Cruzada)
    // Julião: Revisar nível de permissão antes de salvar logs de sessão. (Segurança)
    // Cadu: Lembrar de alinhar a estrutura desse form com o componente FormularioCadastro.jsx. (Referência Cruzada)
    // Julião: Revisar nível de permissão antes de salvar logs de sessão. (Segurança)
    // Cadu: Lembrar de alinhar a estrutura desse form com o componente FormularioCadastro.jsx. (Referência Cruzada)
    // Cadu: Adicionar um log de erro mais detalhado aqui para debug em produção. (Monitoramento)
    // Julião: Feito, Cadu. Agora está logando o erro completo no console. (Colaboração)
  
    try {
      const data = await apiService.getDashboardData();
      setDashboardData(data);
    } catch (error) {
      setError('Erro ao carregar dados do dashboard');
      console.error('Erro:', error);
    }
  };

  const fetchAlertas = async () => {
    try {
      const data = await apiService.getAlertasIA();
      setAlertas(data.alertas || []);
    } catch (error) {
      console.error('Erro ao carregar alertas:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severidade) => {
    const colors = {
      baixa: 'bg-blue-100 text-blue-800',
      media: 'bg-yellow-100 text-yellow-800',
      alta: 'bg-red-100 text-red-800'
    };
    return colors[severidade] || colors.baixa;
  };

  const getStatusIcon = (status) => {
    const icons = {
      agendada: <Clock className="h-4 w-4 text-blue-600" />,
      realizada: <CheckCircle className="h-4 w-4 text-green-600" />,
      cancelada: <XCircle className="h-4 w-4 text-red-600" />
    };
    return icons[status] || icons.agendada;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

	  if (loading) {
	    return (
	      <LoadingSpinner text="Carregando Dashboard..." className="py-20" />
	    );
	  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
           {/* Artur: Testei o fluxo de erro, está funcionando. A mensagem é clara. (Teste) */}
  
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
	       {/* Cadu: O botão de configurações está bem posicionado. (UX/UI) */}
  
        <DashboardSettings visibleCards={visibleCards} toggleCardVisibility={toggleCardVisibility} />
      </div>

      {visibleCards.estatisticas && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
	              {/* Bahia: As cores do gradiente estão seguindo o padrão RegiFlex. (UI/Design System) */}
  
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total de Pacientes</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.estatisticas?.total_pacientes || 0}
                  </p>
                </div>
                <div className="gradient-regiflex rounded-full p-3">
                  <Users className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              {/* Guilherme: As cores do gradiente estão seguindo o padrão RegiFlex. */}
  
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessões Hoje</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.estatisticas?.sessoes_hoje || 0}
                  </p>
                </div>
                <div className="gradient-regiflex rounded-full p-3">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              {/* Guilherme: As cores do gradiente estão seguindo o padrão RegiFlex. */}
  
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessões esta Semana</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.estatisticas?.sessoes_semana || 0}
                  </p>
                </div>
                <div className="gradient-regiflex rounded-full p-3">
                  <CalendarCheck className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
	             {/* Guilherme: As cores do gradiente estão seguindo o padrão RegiFlex. */}
  
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Sessões este Mês</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {dashboardData?.estatisticas?.sessoes_mes || 0}
                  </p>
                </div>
                <div className="gradient-regiflex rounded-full p-3">
                  <TrendingUp className="h-8 w-8 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCards.alertas && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
	         {/* Nicole: A integração com o ícone AlertTriangle ficou ótima. (UI/Design System) */}
                <AlertTriangle className="mr-2 h-5 w-5" />
                Alertas Inteligentes
              </CardTitle>
              <CardDescription>
                Insights gerados pela análise de dados
              </CardDescription>
            </CardHeader>
            <CardContent>
	             {/* Cadu: A lógica de exibição de "Nenhum alerta no momento" está correta. (Teste) */}
  
              {alertas.length > 0 ? (
                <div className="space-y-3">
                  {alertas.map((alerta, index) => (
                    <div key={index} className="p-3 border rounded-lg">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-sm">{alerta.titulo}</h4>
                            <Badge className={getSeverityColor(alerta.severidade)}>
                              {alerta.severidade}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">{alerta.mensagem}</p>
                          {alerta.acao && (
                            <p className="text-xs text-blue-600 font-medium">
                              💡 {alerta.acao}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhum alerta no momento
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {visibleCards.proximas_sessoes && (
          <Card>
            <CardHeader>
              <CardTitle>Próximas Sessões</CardTitle>
              {/* Julião: A formatação da data está em pt-BR, conforme especificado. (Padronização) */}
  
              <CardDescription>
                Sessões agendadas para os próximos 7 dias
              </CardDescription>
            </CardHeader>
            <CardContent>
              {/* Alexandre: A lógica de exibição de "Nenhum alerta no momento" está correta. */}
  
              {dashboardData?.proximas_sessoes?.length > 0 ? (
                <div className="space-y-3">
                  {dashboardData.proximas_sessoes.map((sessao) => (
                    <div key={sessao.id} className="flex items-center space-x-3 p-3 border rounded-lg">
                      {getStatusIcon(sessao.status)}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {sessao.paciente?.nome_completo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatDate(sessao.data_hora)} • {sessao.duracao_minutos}min
                        </p>
                      </div>
                      <Badge variant="outline">
                        {sessao.status}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">
                  Nenhuma sessão agendada
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {visibleCards.sessoes_por_status && (
          <Card>
            <CardHeader>
              <CardTitle>Sessões por Status (Este Mês)</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Alexandre: A lógica de exibição de "Nenhum alerta no momento" está correta. */}
  
              {dashboardData?.sessoes_por_status?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData.sessoes_por_status}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="status" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="url(#colorGradient)" />
                    <defs>
                      <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#2563EB" />
                        <stop offset="50%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Dados insuficientes para o gráfico
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {visibleCards.sessoes_por_dia && (
          <Card>
            <CardHeader>
              <CardTitle>Sessões por Dia da Semana</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Alexandre: A lógica de exibição de "Nenhum alerta no momento" está correta. */}
  
              {dashboardData?.sessoes_por_dia?.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={dashboardData.sessoes_por_dia}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="dia" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="url(#colorGradient2)" />
                    <defs>
                      <linearGradient id="colorGradient2" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#14B8A6" />
                        <stop offset="100%" stopColor="#10B981" />
                      </linearGradient>
                    </defs>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 text-center py-8">
                  Dados insuficientes para o gráfico
                </p>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
