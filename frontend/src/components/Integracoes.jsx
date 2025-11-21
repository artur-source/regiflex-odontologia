import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Webhook, 
  Mail, 
  MessageSquare, 
  FileText, 
  Calendar,
  Settings,
  CheckCircle,
  AlertCircle,
  ExternalLink
} from 'lucide-react';

const Integracoes = () => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [slackNotifications, setSlackNotifications] = useState(false);
  const [autoReports, setAutoReports] = useState(false);
  const [calendarSync, setCalendarSync] = useState(false);
  const [integrationStatus, setIntegrationStatus] = useState('inactive');

  const handleSaveIntegrations = () => {
    // Simular salvamento das configurações
    setIntegrationStatus('active');
    setTimeout(() => {
      setIntegrationStatus('inactive');
    }, 3000);
  };

  const integrationCards = [
    {
      id: 'n8n',
      name: 'n8n Workflow',
      description: 'Automação de fluxos de trabalho com mais de 1000+ integrações',
      icon: <Webhook className="h-8 w-8 text-blue-600" />,
      status: 'recommended',
      features: ['Notificações automáticas', 'Relatórios agendados', 'Sincronização de dados']
    },
    {
      id: 'email',
      name: 'Notificações Email',
      description: 'Envio automático de lembretes e confirmações',
      icon: <Mail className="h-8 w-8 text-green-600" />,
      status: 'available',
      features: ['Lembrete de consultas', 'Confirmações de agendamento', 'Relatórios por email']
    },
    {
      id: 'slack',
      name: 'Slack Integration',
      description: 'Notificações em tempo real para a equipe',
      icon: <MessageSquare className="h-8 w-8 text-purple-600" />,
      status: 'available',
      features: ['Alertas de novos pacientes', 'Notificações de cancelamento', 'Resumos diários']
    },
    {
      id: 'reports',
      name: 'Relatórios Automáticos',
      description: 'Geração e envio automático de relatórios',
      icon: <FileText className="h-8 w-8 text-orange-600" />,
      status: 'available',
      features: ['Relatórios semanais', 'Estatísticas mensais', 'Análises de performance']
    }
  ];

  const getStatusBadge = (status) => {
    switch (status) {
      case 'recommended':
        return <Badge className="bg-blue-100 text-blue-800">Recomendado</Badge>;
      case 'available':
        return <Badge className="bg-green-100 text-green-800">Disponível</Badge>;
      case 'coming-soon':
        return <Badge className="bg-gray-100 text-gray-800">Em Breve</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Integrações</h1>
          <p className="text-gray-600 mt-2">
            Conecte o RegiFlex com suas ferramentas favoritas para automatizar fluxos de trabalho
          </p>
        </div>
        <Button onClick={handleSaveIntegrations} className="bg-blue-600 hover:bg-blue-700">
          <Settings className="h-4 w-4 mr-2" />
          Salvar Configurações
        </Button>
      </div>

      {integrationStatus === 'active' && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Configurações de integração salvas com sucesso!
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="available" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="available">Integrações Disponíveis</TabsTrigger>
          <TabsTrigger value="configure">Configurar</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks</TabsTrigger>
        </TabsList>

        <TabsContent value="available" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {integrationCards.map((integration) => (
              <Card key={integration.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      {integration.icon}
                      <div>
                        <CardTitle className="text-lg">{integration.name}</CardTitle>
                        <CardDescription>{integration.description}</CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(integration.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-gray-900">Funcionalidades:</h4>
                    <ul className="space-y-1">
                      {integration.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600 flex items-center">
                          <CheckCircle className="h-3 w-3 text-green-500 mr-2" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="mt-4 flex space-x-2">
                    <Button size="sm" variant="outline" className="flex-1">
                      Configurar
                    </Button>
                    <Button size="sm" variant="ghost">
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="configure" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configurações de Notificação</CardTitle>
              <CardDescription>
                Configure quando e como você deseja receber notificações automáticas
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Notificações por Email</Label>
                  <p className="text-sm text-gray-600">
                    Receber lembretes e confirmações por email
                  </p>
                </div>
                <Switch
                  checked={emailNotifications}
                  onCheckedChange={setEmailNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Notificações Slack</Label>
                  <p className="text-sm text-gray-600">
                    Alertas em tempo real no Slack da equipe
                  </p>
                </div>
                <Switch
                  checked={slackNotifications}
                  onCheckedChange={setSlackNotifications}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Relatórios Automáticos</Label>
                  <p className="text-sm text-gray-600">
                    Geração automática de relatórios semanais
                  </p>
                </div>
                <Switch
                  checked={autoReports}
                  onCheckedChange={setAutoReports}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base font-medium">Sincronização de Calendário</Label>
                  <p className="text-sm text-gray-600">
                    Sincronizar sessões com Google Calendar
                  </p>
                </div>
                <Switch
                  checked={calendarSync}
                  onCheckedChange={setCalendarSync}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Configuração de Webhooks</CardTitle>
              <CardDescription>
                Configure URLs de webhook para receber eventos do RegiFlex em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="webhook-url">URL do Webhook n8n</Label>
                <Input
                  id="webhook-url"
                  placeholder="https://seu-n8n.com/webhook/regiflex"
                  value={webhookUrl}
                  onChange={(e) => setWebhookUrl(e.target.value)}
                />
                <p className="text-sm text-gray-600">
                  Cole aqui a URL do webhook gerada pelo n8n para receber eventos
                </p>
              </div>

              <Alert className="border-blue-200 bg-blue-50">
                <AlertCircle className="h-4 w-4 text-blue-600" />
                <AlertDescription className="text-blue-800">
                  <strong>Eventos disponíveis:</strong> Novo paciente, Sessão agendada, 
                  Sessão cancelada, Relatório gerado
                </AlertDescription>
              </Alert>

              <div className="flex space-x-2">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  Testar Webhook
                </Button>
                <Button variant="outline">
                  Ver Documentação
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Exemplos de Automação</CardTitle>
              <CardDescription>
                Ideias de fluxos de trabalho que você pode criar com n8n
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Lembrete de Consulta</h4>
                  <p className="text-sm text-gray-600">
                    Enviar email/SMS 24h antes da sessão agendada
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Backup Automático</h4>
                  <p className="text-sm text-gray-600">
                    Exportar dados para Google Sheets semanalmente
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Relatório Mensal</h4>
                  <p className="text-sm text-gray-600">
                    Gerar e enviar relatório de atividades por email
                  </p>
                </div>
                <div className="p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Alerta de Cancelamento</h4>
                  <p className="text-sm text-gray-600">
                    Notificar equipe via Slack sobre cancelamentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Integracoes;
