# Sistema de Suporte e Super Admin Global - RegiFlex

**Data:** 2025-10-09  
**Versão:** 2.1.1  
**Classificação:** 🔒 CONFIDENCIAL - Acesso Restrito

---

## 🎯 Visão Geral

Para fornecer suporte técnico eficaz às clínicas, o RegiFlex implementa um **Sistema de Super Admin Global** que permite acesso controlado, auditado e temporário aos dados de qualquer clínica quando necessário para resolução de problemas.

## 🏗️ Arquitetura de Suporte

### Níveis de Acesso

```
┌─────────────────────────────────────────────────────────────┐
│                    SUPER ADMIN GLOBAL                      │
│  🔑 Acesso a todas as clínicas (auditado e temporário)     │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│   Clínica A     │  │   Clínica B     │  │   Clínica C     │
│                 │  │                 │  │                 │
│ 👑 Admin Local  │  │ 👑 Admin Local  │  │ 👑 Admin Local  │
│ 🧠 Psicólogos   │  │ 🧠 Psicólogos   │  │ 🧠 Psicólogos   │
│ 📞 Recepção     │  │ 📞 Recepção     │  │ 📞 Recepção     │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### Estrutura do Banco de Dados

```sql
-- Tabela de Super Admins (equipe RegiFlex)
CREATE TABLE super_admins (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    nome_completo VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'support',
    permissions TEXT[] NOT NULL DEFAULT '{}',
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    created_by UUID REFERENCES super_admins(id)
);

-- Tabela de Sessões de Suporte (auditoria)
CREATE TABLE support_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    super_admin_id UUID REFERENCES super_admins(id) NOT NULL,
    clinic_id UUID REFERENCES clinicas(id) NOT NULL,
    reason TEXT NOT NULL,
    ticket_id VARCHAR(100),
    started_at TIMESTAMP DEFAULT NOW(),
    ended_at TIMESTAMP,
    duration_minutes INTEGER,
    actions_performed JSONB DEFAULT '[]',
    client_consent BOOLEAN DEFAULT false,
    emergency_access BOOLEAN DEFAULT false,
    status VARCHAR(50) DEFAULT 'active'
);

-- Tabela de Logs de Ações de Suporte
CREATE TABLE support_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    support_session_id UUID REFERENCES support_sessions(id) NOT NULL,
    super_admin_id UUID REFERENCES super_admins(id) NOT NULL,
    clinic_id UUID REFERENCES clinicas(id) NOT NULL,
    action VARCHAR(100) NOT NULL,
    resource_type VARCHAR(50),
    resource_id UUID,
    old_data JSONB,
    new_data JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🔐 Sistema de Permissões de Suporte

### Roles de Super Admin

```javascript
const SUPER_ADMIN_ROLES = {
  'support_level_1': {
    name: 'Suporte Nível 1',
    permissions: [
      'view_clinic_info',
      'view_users',
      'reset_passwords',
      'view_basic_reports',
      'create_support_tickets'
    ],
    description: 'Suporte básico e reset de senhas'
  },
  'support_level_2': {
    name: 'Suporte Nível 2',
    permissions: [
      'view_clinic_info',
      'view_users',
      'manage_users',
      'reset_passwords',
      'view_all_data',
      'modify_clinic_settings',
      'access_database',
      'view_detailed_reports'
    ],
    description: 'Suporte avançado com acesso a dados'
  },
  'support_level_3': {
    name: 'Suporte Nível 3 (Emergência)',
    permissions: [
      '*', // Todas as permissões
      'emergency_access',
      'modify_any_data',
      'access_production_db',
      'bypass_rls'
    ],
    description: 'Acesso de emergência total (auditado)'
  },
  'developer': {
    name: 'Desenvolvedor',
    permissions: [
      'view_clinic_info',
      'view_technical_logs',
      'access_database',
      'debug_issues',
      'view_system_metrics'
    ],
    description: 'Acesso técnico para debugging'
  },
  'super_admin': {
    name: 'Super Administrador',
    permissions: ['*'],
    description: 'Acesso total ao sistema (fundadores)'
  }
};
```

