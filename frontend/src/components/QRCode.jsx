import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  QrCode, 
  Scan, 
  Download, 
  Upload,
  User,
  Phone,
  Mail,
  Calendar,
  Loader2,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import apiService from '../services/api';

const QRCodeComponent = () => {
  const [selectedPaciente, setSelectedPaciente] = useState(null);
  const [qrCodeData, setQrCodeData] = useState('');
  const [scannedData, setScannedData] = useState('');
  const [pacienteInfo, setPacienteInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    fetchPacientes();
  }, []);

  const fetchPacientes = async () => {
    try {
      const data = await apiService.getPacientes(1, 50);
      setPacientes(data.pacientes || []);
    } catch (error) {
      setError('Erro ao carregar pacientes');
    }
  };

  const handleGenerateQR = async (paciente) => {
    setLoading(true);
    setError('');
    
    try {
      const data = await apiService.generateQRCode(paciente.id);
      setSelectedPaciente(paciente);
      setQrCodeData(data.qr_code);
      setSuccess('QR Code gerado com sucesso!');
    } catch (error) {
      setError(error.message || 'Erro ao gerar QR Code');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadQR = () => {
    if (!qrCodeData) return;

    const canvas = document.querySelector('#qr-code-canvas canvas');
    if (canvas) {
      const link = document.createElement('a');
      link.download = `qr-${selectedPaciente?.nome_completo || 'paciente'}.png`;
      link.href = canvas.toDataURL();
      link.click();
    }
  };

  const handleScanQR = async () => {
    if (!scannedData.trim()) {
      setError('Digite os dados do QR Code');
      return;
    }

    setLoading(true);
    setError('');
    setPacienteInfo(null);

    try {
      const data = await apiService.readQRCode(scannedData);
      setPacienteInfo(data.paciente);
      setSuccess('QR Code lido com sucesso!');
    } catch (error) {
      setError(error.message || 'QR Code inválido');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Simulação de leitura de QR Code de arquivo
    // Em um ambiente real, seria necessário usar uma biblioteca como jsQR
    setError('Funcionalidade de upload de imagem será implementada em versões futuras');
  };

  const filteredPacientes = pacientes.filter(paciente =>
    paciente.nome_completo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCPF = (cpf) => {
    if (!cpf) return '-';
    return cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900">QR Code</h2>
        <p className="text-gray-600">Gere e leia QR Codes dos pacientes</p>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">{success}</AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="generate" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="generate" className="flex items-center">
            <QrCode className="mr-2 h-4 w-4" />
            Gerar QR Code
          </TabsTrigger>
          <TabsTrigger value="scan" className="flex items-center">
            <Scan className="mr-2 h-4 w-4" />
            Ler QR Code
          </TabsTrigger>
        </TabsList>

        {/* Gerar QR Code */}
        <TabsContent value="generate" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Selecionar Paciente</CardTitle>
              <CardDescription>
                Escolha um paciente para gerar seu QR Code
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="search">Buscar Paciente</Label>
                  <Input
                    id="search"
                    placeholder="Digite o nome do paciente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                  {filteredPacientes.map((paciente) => (
                    <Card 
                      key={paciente.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => handleGenerateQR(paciente)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium">{paciente.nome_completo}</h4>
                            <div className="text-sm text-gray-600 space-y-1 mt-2">
                              {paciente.cpf && (
                                <div className="flex items-center">
                                  <span>CPF: {formatCPF(paciente.cpf)}</span>
                                </div>
                              )}
                              {paciente.telefone && (
                                <div className="flex items-center">
                                  <Phone className="h-3 w-3 mr-1" />
                                  <span>{paciente.telefone}</span>
                                </div>
                              )}
                            </div>
                          </div>
                          <Button size="sm" variant="outline">
                            <QrCode className="h-3 w-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* QR Code Gerado */}
          {qrCodeData && selectedPaciente && (
            <Card>
              <CardHeader>
                <CardTitle>QR Code Gerado</CardTitle>
                <CardDescription>
                  QR Code para {selectedPaciente.nome_completo}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="flex-1 text-center">
                    <div id="qr-code-canvas" className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                      <QRCodeSVG
                        value={selectedPaciente.qr_code_data}
                        size={200}
                        level="M"
                        includeMargin={true}
                      />
                    </div>
                    <div className="mt-4">
                      <Button onClick={handleDownloadQR} className="w-full">
                        <Download className="mr-2 h-4 w-4" />
                        Baixar QR Code
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex-1">
                    <h4 className="font-medium mb-3">Informações do Paciente</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-gray-500" />
                        <span>{selectedPaciente.nome_completo}</span>
                      </div>
                      {selectedPaciente.data_nascimento && (
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{formatDate(selectedPaciente.data_nascimento)}</span>
                        </div>
                      )}
                      {selectedPaciente.telefone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedPaciente.telefone}</span>
                        </div>
                      )}
                      {selectedPaciente.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2 text-gray-500" />
                          <span>{selectedPaciente.email}</span>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                      <strong>Dados do QR:</strong><br />
                      {selectedPaciente.qr_code_data}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Ler QR Code */}
        <TabsContent value="scan" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ler QR Code</CardTitle>
              <CardDescription>
                Digite os dados do QR Code ou faça upload de uma imagem
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="qr-data">Dados do QR Code</Label>
                  <Input
                    id="qr-data"
                    placeholder="Cole ou digite os dados do QR Code aqui..."
                    value={scannedData}
                    onChange={(e) => setScannedData(e.target.value)}
                  />
                </div>

                <div className="flex space-x-2">
                  <Button 
                    onClick={handleScanQR} 
                    disabled={loading || !scannedData.trim()}
                    className="flex-1"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Lendo...
                      </>
                    ) : (
                      <>
                        <Scan className="mr-2 h-4 w-4" />
                        Ler QR Code
                      </>
                    )}
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </Button>
                  
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Informações do Paciente Escaneado */}
          {pacienteInfo && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-green-600">
                  <CheckCircle className="mr-2 h-5 w-5" />
                  QR Code Válido
                </CardTitle>
                <CardDescription>
                  Informações do paciente encontradas
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-500">Nome Completo</Label>
                      <p className="text-lg font-medium">{pacienteInfo.nome_completo}</p>
                    </div>
                    
                    {pacienteInfo.data_nascimento && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Data de Nascimento</Label>
                        <p>{formatDate(pacienteInfo.data_nascimento)}</p>
                      </div>
                    )}
                    
                    {pacienteInfo.cpf && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">CPF</Label>
                        <p>{formatCPF(pacienteInfo.cpf)}</p>
                      </div>
                    )}
                    
                    {pacienteInfo.telefone && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">Telefone</Label>
                        <p>{pacienteInfo.telefone}</p>
                      </div>
                    )}
                    
                    {pacienteInfo.email && (
                      <div>
                        <Label className="text-sm font-medium text-gray-500">E-mail</Label>
                        <p>{pacienteInfo.email}</p>
                      </div>
                    )}
                    
                    {pacienteInfo.endereco && (
                      <div className="md:col-span-2">
                        <Label className="text-sm font-medium text-gray-500">Endereço</Label>
                        <p>{pacienteInfo.endereco}</p>
                      </div>
                    )}
                  </div>
                  
                  <div className="pt-4 border-t">
                    <div className="flex space-x-2">
                      <Button variant="outline" className="flex-1">
                        Ver Histórico
                      </Button>
                      <Button className="flex-1">
                        Agendar Sessão
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default QRCodeComponent;
