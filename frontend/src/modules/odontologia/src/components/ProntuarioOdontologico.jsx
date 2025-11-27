import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { supabase } from '@core/lib/supabaseClient';
import { useAuth } from '@core/contexts/AuthContext';

const ProntuarioOdontologico = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [patientData, setPatientData] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    telefone: '',
    email: '',
    historico_medico: { alergias: [], condicoes: [] },
  });
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    if (user && user.clinicas && user.clinicas.length > 0) {
      loadPatients(user.clinicas[0].id);
    }
  }, [user]);

  // Carregar dados do paciente quando selecionado
  useEffect(() => {
    if (selectedPatient) {
      loadPatientData(selectedPatient);
    }
  }, [selectedPatient]);

  const loadPatients = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('patients').select('*').eq('tenant_id', tenantId)
        .order('nome', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadPatientData = async (patientId) => {
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;
    try {
      const { data, error } = await supabase
        .from('patients').select('*').eq('tenant_id', tenantId).eq('id', patientId)
        .single();

      if (error) throw error;
      setPatientData(data);
    } catch (error) {
      console.error('Erro ao carregar dados do paciente:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPatientData({
      ...patientData,
      [name]: value,
    });
  };

  const handleHistoricoChange = (field, value) => {
    setPatientData({
      ...patientData,
      historico_medico: {
        ...patientData.historico_medico,
        [field]: value.split(',').map((item) => item.trim()),
      },
    });
  };

  const savePatientData = async () => {
    if (!selectedPatient) {
      setSaveMessage('Selecione um paciente primeiro.');
      return;
    }
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;
    if (!selectedPatient) {
      setSaveMessage('Selecione um paciente primeiro.');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('patients').update(patientData).eq('tenant_id', tenantId)
        .eq('id', selectedPatient);

      if (error) throw error;
      setSaveMessage('Prontuário salvo com sucesso!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao salvar prontuário:', error);
      setSaveMessage('Erro ao salvar prontuário.');
    } finally {
      setLoading(false);
    }
  };

  const createNewPatient = async () => {
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('patients').insert([
          {
            nome: 'Novo Paciente',
            historico_medico: { alergias: [], condicoes: [] },
            tenant_id: tenantId,
          },
        ])
        .select();

      if (error) throw error;
      setSelectedPatient(data[0].id);
      loadPatients();
      setSaveMessage('Novo paciente criado!');
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao criar novo paciente:', error);
      setSaveMessage('Erro ao criar novo paciente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Prontuário Odontológico</CardTitle>
          <CardDescription>Gerencie os dados e histórico dos pacientes.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Botão para Criar Novo Paciente */}
          <Button onClick={createNewPatient} disabled={loading} className="w-full">
            + Novo Paciente
          </Button>

          {/* Seletor de Paciente */}
          <div>
            <label className="block text-sm font-medium mb-2">Selecione o Paciente</label>
            <select
              value={selectedPatient || ''}
              onChange={(e) => setSelectedPatient(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="">Escolha um paciente...</option>
              {patients.map((patient) => (
                <option key={patient.id} value={patient.id}>
                  {patient.nome}
                </option>
              ))}
            </select>
          </div>

          {/* Formulário de Dados do Paciente */}
          {selectedPatient && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <Input
                    name="nome"
                    value={patientData.nome}
                    onChange={handleInputChange}
                    placeholder="Nome completo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">CPF</label>
                  <Input
                    name="cpf"
                    value={patientData.cpf || ''}
                    onChange={handleInputChange}
                    placeholder="CPF (criptografado)"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Data de Nascimento</label>
                  <Input
                    name="data_nascimento"
                    type="date"
                    value={patientData.data_nascimento || ''}
                    onChange={handleInputChange}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Telefone</label>
                  <Input
                    name="telefone"
                    value={patientData.telefone || ''}
                    onChange={handleInputChange}
                    placeholder="Telefone"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <Input
                  name="email"
                  type="email"
                  value={patientData.email || ''}
                  onChange={handleInputChange}
                  placeholder="Email"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Alergias (separadas por vírgula)</label>
                <Input
                  value={patientData.historico_medico?.alergias?.join(', ') || ''}
                  onChange={(e) => handleHistoricoChange('alergias', e.target.value)}
                  placeholder="Ex: Penicilina, Ibuprofeno"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Condições Médicas (separadas por vírgula)</label>
                <Input
                  value={patientData.historico_medico?.condicoes?.join(', ') || ''}
                  onChange={(e) => handleHistoricoChange('condicoes', e.target.value)}
                  placeholder="Ex: Hipertensão, Diabetes"
                />
              </div>

              {/* Botão de Salvar */}
              <Button onClick={savePatientData} disabled={loading} className="w-full">
                {loading ? 'Salvando...' : 'Salvar Prontuário'}
              </Button>

              {/* Mensagem de Status */}
              {saveMessage && (
                <div className={`p-3 rounded text-sm ${saveMessage.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {saveMessage}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ProntuarioOdontologico;