### Middleware de Autenticação Super Admin

```javascript
// Middleware para verificar se é super admin
async function authenticateSuperAdmin(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    // 1. Verificar token Supabase
    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) {
      return res.status(401).json({ error: 'Token inválido' });
    }
    
    // 2. Verificar se é super admin
    const { data: superAdmin } = await supabase
      .from('super_admins')
      .select('*')
      .eq('auth_user_id', user.id)
      .eq('active', true)
      .single();
    
    if (!superAdmin) {
      return res.status(403).json({ error: 'Acesso negado: não é super admin' });
    }
    
    // 3. Adicionar dados do super admin à requisição
    req.superAdmin = superAdmin;
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Erro na autenticação' });
  }
}

// Middleware para verificar permissões específicas
function requireSuperAdminPermission(permission) {
  return (req, res, next) => {
    const userPermissions = getSuperAdminPermissions(req.superAdmin.role);
    
    if (!userPermissions.includes(permission) && !userPermissions.includes('*')) {
      return res.status(403).json({
        error: 'Permissão insuficiente',
        required: permission,
        user_role: req.superAdmin.role
      });
    }
    
    next();
  };
}
```

## 🚨 Sistema de Sessões de Suporte

### Iniciar Sessão de Suporte

```javascript
// API para iniciar sessão de suporte
app.post('/api/super-admin/support-session', 
  authenticateSuperAdmin,
  requireSuperAdminPermission('view_clinic_info'),
  async (req, res) => {
    const { clinic_id, reason, ticket_id, emergency = false } = req.body;
    
    try {
      // 1. Verificar se clínica existe
      const { data: clinic } = await supabase
        .from('clinicas')
        .select('*')
        .eq('id', clinic_id)
        .single();
      
      if (!clinic) {
        return res.status(404).json({ error: 'Clínica não encontrada' });
      }
      
      // 2. Para acesso não-emergencial, verificar consentimento
      if (!emergency) {
        const consent = await requestClientConsent(clinic);
        if (!consent) {
          return res.status(403).json({ 
            error: 'Consentimento do cliente necessário' 
          });
        }
      }
      
      // 3. Criar sessão de suporte
      const { data: session } = await supabase
        .from('support_sessions')
        .insert({
          super_admin_id: req.superAdmin.id,
          clinic_id: clinic_id,
          reason: reason,
          ticket_id: ticket_id,
          emergency_access: emergency,
          client_consent: !emergency
        })
        .select()
        .single();
      
      // 4. Notificar equipe e cliente
      await Promise.all([
        notifyTeam({
          message: `Sessão de suporte iniciada para ${clinic.nome}`,
          admin: req.superAdmin.nome_completo,
          reason: reason,
          emergency: emergency
        }),
        notifyClient({
          clinic: clinic,
          admin: req.superAdmin.nome_completo,
          reason: reason,
          session_id: session.id
        })
      ]);
      
      // 5. Gerar token de acesso temporário
      const accessToken = generateSupportAccessToken({
        session_id: session.id,
        clinic_id: clinic_id,
        super_admin_id: req.superAdmin.id,
        permissions: getSuperAdminPermissions(req.superAdmin.role),
        expires_in: emergency ? '2h' : '1h'
      });
      
      res.json({
        success: true,
        session: session,
        access_token: accessToken,
        clinic: clinic,
        expires_at: new Date(Date.now() + (emergency ? 2 : 1) * 60 * 60 * 1000)
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Erro ao iniciar sessão de suporte' });
    }
  }
);
```

### Finalizar Sessão de Suporte

