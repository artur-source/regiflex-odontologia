import { useState, useEffect } from 'react';
// Importar supabaseClient do Core

const usePacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPacientes = async () => {
      try {
        // Simulação de chamada ao Supabase (tabela odontologia_pacientes)
        // O RLS garantiria que apenas os pacientes do tenant fossem retornados.
        // const { data, error } = await supabase.from('odontologia_pacientes').select('*');
        
        // Simulação de dados
        const data = [
            { id: 'p1', nome: 'Ana Silva', cpf: '12345678901', telefone: '(11) 98765-4321' },
            { id: 'p2', nome: 'Bruno Costa', cpf: '98765432109', telefone: '(11) 99999-8888' },
        ];

        if (false) { // Simulação de erro
          throw new Error("Erro ao buscar dados");
        }

        setPacientes(data);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPacientes();
  }, []);

  return { pacientes, isLoading, error };
};

export default usePacientes;
