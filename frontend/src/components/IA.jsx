import React, { useState } from 'react';
import { analyzeImage } from '../services/iaService';

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
      // Na implementação real, a imagem seria enviada para um bucket S3/Storage
      // e a URL seria passada para a Edge Function.
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

      {analysisResult && (
        <div className="mt-6 p-4 border rounded bg-gray-50">
          <h2 className="font-semibold">Resultado da Análise:</h2>
          <pre className="whitespace-pre-wrap text-sm">{JSON.stringify(analysisResult, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default IA;
