import React from 'react';
import usePacientes from '../hooks/usePacientes';

const Pacientes = () => {
  const { pacientes, isLoading, error } = usePacientes();

  if (isLoading) return <div>Carregando pacientes...</div>;
  if (error) return <div>Erro ao carregar pacientes: {error.message}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Gestão de Pacientes Odontológicos</h1>
      {/* Implementação do formulário de cadastro, busca e listagem */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {pacientes.map(paciente => (
          <div key={paciente.id} className="p-4 border rounded shadow">
            <h2 className="font-semibold">{paciente.nome}</h2>
            <p>CPF: {paciente.cpf}</p>
            <p>Telefone: {paciente.telefone}</p>
            {/* Link para o perfil do paciente */}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Pacientes;