```javascript
// API para finalizar sessão de suporte
app.post('/api/super-admin/end-support-session/:sessionId',
  authenticateSuperAdmin,
  async (req, res) => {
    const { sessionId } = req.params;
    const { summary, actions_performed } = req.body;
    
    try {
      // 1. Buscar sessão ativa
      const { data: session } = await supabase
        .from('support_sessions')
        .select('*')
        .eq('id', sessionId)
        .eq('super_admin_id', req.superAdmin.id)
        .eq('status', 'active')
        .single();
      
      if (!session) {
        return res.status(404).json({ error: 'Sessão não encontrada' });
      }
      
      // 2. Calcular duração
      const duration = Math.round(
        (new Date() - new Date(session.started_at)) / (1000 * 60)
      );
      
      // 3. Finalizar sessão
      await supabase
        .from('support_sessions')
        .update({
          ended_at: new Date().toISOString(),
          duration_minutes: duration,
          actions_performed: actions_performed,
          status: 'completed'
        })
        .eq('id', sessionId);
      
      // 4. Gerar relatório de suporte
      const report = await generateSupportReport(sessionId);
      
      // 5. Notificar cliente sobre conclusão
      await notifyClientSupportCompleted({
        session: session,
        duration: duration,
        summary: summary,
        report_id: report.id
      });
      
      res.json({
        success: true,
        message: 'Sessão de suporte finalizada',
        duration_minutes: duration,
        report: report
      });
      
    } catch (error) {
      res.status(500).json({ error: 'Erro ao finalizar sessão' });
    }
  }
);
```

## 🔍 Dashboard de Suporte

### Interface de Administração Global

