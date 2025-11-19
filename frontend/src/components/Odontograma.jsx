import React from 'react';
import useOdontograma from '../hooks/useOdontograma';

const Odontograma = ({ pacienteId }) => {
  const { odontograma, updateDente, isLoading } = useOdontograma(pacienteId);

  if (isLoading) return <div>Carregando odontograma...</div>;

  // Lógica de renderização do Odontograma Interativo (32 dentes)
  const renderDente = (numero) => {
    const dente = odontograma.find(d => d.dente_numero === numero) || { status: 'saudavel', anotacoes: '' };
    
    const handleClick = () => {
      // Simulação de atualização do status do dente
      const novoStatus = dente.status === 'saudavel' ? 'carie' : 'saudavel';
      updateDente(numero, { status: novoStatus });
    };

    return (
      <div 
        key={numero} 
        className={`w-10 h-10 border flex items-center justify-center cursor-pointer ${dente.status === 'carie' ? 'bg-red-500 text-white' : 'bg-green-300'}`}
        onClick={handleClick}
      >
        {numero}
      </div>
    );
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Odontograma Interativo</h1>
      <div className="grid grid-cols-8 gap-2">
        {/* Renderiza os 32 dentes */}
        {Array.from({ length: 32 }, (_, i) => renderDente(i + 1))}
      </div>
      <p className="mt-4">Status: {odontograma.length} dentes registrados.</p>
    </div>
  );
};

export default Odontograma;
