import { useState, useEffect } from 'react';

const useOdontograma = (pacienteId) => {
  const [odontograma, setOdontograma] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulação de busca do odontograma do paciente no Supabase
    const fetchOdontograma = () => {
      // Dados simulados para o odontograma
      const initialData = [
        { dente_numero: 16, status: 'carie', anotacoes: 'Cárie oclusal' },
        { dente_numero: 24, status: 'restaurado', anotacoes: 'Restauração em resina' },
      ];
      setOdontograma(initialData);
      setIsLoading(false);
    };

    if (pacienteId) {
      fetchOdontograma();
    }
  }, [pacienteId]);

  const updateDente = (denteNumero, updates) => {
    // Simulação de atualização no Supabase
    console.log(`Atualizando dente ${denteNumero} do paciente ${pacienteId} com:`, updates);
    
    setOdontograma(prev => {
        const index = prev.findIndex(d => d.dente_numero === denteNumero);
        if (index > -1) {
            const newOdontograma = [...prev];
            newOdontograma[index] = { ...newOdontograma[index], ...updates };
            return newOdontograma;
        } else {
            return [...prev, { dente_numero: denteNumero, ...updates }];
        }
    });
  };

  return { odontograma, updateDente, isLoading };
};

export default useOdontograma;
