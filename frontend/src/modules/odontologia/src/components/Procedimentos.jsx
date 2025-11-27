import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@core/lib/supabaseClient';
import { useAuth } from '@core/contexts/AuthContext';

const Procedimentos = () => {
  const { user } = useAuth();
  const [patients, setPatients] = useState([]);
  const [procedures, setProcedures] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [newProcedure, setNewProcedure] = useState({
    tipo_procedimento: '',
    dentes_envolvidos: '',
    valor: '',
  });

  const procedureTypes = [
    'Limpeza',
    'Restauração',
    'Extração',
    'Endodontia',
    'Implante',
    'Clareamento',
    'Ortodontia',
    'Periodontia',
  ];

  // Carregar pacientes ao montar o componente
  useEffect(() => {
    if (user && user.clinicas && user.clinicas.length > 0) {
      loadPatients(user.clinicas[0].id);
    }
  }, [user]);

  // Carregar procedimentos quando um paciente é selecionado
  useEffect(() => {
    if (selectedPatient) {
      loadProcedures(selectedPatient);
    }
  }, [selectedPatient]);

  const loadPatients = async (tenantId) => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .eq('tenant_id', tenantId)
        .select('*')
        .order('nome', { ascending: true });

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Erro ao carregar pacientes:', error);
    }
  };

  const loadProcedures = async (patientId) => {
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;
    try {
      const { data, error } = await supabase
        .from('procedures')
        .eq('tenant_id', tenantId)
        .select('*')
        .eq('patient_id', patientId)
        .order('data_procedimento', { ascending: false });

      if (error) throw error;
      setProcedures(data || []);
    } catch (error) {
      console.error('Erro ao carregar procedimentos:', error);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewProcedure({
      ...newProcedure,
      [name]: value,
    });
  };

  const addProcedure = async () => {
    if (!selectedPatient || !newProcedure.tipo_procedimento || !newProcedure.valor) {
      setSaveMessage('Preencha todos os campos obrigatórios.');
      return;
    }
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;

    setLoading(true);
    try {
      const { error } = await supabase
        .from('procedures')
        .insert([
          {
            patient_id: selectedPatient,
            tipo_procedimento: newProcedure.tipo_procedimento,
            dentes_envolvidos: newProcedure.dentes_envolvidos
              ? newProcedure.dentes_envolvidos.split(',').map((d) => parseInt(d.trim()))
              : [],
            valor: parseFloat(newProcedure.valor),
            tenant_id: tenantId,
          },
        ]);

      if (error) throw error;

      setSaveMessage('Procedimento adicionado com sucesso!');
      setNewProcedure({ tipo_procedimento: '', dentes_envolvidos: '', valor: '' });
      loadProcedures(selectedPatient);
      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Erro ao adicionar procedimento:', error);
      setSaveMessage('Erro ao adicionar procedimento.');
    } finally {
      setLoading(false);
    }
  };

  const deleteProcedure = async (procedureId) => {
    if (!user || !user.clinicas || user.clinicas.length === 0) return;
    const tenantId = user.clinicas[0].id;
if (window.confirm('Tem certeza que deseja deletar este procedimento?')) {
      try {
        const { error } = await supabase
          .from('procedures')
          .delete()
          .eq('id', procedureId)
          .eq('tenant_id', tenantId);

        if (error) throw error;
        loadProcedures(selectedPatient);
        setSaveMessage('Procedimento deletado com sucesso!');
        setTimeout(() => setSaveMessage(''), 3000);
      } catch (error) {
        console.error('Erro ao deletar procedimento:', error);
        setSaveMessage('Erro ao deletar procedimento.');
      }
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Procedimentos Odontológicos</CardTitle>
          <CardDescription>Registre e gerencie os procedimentos realizados.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seletor de Paciente */}
          <div>
            <label className="block text-sm font-medium mb-2">Selecione o Paciente</label>
            <Select value={selectedPatient || ''} onValueChange={setSelectedPatient}>
              <SelectTrigger>
                <SelectValue placeholder="Escolha um paciente..." />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Formulário para Novo Procedimento */}
          {selectedPatient && (
            <div className="space-y-4 p-4 bg-gray-50 rounded">
              <h3 className="font-semibold">Novo Procedimento</h3>

              <div>
                <label className="block text-sm font-medium mb-1">Tipo de Procedimento</label>
                <Select value={newProcedure.tipo_procedimento} onValueChange={(value) => setNewProcedure({ ...newProcedure, tipo_procedimento: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {procedureTypes.map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Dentes Envolvidos (separados por vírgula)</label>
                <Input
                  name="dentes_envolvidos"
                  value={newProcedure.dentes_envolvidos}
                  onChange={handleInputChange}
                  placeholder="Ex: 16, 26, 36"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Valor (R$)</label>
                <Input
                  name="valor"
                  type="number"
                  step="0.01"
                  value={newProcedure.valor}
                  onChange={handleInputChange}
                  placeholder="0.00"
                />
              </div>

              <Button onClick={addProcedure} disabled={loading} className="w-full">
                {loading ? 'Adicionando...' : 'Adicionar Procedimento'}
              </Button>
            </div>
          )}

          {/* Lista de Procedimentos */}
          {selectedPatient && procedures.length > 0 && (
            <div>
              <h3 className="font-semibold mb-3">Procedimentos Realizados</h3>
              <div className="space-y-2">
                {procedures.map((procedure) => (
                  <div key={procedure.id} className="p-3 bg-gray-50 rounded flex justify-between items-center">
                    <div>
                      <p className="font-medium">{procedure.tipo_procedimento}</p>
                      <p className="text-sm text-gray-600">
                        {new Date(procedure.data_procedimento).toLocaleDateString('pt-BR')} - R$ {procedure.valor?.toFixed(2)}
                      </p>
                      {procedure.dentes_envolvidos?.length > 0 && (
                        <p className="text-sm text-gray-600">Dentes: {procedure.dentes_envolvidos.join(', ')}</p>
                      )}
                    </div>
                    <Button
                      onClick={() => deleteProcedure(procedure.id)}
                      variant="destructive"
                      size="sm"
                    >
                      Deletar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Mensagem de Status */}
          {saveMessage && (
            <div className={`p-3 rounded text-sm ${saveMessage.includes('sucesso') ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {saveMessage}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Procedimentos;
