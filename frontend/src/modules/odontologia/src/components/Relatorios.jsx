import React, { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Filter, Download, LineChart, Users, XCircle, CheckCircle } from 'lucide-react';
import apiService from '../services/api';
import LoadingSpinner from './ui/LoadingSpinner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

// Cores para os gráficos (consistentes com o design system)
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d'];

// Componente de Estatísticas Chave
const KeyStats = ({ stats }) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
        <CheckCircle className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.attendanceRate}%</div>
        <p className="text-xs text-gray-500">
          {stats.totalRealizadas} de {stats.totalRealizadas + stats.totalFaltas} sessões
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Taxa de Cancelamento</CardTitle>
        <XCircle className="h-4 w-4 text-red-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.cancellationRate}%</div>
        <p className="text-xs text-gray-500">
          {stats.totalCanceladas} de {stats.totalSessoes} sessões
        </p>
      </CardContent>
    </Card>
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pacientes Ativos</CardTitle>
        <Users className="h-4 w-4 text-blue-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{stats.activePatients}</div>
        <p className="text-xs text-gray-500">
          Total de pacientes únicos com sessões no período
        </p>
      </CardContent>
    </Card>
  </div>
);

// Componente de Gráfico de Pizza (Tipos de Sessão)
const SessionTypeChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Distribuição por Tipo de Sessão</CardTitle>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            outerRadius={80}
            fill="#8884d8"
            label
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip formatter={(value, name, props) => [`${value} sessões`, name]} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Componente de Gráfico de Barras (Sessões por Status)
const StatusChart = ({ data }) => (
  <Card>
    <CardHeader>
      <CardTitle>Sessões por Status</CardTitle>
    </CardHeader>
    <CardContent className="h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip formatter={(value, name) => [value, name]} />
          <Legend />
          <Bar dataKey="total" fill="#8884d8" />
        </BarChart>
      </ResponsiveContainer>
    </CardContent>
  </Card>
);

// Componente Principal de Relatórios
const Relatorios = () => {
	  const [sessoes, setSessoes] = useState([]);
	  const [pacientes, setPacientes] = useState([]);
	  const [loading, setLoading] = useState(true);
	  const [error, setError] = useState('');
	  const [stats, setStats] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    paciente_id: '',
    status: ''
  });

  useEffect(() => {
    fetchData();
    fetchPacientes();
  }, [filters]);

	  const fetchData = async () => {
	    setLoading(true);
	    setError('');
	    try {
	      const { stats, sessoes } = await apiService.getRelatorioSessoes(filters);
	      setStats(stats);
	      setSessoes(sessoes || []);
	    } catch (err) {
	      setError('Erro ao carregar dados para o relatório.');
	      console.error(err);
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

	  // O cálculo de estatísticas avançadas e a filtragem agora são feitos no backend (RPC)
	  // Apenas formatamos os dados recebidos do backend para os gráficos
	  const formattedStats = useMemo(() => {
	    if (!stats) return null;

	    const totalParaComparecimento = stats.total_realizadas + stats.total_faltas;
	    
	    const attendanceRate = totalParaComparecimento > 0 
	      ? ((stats.total_realizadas / totalParaComparecimento) * 100).toFixed(1) 
	      : 0;
	      
	    const cancellationRate = stats.total_sessoes > 0 
	      ? (((stats.total_canceladas + stats.total_faltas) / stats.total_sessoes) * 100).toFixed(1) 
	      : 0;

	    return {
	      attendanceRate,
	      cancellationRate,
	      activePatients: stats.active_patients,
	      totalRealizadas: stats.total_realizadas,
	      totalFaltas: stats.total_faltas,
	      totalCanceladas: stats.total_canceladas,
	      totalSessoes: stats.total_sessoes,
	      sessionTypeData: stats.session_type_data,
	      statusData: stats.status_data.map(d => ({ name: d.name, total: d.total })),
	    };
	  }, [stats]);

  const handleExport = async (format) => {
    try {
      setLoading(true);
      await apiService.exportRelatorio(format, filters);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      setError('Erro ao exportar relatório. Tente novamente.');
      setLoading(false);
    }
  };

	  if (loading) {
	    return <LoadingSpinner text="Gerando Relatório..." className="py-20" />;
	  }
	  
	  return (
	    <div className="space-y-6">
	      {/* Header */}
	      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <FileText className="h-6 w-6 mr-2 text-blue-600" />
            Relatórios Inteligentes
          </h2>
          <p className="text-gray-600">Análise avançada do desempenho da clínica</p>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={() => handleExport('PDF')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar PDF
          </Button>
          <Button variant="outline" onClick={() => handleExport('CSV')}>
            <Download className="h-4 w-4 mr-2" />
            Exportar CSV
          </Button>
        </div>
      </div>

      {/* Filtros Dinâmicos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Filter className="h-4 w-4 mr-2" />
            Filtros Dinâmicos
          </CardTitle>
          <CardDescription>Selecione o período e o público para a análise.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Data Início</label>
              <Input 
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Data Fim</label>
              <Input 
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Paciente</label>
              <Select 
                value={filters.paciente_id}
                onValueChange={(value) => setFilters({...filters, paciente_id: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Pacientes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Pacientes</SelectItem>
                  {pacientes.map(p => (
                    <SelectItem key={p.id} value={p.id.toString()}>{p.nome_completo}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Status</label>
              <Select 
                value={filters.status}
                onValueChange={(value) => setFilters({...filters, status: value})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Todos os Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Todos os Status</SelectItem>
                  <SelectItem value="agendada">Agendada</SelectItem>
                  <SelectItem value="realizada">Realizada</SelectItem>
                  <SelectItem value="cancelada">Cancelada</SelectItem>
                  <SelectItem value="faltou">Faltou</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Exibição de Erro */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

	      {/* Estatísticas Chave */}
	      {!loading && formattedStats && formattedStats.totalSessoes > 0 && <KeyStats stats={formattedStats} />}
	      
	      {/* Visualizações Interativas (Gráficos) */}
	      {!loading && formattedStats && formattedStats.totalSessoes > 0 && (
	        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
	          <SessionTypeChart data={formattedStats.sessionTypeData} />
	          <StatusChart data={formattedStats.statusData} />
	        </div>
	      )}
	      
	      {/* Mensagem de Sem Dados */}
	      {!loading && (!formattedStats || formattedStats.totalSessoes === 0) && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-gray-500">Nenhuma sessão encontrada com os filtros aplicados.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Relatorios;
