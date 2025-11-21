import { supabase } from '../lib/supabaseClient';

class SupabaseApiService {
  // Autenticação
  async login(username, password) {
    try {
      // Primeiro, buscar o usuário pelo username
      const { data: usuarios, error: searchError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('username', username)
        .single();

      if (searchError || !usuarios) {
        throw new Error('Usuário não encontrado');
      }

      // Por enquanto, vamos usar o Supabase Auth com email
      // Nota: Isso requer configuração adicional no Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email: usuarios.email,
        password: password
      });

      if (error) throw error;

      return {
        token: data.session.access_token,
        user: {
          id: usuarios.id,
          username: usuarios.username,
          email: usuarios.email,
          role: usuarios.role
        }
      };
    } catch (error) {
      console.error('Erro no login:', error);
      throw error;
    }
  }

  async logout() {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    return { message: 'Logout realizado com sucesso' };
  }

  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;

      // Buscar dados adicionais do usuário na tabela usuarios
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select(`
          *,
          clinica:clinicas(limite_pacientes)
        `)
        .eq('email', user.email)
        .single();

      if (userError) throw userError;

      return {
        user: {
          id: userData.id,
          username: userData.username,
          email: userData.email,
          role: userData.role,
          plano_atual: userData.plano_atual,
          stripe_customer_id: userData.stripe_customer_id,
          limite_pacientes: userData.clinica.limite_pacientes
        }
      };
    } catch (error) {
      console.error('Erro ao buscar usuário atual:', error);
      throw error;
    }
  }

  // Pacientes
  async getPacientes(page = 1, perPage = 10) {
    try {
      const from = (page - 1) * perPage;
      const to = from + perPage - 1;

      const { data, error, count } = await supabase
        .from('pacientes')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range(from, to);

      if (error) throw error;

      return {
        pacientes: data,
        total: count,
        page: page,
        per_page: perPage,
        total_pages: Math.ceil(count / perPage)
      };
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  async getPaciente(id) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return { paciente: data };
    } catch (error) {
      console.error('Erro ao buscar paciente:', error);
      throw error;
    }
  }

  async createPaciente(pacienteData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data: userData, error: userError } = await supabase
        .from("usuarios")
        .select(`
          *,
          clinica:clinicas(id, limite_pacientes)
        `)
        .eq("email", user.email)
        .single();

      if (userError) throw userError;

      // Verificação do limite de pacientes apenas para o plano 'individual'
      if (userData.plano_atual === 'individual') {
        const { count: currentPatientsCount, error: countError } = await supabase
          .from("pacientes")
          .select("*", { count: "exact", head: true })
          .eq("clinica_id", userData.clinica.id);

        if (countError) throw countError;

        if (currentPatientsCount >= userData.clinica.limite_pacientes) {
          throw new Error("Limite de pacientes atingido para o plano Individual. Faça upgrade para o plano Clínica para adicionar mais pacientes.");
        }
      }

      // Gerar QR code data único
      const qrCodeData = `PAC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const { data, error } = await supabase
        .from('pacientes')
        .insert([{ ...pacienteData, qr_code_data: qrCodeData, clinica_id: userData.clinica.id }])
        .select()
        .single();

	      if (error) throw error;
	      
	      // Log de Auditoria: Criação de Paciente
	      await supabase.from('logs').insert([{
	        acao: 'CREATE_PACIENTE',
	        entidade: 'pacientes',
	        entidade_id: data.id,
	        detalhes: JSON.stringify(pacienteData)
	      }]);

	      return { paciente: data, message: 'Paciente criado com sucesso' };
	    } catch (error) {
      console.error('Erro ao criar paciente:', error);
      throw error;
    }
  }

  async updatePaciente(id, pacienteData) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .update({ ...pacienteData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

	      if (error) throw error;

	      // Log de Auditoria: Atualização de Paciente
	      await supabase.from('logs').insert([{
	        acao: 'UPDATE_PACIENTE',
	        entidade: 'pacientes',
	        entidade_id: id,
	        detalhes: JSON.stringify(pacienteData)
	      }]);

	      return { paciente: data, message: 'Paciente atualizado com sucesso' };
	    } catch (error) {
      console.error('Erro ao atualizar paciente:', error);
      throw error;
    }
  }

  async deletePaciente(id) {
    try {
      const { error } = await supabase
        .from('pacientes')
        .delete()
        .eq('id', id);

	      if (error) throw error;

	      // Log de Auditoria: Exclusão de Paciente
	      await supabase.from('logs').insert([{
	        acao: 'DELETE_PACIENTE',
	        entidade: 'pacientes',
	        entidade_id: id,
	        detalhes: `Paciente com ID ${id} excluído.`
	      }]);

	      return { message: 'Paciente excluído com sucesso' };
	    } catch (error) {
      console.error('Erro ao excluir paciente:', error);
      throw error;
    }
  }

  async searchPacientes(query) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .or(`nome_completo.ilike.%${query}%,cpf.ilike.%${query}%,telefone.ilike.%${query}%`)
        .order('nome_completo');

      if (error) throw error;
      return { pacientes: data };
    } catch (error) {
      console.error('Erro ao buscar pacientes:', error);
      throw error;
    }
  }

  // Sessões
  async getSessoes(filters = {}) {
    try {
      let query = supabase
        .from('sessoes')
        .select(`
          *,
          paciente:pacientes(*),
          psicologo:usuarios(*)
        `)
        .order('data_hora', { ascending: false });

      // Aplicar filtros
      if (filters.paciente_id) {
        query = query.eq('paciente_id', filters.paciente_id);
      }
      if (filters.psicologo_id) {
        query = query.eq('psicologo_id', filters.psicologo_id);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.data_inicio) {
        query = query.gte('data_hora', filters.data_inicio);
      }
      if (filters.data_fim) {
        query = query.lte('data_hora', filters.data_fim);
      }

      const { data, error } = await query;

      if (error) throw error;
      return { sessoes: data };
    } catch (error) {
      console.error('Erro ao buscar sessões:', error);
      throw error;
    }
  }

  async getSessao(id) {
    try {
      const { data, error } = await supabase
        .from('sessoes')
        .select(`
          *,
          paciente:pacientes(*),
          psicologo:usuarios(*),
          evolucao(*)
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return { sessao: data };
    } catch (error) {
      console.error('Erro ao buscar sessão:', error);
      throw error;
    }
  }

  async createSessao(sessaoData) {
    try {
      const { data, error } = await supabase
        .from('sessoes')
        .insert([sessaoData])
        .select()
        .single();

	      if (error) throw error;

	      // Log de Auditoria: Criação de Sessão
	      await supabase.from('logs').insert([{
	        acao: 'CREATE_SESSAO',
	        entidade: 'sessoes',
	        entidade_id: data.id,
	        detalhes: JSON.stringify(sessaoData)
	      }]);

	      return { sessao: data, message: 'Sessão criada com sucesso' };
	    } catch (error) {
      console.error('Erro ao criar sessão:', error);
      throw error;
    }
  }

  async updateSessao(id, sessaoData) {
    try {
      const { data, error } = await supabase
        .from('sessoes')
        .update({ ...sessaoData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

	      if (error) throw error;

	      // Log de Auditoria: Atualização de Sessão
	      await supabase.from('logs').insert([{
	        acao: 'UPDATE_SESSAO',
	        entidade: 'sessoes',
	        entidade_id: id,
	        detalhes: JSON.stringify(sessaoData)
	      }]);

	      return { sessao: data, message: 'Sessão atualizada com sucesso' };
	    } catch (error) {
      console.error('Erro ao atualizar sessão:', error);
      throw error;
    }
  }

  async createEvolucao(sessaoId, conteudo) {
    try {
      const { data, error } = await supabase
        .from('evolucao')
        .insert([{ sessao_id: sessaoId, conteudo }])
        .select()
        .single();

      if (error) throw error;
      return { evolucao: data, message: 'Evolução criada com sucesso' };
    } catch (error) {
      console.error('Erro ao criar evolução:', error);
      throw error;
    }
  }

  async updateEvolucao(sessaoId, conteudo) {
    try {
      const { data, error } = await supabase
        .from('evolucao')
        .update({ conteudo, updated_at: new Date().toISOString() })
        .eq('sessao_id', sessaoId)
        .select()
        .single();

      if (error) throw error;
      return { evolucao: data, message: 'Evolução atualizada com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar evolução:', error);
      throw error;
    }
  }

  // QR Code
  async generateQRCode(pacienteId) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('qr_code_data')
        .eq('id', pacienteId)
        .single();

      if (error) throw error;
      return { qr_code: data.qr_code_data };
    } catch (error) {
      console.error('Erro ao gerar QR code:', error);
      throw error;
    }
  }

  async readQRCode(qrData) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('*')
        .eq('qr_code_data', qrData)
        .single();

      if (error) throw error;
      return { paciente: data };
    } catch (error) {
      console.error('Erro ao ler QR code:', error);
      throw error;
    }
  }

  async validateQRCode(qrData) {
    try {
      const { data, error } = await supabase
        .from('pacientes')
        .select('id, nome_completo')
        .eq('qr_code_data', qrData)
        .single();

      if (error) throw error;
      return { valid: true, paciente: data };
    } catch (error) {
      return { valid: false };
    }
  }

  // Relatórios
  async getAggregatedReport(filters = {}) {
    const { startDate, endDate, paciente_id, status } = filters;
    
    const { data, error } = await supabase.rpc('get_aggregated_report', {
      start_date: startDate || null,
      end_date: endDate || null,
      paciente_id_filter: paciente_id ? parseInt(paciente_id) : null,
      status_filter: status || null,
    });

    if (error) {
      console.error('Erro ao chamar RPC get_aggregated_report:', error);
      throw new Error('Erro ao buscar relatório agregado.');
    }

    // A função retorna um JSONB, que o Supabase converte em objeto JS
    return data;
  }
  async getDashboardData() {
    try {
      // Usando a função agregada para as estatísticas principais do dashboard
      const stats = await this.getAggregatedReport();

      // Buscar próximas sessões (lógica que não está na função agregada)
      const { data: proximasSessoes, error: sessoesError } = await supabase
        .from('sessoes')
        .select(`
          id,
          data_hora,
          status,
          duracao_minutos,
          paciente:pacientes(nome_completo)
        `)
        .gte('data_hora', new Date().toISOString())
        .order('data_hora', { ascending: true })
        .limit(5);

      if (sessoesError) throw sessoesError;

      // Simulação de alertas (manter por enquanto)
      const alertas = [
        { titulo: 'Risco de No-Show', mensagem: 'Paciente Maria S. tem alto risco de faltar na sessão de amanhã.', severidade: 'alta', acao: 'Enviar lembrete personalizado' },
        { titulo: 'Baixa Taxa de Conversão', mensagem: 'Apenas 10% dos leads de Janeiro se tornaram pacientes.', severidade: 'media', acao: 'Revisar estratégia de captação' },
      ];

      // Mapear dados para o formato esperado pelo Dashboard.jsx
      return {
        estatisticas: {
          total_pacientes: stats.active_patients,
          sessoes_hoje: stats.total_agendadas, // Simplificado, idealmente seria filtrado por data
          sessoes_semana: stats.total_agendadas, // Simplificado, idealmente seria filtrado por data
          sessoes_mes: stats.total_sessoes,
        },
        alertas: alertas,
        proximas_sessoes: proximasSessoes,
        sessoes_por_status: stats.status_data.map(d => ({ status: d.name, count: d.total })),
        sessoes_por_dia: [ // Manter simulação por falta de dados no RPC
          { dia: 'Seg', count: 20 },
          { dia: 'Ter', count: 30 },
          { dia: 'Qua', count: 40 },
          { dia: 'Qui', count: 35 },
          { dia: 'Sex', count: 25 },
        ]
      };
    } catch (error) {
      console.error('Erro ao buscar dados do dashboard:', error);
      throw error;
    }
  }

  async getRelatorioSessoes(filters = {}) {
    // Agora o relatório de sessões usa a função agregada para as estatísticas
    const stats = await this.getAggregatedReport(filters);
    
    // Para o relatório completo, ainda precisamos das sessões detalhadas
    const sessoesDetalhes = await this.getSessoes({
      data_inicio: filters.startDate,
      data_fim: filters.endDate,
      paciente_id: filters.paciente_id,
      status: filters.status
    });

    return {
      stats: stats,
      sessoes: sessoesDetalhes.sessoes
    };
  }

  async getRelatorioPacientes(filters = {}) {
    try {
      let query = supabase
        .from('pacientes')
        .select(`
          *,
          sessoes(count)
        `)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      return { pacientes: data };
    } catch (error) {
      console.error('Erro ao buscar relatório de pacientes:', error);
      throw error;
    }
  }

  // Exportação de Relatórios
  async exportRelatorio(format, filters = {}) {
    try {
      // Buscar dados das sessões com filtros
      const sessoesData = await this.getSessoes({
        data_inicio: filters.startDate,
        data_fim: filters.endDate,
        paciente_id: filters.paciente_id,
        status: filters.status
      });

      // Buscar estatísticas
      const statsData = await this.getAggregatedReport(filters);

      // Chamar a Edge Function de exportação
      const SUPABASE_URL = "https://upbsldljfejaieuveknr.supabase.co";
      const FUNCTION_NAME = "export-relatorio";
      const url = `${SUPABASE_URL}/functions/v1/${FUNCTION_NAME}`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${supabase.supabaseKey}`
        },
        body: JSON.stringify({
          format: format,
          filters: filters,
          stats: statsData
        })
      });

      if (!response.ok) {
        throw new Error(`Erro ao exportar relatório: ${response.status}`);
      }

      // Obter o arquivo como blob
      const blob = await response.blob();
      const url_download = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url_download;
      a.download = `relatorio_sessoes_${new Date().toISOString().split('T')[0]}.${format === 'csv' ? 'csv' : 'txt'}`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url_download);
      document.body.removeChild(a);

      return { message: 'Relatório exportado com sucesso' };
    } catch (error) {
      console.error('Erro ao exportar relatório:', error);
      // Fallback: exportar localmente
      return this.exportRelatorioLocal(format, filters);
    }
  }

  // Exportação local (fallback)
  exportRelatorioLocal(format, filters = {}) {
    try {
      const sessoesData = this.getSessoes({
        data_inicio: filters.startDate,
        data_fim: filters.endDate,
        paciente_id: filters.paciente_id,
        status: filters.status
      });

      let content = '';
      let filename = '';
      let mimeType = '';

      if (format === 'csv') {
        // Gerar CSV localmente
        content = this.generateCSV(sessoesData.sessoes);
        filename = `relatorio_sessoes_${new Date().toISOString().split('T')[0]}.csv`;
        mimeType = 'text/csv';
      } else if (format === 'pdf') {
        // Gerar PDF simulado (texto formatado)
        content = this.generatePDF(sessoesData.sessoes);
        filename = `relatorio_sessoes_${new Date().toISOString().split('T')[0]}.txt`;
        mimeType = 'text/plain';
      }

      const blob = new Blob([content], { type: mimeType });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      return { message: 'Relatório exportado com sucesso' };
    } catch (error) {
      console.error('Erro ao exportar relatório localmente:', error);
      throw error;
    }
  }

  // Gerar CSV
  generateCSV(sessoes) {
    if (!sessoes || sessoes.length === 0) {
      return 'ID,Data/Hora,Duração (min),Status,Tipo de Sessão,Paciente,Profissional,Observações';
    }

    const headers = ['ID', 'Data/Hora', 'Duração (min)', 'Status', 'Tipo de Sessão', 'Paciente', 'Profissional', 'Observações'];
    const rows = sessoes.map(s => [
      s.id,
      new Date(s.data_hora).toLocaleString('pt-BR'),
      s.duracao_minutos,
      s.status,
      s.tipo_sessao,
      s.paciente?.nome_completo || 'N/A',
      s.psicologo?.nome_completo || 'N/A',
      s.observacoes || ''
    ]);

    const csvContent = [
      headers.map(h => `"${h}"`).join(','),
      ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    return csvContent;
  }

  // Gerar PDF (simulado como texto formatado)
  generatePDF(sessoes) {
    let content = 'RELATÓRIO DE SESSÕES - RegiFlex\n';
    content += '================================\n\n';
    content += `Data de Geração: ${new Date().toLocaleString('pt-BR')}\n\n`;
    content += 'DETALHES DAS SESSÕES\n';
    content += '-------------------\n\n';

    if (!sessoes || sessoes.length === 0) {
      content += 'Nenhuma sessão encontrada com os filtros aplicados.';
    } else {
      sessoes.forEach((s, index) => {
        content += `Sessão ${index + 1}:\n`;
        content += `  ID: ${s.id}\n`;
        content += `  Data/Hora: ${new Date(s.data_hora).toLocaleString('pt-BR')}\n`;
        content += `  Duração: ${s.duracao_minutos} minutos\n`;
        content += `  Status: ${s.status}\n`;
        content += `  Tipo: ${s.tipo_sessao}\n`;
        content += `  Paciente: ${s.paciente?.nome_completo || 'N/A'}\n`;
        content += `  Profissional: ${s.psicologo?.nome_completo || 'N/A'}\n`;
        content += `  Observações: ${s.observacoes || 'N/A'}\n\n`;
      });
    }

    return content;
  }

  // IA - Placeholder (implementação futura)
  async getAlertasIA() {
    return { alertas: [] };
  }

  async getAnalisePaciente(pacienteId, dias = 30) {
    return { analise: null };
  }

  async getPadroesCancelamento(dias = 60) {
    return { padroes: [] };
  }

  // Usuários (apenas admin)
  async getUsuarios() {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .select('id, username, email, role, created_at')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { usuarios: data };
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      throw error;
    }
  }

  async createUsuario(usuarioData) {
    try {
      // Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: usuarioData.email,
        password: usuarioData.password
      });

      if (authError) throw authError;

      // Criar registro na tabela usuarios
      const { data, error } = await supabase
        .from('usuarios')
        .insert([{
          username: usuarioData.username,
          email: usuarioData.email,
          password_hash: 'managed_by_supabase_auth',
          role: usuarioData.role || 'psicologo'
        }])
        .select()
        .single();

      if (error) throw error;
      return { usuario: data, message: 'Usuário criado com sucesso' };
    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      throw error;
    }
  }

  async updateUsuario(id, usuarioData) {
    try {
      const { data, error } = await supabase
        .from('usuarios')
        .update(usuarioData)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return { usuario: data, message: 'Usuário atualizado com sucesso' };
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw error;
    }
  }

  async deleteUsuario(id) {
    try {
      const { error } = await supabase
        .from('usuarios')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return { message: 'Usuário excluído com sucesso' };
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw error;
    }
  }
}

export default new SupabaseApiService();
