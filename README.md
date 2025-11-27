# RegiFlex Odontologia Module

Este repositório contém o **Módulo de Odontologia** da plataforma RegiFlex. Ele é um módulo de extensão que se integra ao \`RegiFlex-Core\` para fornecer funcionalidades específicas para clínicas e profissionais de odontologia.

## Funcionalidades Principais

- Prontuário Odontológico
- Odontograma Interativo
- Gerenciamento de Procedimentos
- Integração com IA para Análise de Imagens Clínicas

## Estrutura do Projeto

- \`frontend/src/modules/odontologia\`: Contém o código específico do módulo (React/Vite), incluindo componentes e lógica de negócios.

## Como Usar

Este módulo deve ser integrado ao \`RegiFlex-Core\` para funcionar corretamente.

1.  **Instalação (no Core):**
    \`\`\`bash
    # Exemplo de como o Core pode integrar este módulo
    # git submodule add https://github.com/artur-source/regiflex-odontologia frontend/src/modules/odontologia
    \`\`\`
2.  **Desenvolvimento (Standalone):**
    \`\`\`bash
    pnpm install
    pnpm run dev
    \`\`\`
