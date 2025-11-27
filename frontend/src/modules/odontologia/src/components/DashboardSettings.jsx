import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Settings } from 'lucide-react';

const DashboardSettings = ({ visibleCards, toggleCardVisibility }) => {
  const cardOptions = [
    { id: 'estatisticas', label: 'Estatísticas Chave' },
    { id: 'alertas', label: 'Alertas Inteligentes' },
    { id: 'proximas_sessoes', label: 'Próximas Sessões' },
    { id: 'sessoes_por_status', label: 'Gráfico: Sessões por Status' },
    { id: 'sessoes_por_dia', label: 'Gráfico: Sessões por Dia da Semana' },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Configurar Dashboard">
          <Settings className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Settings className="h-5 w-5 mr-2" />
            Customizar Dashboard
          </DialogTitle>
          <DialogDescription>
            Selecione quais cartões de informação você deseja visualizar no seu painel. Suas preferências serão salvas.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 pt-4">
          {cardOptions.map((option) => (
            <div key={option.id} className="flex items-center justify-between space-x-2 p-3 border rounded-lg">
              <Label htmlFor={option.id} className="text-base font-medium cursor-pointer">
                {option.label}
              </Label>
              <Switch
                id={option.id}
                checked={visibleCards[option.id]}
                onCheckedChange={() => toggleCardVisibility(option.id)}
              />
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardSettings;
