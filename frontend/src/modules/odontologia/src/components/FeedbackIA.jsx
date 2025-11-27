import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ThumbsUp, ThumbsDown, Send, Loader2 } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import apiService from '../services/api';

const FeedbackIA = ({ sessaoId, alertaMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [feedbackType, setFeedbackType] = useState(''); // 'util' ou 'inutil'
  const [comentario, setComentario] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!feedbackType) {
      toast({
        title: "Atenção",
        description: "Selecione se o alerta foi útil ou inútil.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Simulação de chamada de API para enviar feedback
      // Em um cenário real, isso enviaria os dados para o backend
      // que registraria na tabela 'logs' ou 'feedback_ia' para retreinar o modelo.
      const feedbackData = {
        sessao_id: sessaoId,
        alerta_mensagem: alertaMessage,
        tipo: feedbackType,
        comentario: comentario,
        timestamp: new Date().toISOString()
      };

      // await apiService.sendIaFeedback(feedbackData); // Chamada real

      console.log("Feedback enviado:", feedbackData);
      
      toast({
        title: "Feedback Enviado",
        description: "Obrigado! Seu feedback ajudará a melhorar a precisão da IA.",
        variant: "default",
      });

      setIsOpen(false);
      setFeedbackType('');
      setComentario('');

    } catch (error) {
      console.error("Erro ao enviar feedback:", error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar o feedback. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className="text-xs h-6 px-2"
          onClick={() => setIsOpen(true)}
        >
          <ThumbsUp className="h-3 w-3 mr-1" />
          Feedback da IA
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <ThumbsUp className="h-5 w-5 mr-2" />
            Avaliar Alerta de IA
          </DialogTitle>
          <DialogDescription>
            Ajude-nos a treinar o modelo. O alerta de no-show foi útil?
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">O alerta foi útil?</Label>
            <RadioGroup 
              value={feedbackType} 
              onValueChange={setFeedbackType}
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="util" id="r1" />
                <Label htmlFor="r1" className="flex items-center cursor-pointer">
                  <ThumbsUp className="h-4 w-4 mr-1 text-green-600" />
                  Sim, foi útil
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="inutil" id="r2" />
                <Label htmlFor="r2" className="flex items-center cursor-pointer">
                  <ThumbsDown className="h-4 w-4 mr-1 text-red-600" />
                  Não, foi inútil
                </Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="comentario">Comentário (Opcional)</Label>
            <Textarea
              id="comentario"
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="O que aconteceu? (Ex: O paciente cancelou de última hora, ou o paciente compareceu mesmo com o alerta de alto risco)"
              disabled={loading}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={loading || !feedbackType}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  Enviar Feedback
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default FeedbackIA;
