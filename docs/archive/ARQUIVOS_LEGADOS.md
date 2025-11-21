# Arquivos Legados - RegiFlex

**Versão:** 2.0.0  
**Data:** Outubro de 2025

Este documento lista os arquivos e documentos que se referem à arquitetura antiga do RegiFlex (versão 1.0 com Flask e Docker) e que foram mantidos no repositório apenas para referência histórica.

---

## Documentos Desatualizados

Os seguintes documentos contêm informações sobre a arquitetura antiga e **não devem ser usados como referência** para a versão atual:

### Planos e Análises

- `docs/planos/RegiFlex_Plano_Arquitetural.md` - Descreve arquitetura Flask + Docker
- `docs/planos/PLANO_LOVABLE_SUPABASE.md` - Plano inicial de migração (substituído pela implementação real)

### Análises

- `docs/analises/ANALISE_MARKETING_PAGE.md` - Análise da página antes da atualização
- `docs/analises/ANALISE_REPOSITORIO.md` - Análise do repositório na versão Flask
- `docs/analises/COMPARACAO_SITE.md` - Comparação com tecnologias antigas
- `docs/analises/REFATORACAO_FORMULARIO.md` - Refatoração de formulários na versão Flask

### Relatórios

- `docs/relatorios/RELATORIO_CONFORMIDADE.md` - Conformidade da versão Flask
- `docs/relatorios/RELATORIO_CORRECOES.md` - Correções aplicadas na versão Flask

### Changelogs Antigos

- `docs/changelogs/CHANGELOG.md` - Changelog da versão 1.0
- `docs/changelogs/CHANGELOG_FIX.md` - Correções da versão 1.0

### Correções

- `CORRECOES_APLICADAS.md` - Correções na versão Flask
- `CORRECOES_CRITICAS_COMPLETAS.md` - Correções críticas na versão Flask

---

## Pasta Backend (Legada)

A pasta `backend/` contém todo o código do servidor Flask que foi substituído pelo Supabase:

```
backend/
├── app/
│   ├── api/
│   ├── models/
│   ├── services/
│   └── utils/
├── tests/
├── requirements.txt
└── ...
```

**Status:** Mantida apenas para referência histórica. **Não é mais utilizada** na versão 2.0.

---

## Arquivos Docker (Legados)

Os seguintes arquivos Docker não são mais necessários:

- `Dockerfile.backend` - Dockerfile do servidor Flask
- `Dockerfile.frontend` - Dockerfile do frontend (substituído por deploy direto)
- `docker-compose.yml` - Orquestração de containers (não mais necessário)

**Status:** Mantidos apenas para referência. A nova arquitetura não utiliza Docker.

---

## Documentos Atualizados

Os seguintes documentos foram **atualizados** para refletir a nova arquitetura Supabase:

### Principais

✅ `README.md` - Documentação principal do projeto  
✅ `CHANGELOG.md` - Histórico de versões atualizado  
✅ `ANALISE_COERENCIA_PROJETO.md` - Análise pós-migração  
✅ `COMMIT_INSTRUCTIONS.md` - Instruções de commit atualizadas  

### Tutoriais

✅ `docs/tutoriais/RegiFlex_Tutorial_Completo_Windows.md` - Tutorial de instalação atualizado

### Planos

✅ `docs/planos/INTEGRACOES_WIX_NOTION.md` - Documentação de integrações

---

## Recomendações

### Para Novos Desenvolvedores

Se você está começando a trabalhar no RegiFlex, **ignore os arquivos legados** e foque nos documentos atualizados:

1. Leia o `README.md` atualizado
2. Siga o tutorial em `docs/tutoriais/RegiFlex_Tutorial_Completo_Windows.md`
3. Consulte a documentação no Notion: https://www.notion.so/286550a8829e81d689e8f173302aeafb
4. Revise o `CHANGELOG.md` para entender as mudanças

### Para Manutenção do Repositório

Considere as seguintes ações futuras:

**Opção 1: Arquivar**
- Mover arquivos legados para uma pasta `archive/` ou `legacy/`
- Manter no repositório para referência histórica

**Opção 2: Remover**
- Deletar arquivos legados do repositório
- Manter histórico no Git para consulta se necessário

**Opção 3: Branch Separada**
- Criar uma branch `v1.0-flask` com a versão antiga
- Manter apenas arquivos da v2.0 na branch `main`

---

## Migração de Conhecimento

Se você precisa consultar informações da versão antiga:

### Arquitetura Flask

- Consulte commits anteriores à migração
- Use `git log` para encontrar a versão 1.0
- Checkout em commit específico: `git checkout <hash-do-commit>`

### Comparação de Versões

| Aspecto | v1.0 (Flask) | v2.0 (Supabase) |
|---------|--------------|-----------------|
| Backend | Flask + PostgreSQL | Supabase |
| Deploy | Docker | Serverless |
| Autenticação | JWT customizado | Supabase Auth |
| API | Endpoints manuais | RESTful automática |
| Escalabilidade | Manual | Automática |

---

## Conclusão

A versão 2.0 do RegiFlex representa uma evolução significativa do projeto. Os arquivos legados são mantidos apenas para referência histórica e não devem ser usados como base para desenvolvimento.

Para qualquer dúvida sobre a nova arquitetura, consulte a documentação atualizada ou entre em contato com a equipe de desenvolvimento.

---

**Documento criado por:** Equipe RegiFlex  
**Versão:** 1.0  
**Data:** Outubro de 2025
