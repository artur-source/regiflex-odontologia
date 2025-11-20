import React, { useState } from 'react';
import { analyzeImage } from '../services/iaService';

// Componente genérico para exibir resultados de IA
const AIResultDisplay = ({ result }) => {
  if (!result) return null;

  if (result.error) {
    return <div className="text-red-500">Erro na Análise: {result.error}</div>;
  }

  // Lógica de exibição específica para o resultado de Análise de Imagem Odontológica
  return (
    <div className="mt-4 p-4 border rounded bg-white shadow-lg">
      <h2 className="text-xl font-bold mb-2 text-blue-700">Diagnóstico Assistido por IA</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="font-semibold text-gray-600">Achados Principais:</p>
          <p className="text-gray-800">{result.findings}</p>
        </div>
        <div>
          <p className="font-semibold text-gray-600">Nível de Urgência:</p>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            result.urgency === 'alto' ? 'bg-red-100 text-red-800' : 
            result.urgency === 'médio' ? 'bg-yellow-100 text-yellow-800' : 
            'bg-green-100 text-green-800'
          }`}>
            {result.urgency}
          </span>
        </div>
      </div>

      <div className="mt-4 border-t pt-4">
        <p className="font-semibold text-gray-600">Procedimentos Recomendados:</p>
        <p className="text-gray-800">{result.recommendations}</p>
      </div>
      
      <div className="mt-4 border-t pt-4 text-sm text-gray-500">
        <p className="font-semibold">Observações Adicionais:</p>
        <p>{result.observations}</p>
      </div>
    </div>
  );
};


const IA = ({ pacienteId }) => {
  const [file, setFile] = useState(null);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleAnalyze = async () => {
    if (!file) return;

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Simulação: Upload da imagem e chamada da Edge Function
      const imageUrl = "https://example.com/path/to/uploaded/image.jpg"; 
      const result = await analyzeImage(imageUrl, "tenant-id-exemplo");
      setAnalysisResult(result.analysis);
    } catch (error) {
      setAnalysisResult({ error: "Falha na análise da imagem. Verifique o console." });
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Análise de Imagens Clínicas (IA)</h1>
      <input type="file" accept="image/*" onChange={handleFileChange} className="mb-4" />
      <button 
        onClick={handleAnalyze} 
        disabled={!file || isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {isLoading ? 'Analisando...' : 'Analisar Imagem'}
      </button>

      <AIResultDisplay result={analysisResult} />
    </div>
  );
};

export default IA;