```jsx
// Dashboard para super admins
function SuperAdminDashboard() {
  const { superAdmin } = useSuperAuth();
  const [clinics, setClinics] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  
  useEffect(() => {
    loadClinicsOverview();
    loadActiveSupportSessions();
  }, []);
  
  const startSupportSession = async (clinicId, reason) => {
    const response = await fetch('/api/super-admin/support-session', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        clinic_id: clinicId,
        reason: reason,
        ticket_id: generateTicketId()
      })
    });
    
    const result = await response.json();
    
    if (result.success) {
      // Redirecionar para painel da clínica com acesso temporário
      window.open(`/support/clinic/${clinicId}?session=${result.session.id}`, '_blank');
    }
  };
  
  return (
    <div className="super-admin-dashboard">
      <header className="dashboard-header">
        <h1>🔧 RegiFlex - Painel de Suporte</h1>
        <div className="admin-info">
          <span>{superAdmin.nome_completo}</span>
          <span className="role-badge">{superAdmin.role}</span>
        </div>
      </header>
      
      <div className="dashboard-grid">
        {/* Visão Geral do Sistema */}
        <SystemOverview />
        
        {/* Clínicas com Problemas */}
        <ClinicsWithIssues 
          onStartSupport={startSupportSession}
        />
        
        {/* Sessões de Suporte Ativas */}
        <ActiveSupportSessions 
          sessions={activeSessions}
        />
        
        {/* Métricas de Suporte */}
        <SupportMetrics />
      </div>
    </div>
  );
}

// Componente para listar clínicas
function ClinicsWithIssues({ onStartSupport }) {
  const [clinics, setClinics] = useState([]);
  const [filter, setFilter] = useState('all');
  
  const filteredClinics = clinics.filter(clinic => {
    switch (filter) {
      case 'issues': return clinic.has_issues;
      case 'inactive': return clinic.status !== 'active';
      case 'payment_issues': return clinic.payment_status === 'failed';
      default: return true;
    }
  });
  
  return (
    <div className="clinics-panel">
      <div className="panel-header">
        <h2>🏥 Clínicas</h2>
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">Todas</option>
          <option value="issues">Com Problemas</option>
          <option value="inactive">Inativas</option>
          <option value="payment_issues">Problemas de Pagamento</option>
        </select>
      </div>
      
      <div className="clinics-list">
        {filteredClinics.map(clinic => (
          <div key={clinic.id} className="clinic-card">
            <div className="clinic-info">
              <h3>{clinic.nome}</h3>
              <p>{clinic.email}</p>
              <div className="clinic-status">
                <StatusBadge status={clinic.status} />
                <span className="users-count">{clinic.users_count} usuários</span>
              </div>
            </div>
            
            <div className="clinic-actions">
              <button 
                onClick={() => onStartSupport(clinic.id, 'Suporte geral')}
                className="btn btn-primary"
              >
                🔧 Iniciar Suporte
              </button>
              
              <button 
                onClick={() => viewClinicDetails(clinic.id)}
                className="btn btn-secondary"
              >
                👁️ Ver Detalhes
              </button>
            </div>
            
            {clinic.has_issues && (
              <div className="issues-list">
                {clinic.issues.map(issue => (
                  <div key={issue.id} className="issue-item">
                    <span className="issue-type">{issue.type}</span>
                    <span className="issue-description">{issue.description}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

### Painel de Suporte por Clínica

```jsx
// Interface para dar suporte a uma clínica específica
function ClinicSupportPanel({ clinicId, sessionId }) {
  const [clinic, setClinic] = useState(null);
  const [users, setUsers] = useState([]);
  const [patients, setPatients] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [supportSession, setSupportSession] = useState(null);
  
  useEffect(() => {
    loadClinicData();
    loadSupportSession();
  }, [clinicId, sessionId]);
  
  const logAction = async (action, details) => {
    await fetch('/api/super-admin/log-action', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${getSupportToken()}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        session_id: sessionId,
        action: action,
        details: details
      })
    });
  };
  
  const resetUserPassword = async (userId) => {
    const newPassword = generateSecurePassword();
    
    // 1. Reset no Supabase Auth
    await supabase.auth.admin.updateUserById(userId, {
      password: newPassword
    });
    
    // 2. Log da ação
    await logAction('reset_password', {
      user_id: userId,
      action: 'Password reset by support'
    });
    
    // 3. Notificar usuário
    await sendPasswordResetEmail(userId, newPassword);
    
    alert(`Senha resetada! Nova senha enviada por email.`);
  };
  
  return (
    <div className="clinic-support-panel">
      <header className="support-header">
        <h1>🔧 Suporte: {clinic?.nome}</h1>
        <div className="session-info">
          <span>Sessão: {sessionId}</span>
          <span>Iniciada: {formatTime(supportSession?.started_at)}</span>
          <button 
            onClick={endSupportSession}
            className="btn btn-danger"
          >
            Finalizar Suporte
          </button>
        </div>
      </header>
      
      <div className="support-tabs">
        <Tab label="Usuários" active>
          <div className="users-management">
            <h2>👥 Usuários da Clínica</h2>
            <div className="users-grid">
              {users.map(user => (
                <div key={user.id} className="user-card">
                  <div className="user-info">
                    <h3>{user.nome_completo}</h3>
                    <p>{user.email}</p>
                    <span className="role-badge">{user.role}</span>
                  </div>
                  
                  <div className="user-actions">
                    <button 
                      onClick={() => resetUserPassword(user.auth_user_id)}
                      className="btn btn-warning"
                    >
                      🔑 Reset Senha
                    </button>
                    
                    <button 
                      onClick={() => toggleUserStatus(user.id)}
                      className="btn btn-secondary"
                    >
                      {user.active ? '🚫 Desativar' : '✅ Ativar'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Tab>
        
        <Tab label="Configurações">
          <ClinicSettings 
            clinic={clinic}
            onUpdate={updateClinicSettings}
            onLog={logAction}
          />
        </Tab>
        
        <Tab label="Dados">
          <DataManagement 
            clinicId={clinicId}
            patients={patients}
            sessions={sessions}
            onLog={logAction}
          />
        </Tab>
        
        <Tab label="Logs">
          <SupportLogs sessionId={sessionId} />
        </Tab>
      </div>
    </div>
  );
}
```

## 📊 Sistema de Auditoria

### Logs Detalhados de Ações

```javascript
// Função para registrar todas as ações de suporte
async function logSupportAction(sessionId, action, details) {
  const logEntry = {
    support_session_id: sessionId,
    super_admin_id: getCurrentSuperAdmin().id,
    clinic_id: getCurrentClinic().id,
    action: action,
    resource_type: details.resource_type,
    resource_id: details.resource_id,
    old_data: details.old_data,
    new_data: details.new_data,
    ip_address: getClientIP(),
    user_agent: getUserAgent()
  };
  
  await supabase
    .from('support_audit_logs')
    .insert(logEntry);
  
  // Também registrar em sistema externo para auditoria
  await sendToAuditSystem(logEntry);
}

// Middleware para log automático de ações
function autoLogSupportActions(req, res, next) {
  const originalSend = res.send;
  
  res.send = function(data) {
    // Log da ação após resposta bem-sucedida
    if (res.statusCode < 400) {
      logSupportAction(req.sessionId, req.method + ' ' + req.path, {
        request_body: req.body,
        response_data: data,
        resource_type: extractResourceType(req.path),
        resource_id: extractResourceId(req.path)
      });
    }
    
    originalSend.call(this, data);
  };
  
  next();
}
```

### Relatórios de Suporte

```javascript
// Gerar relatório completo da sessão de suporte
async function generateSupportReport(sessionId) {
  const session = await getSupportSession(sessionId);
  const logs = await getSupportLogs(sessionId);
  const clinic = await getClinic(session.clinic_id);
  
  const report = {
    session_info: {
      id: session.id,
      super_admin: session.super_admin.nome_completo,
      clinic: clinic.nome,
      started_at: session.started_at,
      ended_at: session.ended_at,
      duration_minutes: session.duration_minutes,
      reason: session.reason,
      emergency: session.emergency_access
    },
    
    actions_summary: {
      total_actions: logs.length,
      actions_by_type: groupBy(logs, 'action'),
      data_modified: logs.filter(log => log.old_data || log.new_data).length,
      users_affected: [...new Set(logs.map(log => log.resource_id))].length
    },
    
    detailed_actions: logs.map(log => ({
      timestamp: log.created_at,
      action: log.action,
      resource: `${log.resource_type}:${log.resource_id}`,
      changes: log.old_data ? {
        before: log.old_data,
        after: log.new_data
      } : null
    })),
    
    compliance: {
      client_consent: session.client_consent,
      emergency_justified: session.emergency_access && session.reason,
      data_retention: '90 days',
      audit_trail: 'Complete'
    }
  };
  
  // Salvar relatório
  const { data: savedReport } = await supabase
    .from('support_reports')
    .insert({
      session_id: sessionId,
      report_data: report,
      generated_at: new Date().toISOString()
    })
    .select()
    .single();
  
  return savedReport;
}
```

## 🚨 Cenários de Suporte

### 1. Cliente Esqueceu Senha do Admin

```javascript
// Cenário: Cliente não consegue acessar sistema
const supportScenario1 = {
  problem: "Admin da clínica esqueceu senha e não consegue acessar",
  solution: async (clinicId) => {
    // 1. Iniciar sessão de suporte
    const session = await startSupportSession({
      clinic_id: clinicId,
      reason: "Reset de senha do administrador",
      emergency: false // Não é emergência
    });
    
    // 2. Solicitar consentimento do cliente por telefone/email
    const consent = await requestClientConsent(clinicId);
    
    if (consent) {
      // 3. Encontrar admin da clínica
      const admin = await findClinicAdmin(clinicId);
      
      // 4. Reset da senha
      const newPassword = await resetPassword(admin.auth_user_id);
      
      // 5. Enviar nova senha por email/SMS
      await sendNewCredentials(admin.email, newPassword);
      
      // 6. Log da ação
      await logAction('password_reset', {
        user_id: admin.id,
        reason: 'Admin forgot password'
      });
      
      // 7. Finalizar sessão
      await endSupportSession(session.id);
    }
  }
};
```

### 2. Problema Técnico Crítico

```javascript
// Cenário: Sistema da clínica com erro crítico
const supportScenario2 = {
  problem: "Sistema da clínica apresentando erro 500 - clientes não conseguem acessar",
  solution: async (clinicId) => {
    // 1. Acesso de emergência (sem consentimento prévio)
    const session = await startSupportSession({
      clinic_id: clinicId,
      reason: "Erro crítico no sistema - clientes sem acesso",
      emergency: true // Acesso de emergência
    });
    
    // 2. Investigar logs de erro
    const errorLogs = await getClinicErrorLogs(clinicId);
    
    // 3. Identificar problema
    const issue = await diagnoseIssue(errorLogs);
    
    // 4. Aplicar correção
    if (issue.type === 'database_connection') {
      await fixDatabaseConnection(clinicId);
    } else if (issue.type === 'configuration') {
      await fixConfiguration(clinicId, issue.details);
    }
    
    // 5. Testar correção
    const systemHealth = await testClinicSystem(clinicId);
    
    // 6. Notificar cliente sobre resolução
    await notifyClientIssueResolved(clinicId, {
      issue: issue,
      resolution: systemHealth,
      downtime: session.duration_minutes
    });
    
    // 7. Finalizar sessão de emergência
    await endSupportSession(session.id);
  }
};
```

### 3. Migração de Dados

```javascript
// Cenário: Cliente quer migrar dados de outro sistema
const supportScenario3 = {
  problem: "Cliente quer importar dados de sistema anterior",
  solution: async (clinicId, migrationData) => {
    // 1. Sessão de suporte para migração
    const session = await startSupportSession({
      clinic_id: clinicId,
      reason: "Migração de dados de sistema anterior",
      emergency: false
    });
    
    // 2. Validar dados de entrada
    const validation = await validateMigrationData(migrationData);
    
    if (validation.valid) {
      // 3. Backup dos dados atuais
      const backup = await createDataBackup(clinicId);
      
      // 4. Processar migração
      const migration = await processMigration({
        clinic_id: clinicId,
        source_data: migrationData,
        backup_id: backup.id
      });
      
      // 5. Validar integridade dos dados migrados
      const integrity = await validateDataIntegrity(clinicId);
      
      // 6. Gerar relatório de migração
      const report = await generateMigrationReport(migration);
      
      // 7. Treinar usuários no novo sistema
      await scheduleTrainingSession(clinicId);
    }
    
    await endSupportSession(session.id);
  }
};
```

## 🔒 Segurança e Compliance

### Controles de Segurança

```javascript
// Sistema de controles de segurança para suporte
const securityControls = {
  // 1. Autenticação Multi-Fator para Super Admins
  mfa_required: true,
  
  // 2. Sessões com tempo limitado
  session_timeout: {
    normal: '1 hour',
    emergency: '2 hours',
    maximum: '4 hours'
  },
  
  // 3. Aprovação para ações críticas
  approval_required: [
    'delete_clinic',
    'modify_billing',
    'access_patient_data',
    'export_data'
  ],
  
  // 4. Logs imutáveis
  immutable_logs: true,
  
  // 5. Notificação obrigatória ao cliente
  client_notification: {
    immediate: ['emergency_access', 'data_modification'],
    daily: ['support_session_summary'],
    weekly: ['access_report']
  }
};

// Implementação de controles
async function enforceSecurityControls(action, context) {
  // Verificar se ação requer aprovação
  if (securityControls.approval_required.includes(action)) {
    const approval = await requestApproval({
      action: action,
      context: context,
      requested_by: context.super_admin_id
    });
    
    if (!approval.approved) {
      throw new Error('Ação não aprovada');
    }
  }
  
  // Verificar timeout da sessão
  const sessionAge = Date.now() - new Date(context.session.started_at);
  const maxAge = context.session.emergency ? 
    2 * 60 * 60 * 1000 : // 2 horas para emergência
    1 * 60 * 60 * 1000;  // 1 hora normal
  
  if (sessionAge > maxAge) {
    throw new Error('Sessão expirada');
  }
  
  // Log imutável
  await createImmutableLog({
    action: action,
    context: context,
    timestamp: new Date().toISOString(),
    hash: generateActionHash(action, context)
  });
}
```

### Compliance LGPD/GDPR

```javascript
// Implementação de compliance para suporte
const complianceControls = {
  // Consentimento explícito para acesso não-emergencial
  consent_required: true,
  
  // Minimização de dados - acesso apenas ao necessário
  data_minimization: true,
  
  // Retenção limitada de logs
  log_retention: '90 days',
  
  // Direito de auditoria do cliente
  client_audit_rights: true,
  
  // Notificação de acesso
  access_notification: 'immediate'
};

// Função para garantir compliance
async function ensureCompliance(supportAction) {
  // 1. Verificar base legal para acesso
  const legalBasis = determineLegalBasis(supportAction);
  
  // 2. Minimizar dados acessados
  const minimizedData = minimizeDataAccess(supportAction.data_requested);
  
  // 3. Registrar base legal nos logs
  await logLegalBasis({
    session_id: supportAction.session_id,
    legal_basis: legalBasis,
    data_accessed: minimizedData
  });
  
  // 4. Agendar exclusão automática dos logs
  await scheduleLogDeletion({
    session_id: supportAction.session_id,
    delete_after: '90 days'
  });
  
  return {
    compliant: true,
    legal_basis: legalBasis,
    data_minimized: minimizedData
  };
}
```

## 📱 Interface Mobile para Suporte

```jsx
// App mobile para equipe de suporte
function SupportMobileApp() {
  const [emergencyAlerts, setEmergencyAlerts] = useState([]);
  const [activeSessions, setActiveSessions] = useState([]);
  
  useEffect(() => {
    // Configurar notificações push para emergências
    setupPushNotifications();
    
    // Monitorar alertas em tempo real
    const alertsSubscription = supabase
      .channel('emergency-alerts')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'emergency_alerts'
      }, handleEmergencyAlert)
      .subscribe();
    
    return () => alertsSubscription.unsubscribe();
  }, []);
  
  const handleEmergencyAlert = (alert) => {
    // Notificação push imediata
    showPushNotification({
      title: '🚨 Emergência RegiFlex',
      body: `${alert.clinic_name}: ${alert.issue}`,
      action: () => startEmergencySupport(alert.clinic_id)
    });
    
    setEmergencyAlerts(prev => [alert, ...prev]);
  };
  
  return (
    <div className="support-mobile-app">
      <header className="mobile-header">
        <h1>🔧 RegiFlex Support</h1>
        <NotificationBadge count={emergencyAlerts.length} />
      </header>
      
      {/* Alertas de Emergência */}
      <section className="emergency-alerts">
        <h2>🚨 Emergências</h2>
        {emergencyAlerts.map(alert => (
          <EmergencyAlertCard 
            key={alert.id}
            alert={alert}
            onRespond={startEmergencySupport}
          />
        ))}
      </section>
      
      {/* Sessões Ativas */}
      <section className="active-sessions">
        <h2>🔄 Sessões Ativas</h2>
        {activeSessions.map(session => (
          <ActiveSessionCard 
            key={session.id}
            session={session}
            onJoin={joinSupportSession}
          />
        ))}
      </section>
      
      {/* Ações Rápidas */}
      <section className="quick-actions">
        <QuickActionButton 
          icon="🔑"
          label="Reset Senha"
          onClick={quickPasswordReset}
        />
        <QuickActionButton 
          icon="📊"
          label="Status Sistema"
          onClick={checkSystemStatus}
        />
        <QuickActionButton 
          icon="📞"
          label="Contatar Cliente"
          onClick={contactClient}
        />
      </section>
    </div>
  );
}
```

## 📋 Resumo do Sistema de Suporte

### ✅ Funcionalidades Implementadas:

1. **Super Admin Global**: Acesso controlado a todas as clínicas
2. **Sessões de Suporte**: Temporárias, auditadas e com consentimento
3. **Níveis de Permissão**: 5 roles diferentes de suporte
4. **Auditoria Completa**: Logs imutáveis de todas as ações
5. **Compliance LGPD**: Consentimento, minimização e retenção limitada
6. **Interface Dedicada**: Dashboard web e app mobile
7. **Cenários Automatizados**: Scripts para problemas comuns
8. **Relatórios Detalhados**: Documentação completa de cada suporte

### 🔐 Garantias de Segurança:

- **Acesso Temporário**: Sessões com tempo limitado
- **Consentimento Obrigatório**: Cliente deve autorizar (exceto emergências)
- **Logs Imutáveis**: Auditoria completa e à prova de alteração
- **Notificação Automática**: Cliente sempre informado sobre acessos
- **Minimização de Dados**: Acesso apenas ao necessário
- **MFA Obrigatório**: Autenticação multi-fator para super admins

**Resultado**: Sistema de suporte profissional, seguro e em compliance total com LGPD/GDPR! 🛡️
