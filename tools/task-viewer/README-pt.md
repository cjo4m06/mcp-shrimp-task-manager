# 🦐 Visualizador do Gerenciador de Tarefas Shrimp

Uma interface web moderna baseada em React para visualizar e gerenciar tarefas do [Gerenciador de Tarefas Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) criadas através da ferramenta MCP (Protocolo de Contexto do Modelo). Esta interface visual permite ver informações detalhadas de tarefas, rastrear progresso em múltiplos projetos e copiar facilmente UUIDs de tarefas para interações com agentes de IA.

## Por que usar o Visualizador de Tarefas Shrimp?

Ao usar o Gerenciador de Tarefas Shrimp como servidor MCP com agentes de IA como Claude, este visualizador fornece visibilidade essencial em seu ecossistema de tarefas:

- **Visão Geral Visual das Tarefas**: Veja todas as tarefas, seus status, dependências e progresso em uma interface de abas limpa
- **Gerenciamento de UUID**: Clique em qualquer badge de tarefa para copiar instantaneamente seu UUID para comandos como `"Use o gerenciador de tarefas para completar esta tarefa shrimp: [UUID]"`
- **Execução Paralela**: Abra múltiplos terminais e use a coluna de Ações de IA (🤖) para copiar instruções de tarefas para execução paralela de agentes de IA
- **Atualizações em Tempo Real**: A leitura direta de caminhos de arquivos garante que você sempre veja o estado atual das tarefas
- **Suporte Multi-Projeto**: Gerencie tarefas entre diferentes projetos com abas de perfil arrastáveis

Para informações sobre configurar o Gerenciador de Tarefas Shrimp como servidor MCP, veja o [repositório principal](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Documentação Detalhada da Página

### 📋 Página de Tarefas

A página principal de Tarefas é seu centro de comando para gerenciamento de tarefas. Ela fornece uma visão abrangente de todas as tarefas no perfil selecionado com recursos poderosos para organização e execução.

![Visão Geral da Página de Tarefas](task-viewer-interface.png)

**Recursos Principais:**
- **Tabela de Tarefas**: Exibe todas as tarefas com colunas classificáveis incluindo Tarefa #, Status, Agente, Data de Criação, Nome, Dependências e Ações
- **Badges de Status**: Badges codificados por cor (🟡 Pendente, 🔵 Em Progresso, 🟢 Concluído, 🔴 Bloqueado)
- **Atribuição de Agente**: Seletor dropdown para atribuir agentes de IA específicos às tarefas
- **Popup do Visualizador de Agentes**: Clique no ícone do olho (👁️) para abrir um popup onde pode navegar e selecionar agentes
- **Coluna de Dependências**: Mostra IDs de tarefas vinculadas com funcionalidade de navegação por clique
- **Coluna de Ações**: Contém o poderoso emoji robô (🤖) para execução de tarefas de IA
- **Navegação de Detalhes da Tarefa**: Ao visualizar detalhes da tarefa, use os botões ← Anterior e Próximo → para navegar rapidamente entre tarefas

#### 🤖 Emoji Robô - Execução de Tarefas de IA

O emoji robô na coluna Ações é um recurso poderoso para execução de tarefas assistida por IA:

![Tooltip do Emoji Robô](releases/agent-copy-instruction-tooltip.png)

**Como funciona:**
1. **Clique no emoji 🤖** para copiar uma instrução de execução de tarefa para sua área de transferência
2. **Para tarefas com agentes**: Copia `use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
3. **Para tarefas sem agentes**: Copia `Use task manager to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
4. **Feedback Visual**: O emoji muda brevemente para ✓ para confirmar a ação de cópia

**Casos de Uso:**
- **Execução Paralela**: Abra múltiplas janelas de terminal com diferentes agentes de IA e cole instruções para processamento simultâneo de tarefas
- **Especialização de Agentes**: Atribua agentes especializados (ex.: `react-components.md`, `database-specialist.md`) às tarefas apropriadas
- **Transferência Rápida**: Delegue rapidamente tarefas aos agentes de IA sem digitar comandos complexos

#### 🤖 Atribuição de Agentes em Massa com IA

A página de Tarefas agora inclui atribuição de agentes em massa com IA usando GPT-4 da OpenAI:

**Como usar:**
1. **Selecionar Tarefas**: Use as caixas de seleção para selecionar múltiplas tarefas que precisam de atribuição de agente
2. **Barra de Ações em Massa**: Uma barra azul aparece mostrando "🤖 Atribuir Agentes com IA (X tarefas selecionadas)"
3. **Atribuição com Um Clique**: Clique no botão para que o GPT-4 analise tarefas e atribua agentes apropriados
4. **Correspondência Automática**: A IA considera descrições de tarefas, dependências e capacidades de agentes

**Requisitos de Configuração:**
1. **Configurar Chave da API**: Navegue até Configurações → Configurações Globais
2. **Inserir Chave OpenAI**: Cole sua chave da API OpenAI no campo (mostrado como ✓ Configurado quando definido)
3. **Método Alternativo**: Defina a variável de ambiente `OPENAI_API_KEY` ou `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **Obter Chave da API**: Visite [Plataforma OpenAI](https://platform.openai.com/api-keys) para gerar uma chave

![Chave OpenAI das Configurações Globais](releases/global-settings-openai-key.png)
*A página de Configurações Globais fornece um campo seguro para configurar sua chave da API OpenAI*

#### 📝 Visualização de Detalhes da Tarefa

Clique em qualquer linha de tarefa para abrir a visualização detalhada da tarefa com informações abrangentes:

**Recursos:**
- **Informações Completas da Tarefa**: Visualize descrições completas, anotações, guias de implementação e critérios de verificação
- **Navegação de Tarefas**: Use os botões ← Anterior e Próximo → para mover entre tarefas sem retornar à lista
- **Arquivos Relacionados**: Veja todos os arquivos associados à tarefa com números de linha
- **Gráfico de Dependências**: Representação visual das dependências da tarefa
- **Modo de Edição**: Clique em Editar para modificar detalhes da tarefa (para tarefas não concluídas)
- **Ações Rápidas**: Copie ID da tarefa, visualize JSON bruto ou delete a tarefa

**Benefícios da Navegação:**
- **Revisão Eficiente**: Revise rapidamente múltiplas tarefas em sequência
- **Preservação de Contexto**: Permaneça na visualização detalhada ao mover entre tarefas
- **Suporte ao Teclado**: Use teclas de seta para navegação ainda mais rápida

### 📜 Página de Histórico do Projeto

A página de Histórico do Projeto fornece insights valiosos sobre a evolução do seu projeto, exibindo snapshots de tarefas concluídas salvas pelo Gerenciador de Tarefas Shrimp.

![Visão Geral do Histórico do Projeto](releases/project-history-view.png)

**Recursos:**
- **Visualização de Linha do Tempo**: Navegue por snapshots históricos dos estados de tarefas do seu projeto
- **Arquivos de Memória**: Salvos automaticamente pelo Gerenciador de Tarefas Shrimp ao iniciar novas sessões
- **Evolução de Tarefas**: Rastreie como as tarefas progrediram da criação à conclusão
- **Sistema de Anotações**: Adicione anotações pessoais às entradas históricas

![Detalhe do Histórico do Projeto](releases/project-history-detail-view.png)

**Navegação:**
- Clique em qualquer entrada histórica para visualizar o estado detalhado da tarefa naquele ponto no tempo
- Use os botões de navegação para mover entre diferentes snapshots
- Pesquise e filtre tarefas históricas como na visualização principal de tarefas

### 🤖 Página de Sub-Agentes

A página de Sub-Agentes permite gerenciar agentes de IA especializados que podem ser atribuídos às tarefas para execução ótima.

![Visualização da Lista de Agentes com Instrução de IA](releases/agent-list-view-with-ai-instruction.png)

**Recursos:**
- **Biblioteca de Agentes**: Visualize todos os agentes disponíveis da sua pasta `.claude/agents`
- **Coluna de Instrução de IA**: Clique no emoji robô (🤖) para copiar instantaneamente instruções de uso de agentes
  - Exemplo: `use subagent debugger.md located in ./claude/agents to perform:`
  - Não há necessidade de digitar manualmente caminhos de agentes ou lembrar sintaxe
  - Feedback visual confirma cópia bem-sucedida para a área de transferência
- **Editor de Agentes**: Editor markdown integrado para criar e modificar agentes
- **Codificação por Cores**: Atribua cores aos agentes para organização visual
- **Atribuição de Agentes**: Atribua facilmente agentes às tarefas via dropdown na tabela de tarefas
- **Popup do Visualizador de Agentes**: Clique no ícone do olho (👁️) para navegar e selecionar agentes

![Editor de Agentes](releases/agent-editor-color-selection.png)

**Fluxo de Trabalho de Atribuição de Agentes:**

![Dropdown de Agentes](releases/agent-dropdown-task-table.png)

1. **Selecione um agente** do dropdown na tabela de tarefas
2. **Ou clique no ícone do olho (👁️)** para abrir o popup do visualizador de agentes
3. **Navegue pelos agentes** no popup para encontrar o certo para sua tarefa
4. **Salvar automaticamente** atualiza os metadados da tarefa
5. **Use o emoji robô** para copiar instruções de execução específicas do agente

![Popup do Visualizador de Agentes](releases/agent-viewer-popup.png)
*O popup do visualizador de agentes permite navegar por todos os agentes disponíveis e selecionar o melhor para cada tarefa*

### 🎨 Página de Templates

Gerencie templates de instruções de IA que guiam como o Gerenciador de Tarefas Shrimp analisa e executa diferentes tipos de operações.

![Gerenciamento de Templates](releases/template-management-system.png)

**Capacidades:**
- **Editor de Templates**: Editor markdown completo com destaque de sintaxe
- **Tipos de Templates**: Estados Padrão, Personalizado e Personalizado+Anexar
- **Pré-visualização ao Vivo**: Veja efeitos do template antes da ativação
- **Exportar/Importar**: Compartilhe templates com membros da equipe

### ⚙️ Configurações Globais

Configure configurações em todo o sistema, incluindo o caminho da pasta Claude para acessar agentes globais.

**As Configurações Incluem:**
- **Caminho da Pasta Claude**: Defina o caminho para sua pasta global `.claude`
- **Configuração de Chave da API**: Gerencie variáveis de ambiente para serviços de IA
- **Preferências de Idioma**: Alterne entre idiomas suportados

## 🌟 Recursos

### 🏷️ Interface de Abas Moderna
- **Abas Arrastáveis**: Reordene perfis arrastando abas
- **Design Profissional**: Abas estilo navegador que se conectam perfeitamente ao conteúdo
- **Feedback Visual**: Indicação clara de aba ativa e efeitos de hover
- **Adicionar Novos Perfis**: Botão integrado "+ Adicionar Aba" que combina com o design da interface

### 🔍 Pesquisa e Filtragem Avançadas
- **Pesquisa em Tempo Real**: Filtragem instantânea de tarefas por nome, descrição, status ou ID
- **Colunas Classificáveis**: Clique nos cabeçalhos das colunas para classificar por qualquer campo
- **TanStack Table**: Componente de tabela poderoso com paginação e filtragem
- **Design Responsivo**: Funciona perfeitamente em desktop, tablet e móvel

### 🔄 Auto-Atualização Inteligente
- **Intervalos Configuráveis**: Escolha entre 5s, 10s, 15s, 30s, 1m, 2m ou 5m
- **Controles Inteligentes**: Alternar auto-atualização com seleção de intervalo
- **Indicadores Visuais**: Estados de carregamento e status de atualização
- **Atualização Manual**: Botão de atualização dedicado para atualizações sob demanda

### 📊 Gerenciamento Abrangente de Tarefas
- **Estatísticas de Tarefas**: Contadores ao vivo para tarefas Totais, Concluídas, Em Progresso e Pendentes
- **Gerenciamento de Perfis**: Adicionar/remover/reordenar perfis via interface intuitiva
- **Configurações Persistentes**: Configurações de perfil salvas entre sessões
- **Hot Reload**: Modo de desenvolvimento com atualizações instantâneas

### 🤖 Recursos com IA
- **Atribuição de Agentes em Massa**: Selecione múltiplas tarefas e use GPT-4 para atribuir automaticamente os agentes mais apropriados
- **Integração OpenAI**: Configure sua chave da API nas Configurações Globais ou via variáveis de ambiente
- **Correspondência Inteligente**: A IA analisa descrições de tarefas e capacidades de agentes para atribuições ótimas
- **Orientação de Erro**: Instruções claras se a chave da API não estiver configurada

### 📚 Controle de Versão e Histórico
- **Integração Git**: Commits Git automáticos rastreiam cada mudança no tasks.json com mensagens timestampadas
- **Trilha de Auditoria Completa**: Revise o histórico completo de modificações de tarefas usando ferramentas Git padrão
- **Operações Não-Bloqueantes**: Falhas do Git não interrompem o gerenciamento de tarefas
- **Repositório Isolado**: Histórico de tarefas rastreado separadamente do seu repositório de projeto

### 🎨 UI/UX Profissional
- **Tema Escuro**: Otimizado para ambientes de desenvolvimento
- **Layout Responsivo**: Adapta-se a todos os tamanhos de tela
- **Acessibilidade**: Navegação completa por teclado e suporte a leitor de tela
- **Elementos Interativos**: Tooltips de hover e feedback visual por toda parte

## 🚀 Início Rápido

### Instalação e Configuração

1. **Clone e navegue para o diretório do visualizador de tarefas**
   ```bash
   cd caminho/para/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Instale as dependências**
   ```bash
   npm install
   ```

3. **Construa a aplicação React**
   ```bash
   npm run build
   ```

4. **Inicie o servidor**
   ```bash
   npm start
   ```

   O visualizador estará disponível em `http://localhost:9998`

### Modo de Desenvolvimento

Para desenvolvimento com hot reload:

```bash
# Inicie tanto o servidor de API quanto o servidor de desenvolvimento
npm run start:all

# Ou execute-os separadamente:
npm start          # Servidor de API na porta 9998
npm run dev        # Servidor de desenvolvimento Vite na porta 3000
```

A aplicação estará disponível em `http://localhost:3000` com reconstrução automática em mudanças de arquivo.

### Implantação em Produção

#### Implantação Padrão

```bash
# Construir para produção
npm run build

# Iniciar o servidor de produção
npm start
```

#### Serviço Systemd (Linux)

Para inicialização automática e gerenciamento de processos:

1. **Instalar como serviço**
   ```bash
   sudo ./install-service.sh
   ```

2. **Gerenciar o serviço**
   ```bash
   # Verificar status
   systemctl status shrimp-task-viewer
   
   # Iniciar/parar/reiniciar
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Visualizar logs
   journalctl -u shrimp-task-viewer -f
   
   # Desabilitar/habilitar inicialização automática
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Desinstalar o serviço**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Uso

### Começando

1. **Inicie o servidor**:
   ```bash
   npm start
   ```
   
   **Nota**: Se você ainda não construiu a aplicação ou quer usar o modo de desenvolvimento com hot reload, use `npm run start:all` em vez disso.

2. **Abra seu navegador**:
   Navegue para `http://127.0.0.1:9998` (produção) ou `http://localhost:3000` (desenvolvimento)

3. **Adicione seu primeiro perfil**:
   - Clique no botão "**+ Adicionar Aba**"
   - Digite um nome descritivo do perfil (ex.: "Tarefas da Equipe Alpha")
   - Digite o caminho para sua pasta de dados shrimp contendo tasks.json
   - **Dica:** Navegue para sua pasta no terminal e digite `pwd` para obter o caminho completo
   - Clique em "**Adicionar Perfil**"

4. **Gerencie suas tarefas**:
   - Alterne entre perfis usando as abas
   - Pesquise tarefas usando a caixa de pesquisa
   - Classifique colunas clicando nos cabeçalhos
   - Configure auto-atualização conforme necessário

### Gerenciamento de Abas

- **Alternar Perfis**: Clique em qualquer aba para alternar para esse perfil
- **Reordenar Abas**: Arraste abas para reorganizá-las na sua ordem preferida
- **Adicionar Novo Perfil**: Clique no botão "**+ Adicionar Aba**"
- **Remover Perfil**: Clique no × em qualquer aba (com confirmação)

### Pesquisa e Filtragem

- **Pesquisa Global**: Digite na caixa de pesquisa para filtrar em todos os campos de tarefa
- **Classificação de Colunas**: Clique em qualquer cabeçalho de coluna para classificar (clique novamente para reverter)
- **Paginação**: Navegue em listas grandes de tarefas com controles de paginação integrados
- **Atualizações em Tempo Real**: Pesquisa e classificação atualizam instantaneamente conforme você digita

### Configuração de Auto-Atualização

1. **Habilitar Auto-atualização**: Marque a caixa de seleção "Auto-atualização"
2. **Definir Intervalo**: Escolha do dropdown (5s a 5m)
3. **Atualização Manual**: Clique no botão 🔄 a qualquer momento para atualização imediata
4. **Feedback Visual**: Spinner mostra durante operações de atualização

## 🔧 Configuração

### Variáveis de Ambiente

Para tornar variáveis de ambiente persistentes entre sessões de terminal, adicione-as ao seu arquivo de configuração do shell:

**Para macOS/Linux com Zsh** (padrão no macOS moderno):
```bash
# Adicionar ao ~/.zshrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Recarregar configuração
source ~/.zshrc
```

**Para Linux/Unix com Bash**:
```bash
# Adicionar ao ~/.bashrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Recarregar configuração
source ~/.bashrc
```

**Por que adicionar à configuração do shell?**
- **Persistência**: Variáveis definidas com `export` no terminal duram apenas para essa sessão
- **Consistência**: Todas as novas janelas de terminal terão essas configurações
- **Conveniência**: Não é necessário definir variáveis toda vez que iniciar o servidor

**Variáveis Disponíveis**:
```bash
SHRIMP_VIEWER_PORT=9998           # Porta do servidor (padrão: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Host do servidor (apenas localhost)
OPENAI_API_KEY=sk-...             # Chave da API OpenAI para atribuição de agentes de IA
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Variável de ambiente alternativa para chave OpenAI
```

### Configuração de Desenvolvimento

- **Desenvolvimento com hot reload (recomendado para desenvolvimento)**:
  ```bash
  npm run start:all  # Executa servidor de API (9998) + servidor de desenvolvimento Vite (3000)
  ```
  
  **Por que usar start:all?** Este comando executa tanto o servidor de API quanto o servidor de desenvolvimento Vite simultaneamente. Você obtém substituição de módulo quente instantânea (HMR) para mudanças de UI enquanto tem a funcionalidade completa da API. Suas mudanças aparecem imediatamente no navegador em `http://localhost:3000` sem atualização manual.

- **Apenas servidor de API (para produção ou testes de API)**:
  ```bash
  npm start  # Executa na porta 9998
  ```
  
  **Por que usar apenas servidor de API?** Use isso quando construiu os arquivos de produção e quer testar a aplicação completa como executaria em produção, ou quando só precisa dos endpoints da API.

- **Construir e servir para produção**:
  ```bash
  npm run build && npm start  # Construir e então servir na porta 9998
  ```
  
  **Por que construir para produção?** A construção de produção otimiza seu código minificando JavaScript, removendo código morto e agrupando assets de forma eficiente. Isso resulta em tempos de carregamento mais rápidos e melhor performance para usuários finais. Sempre use a construção de produção ao implantar.

### Armazenamento de Dados do Perfil

**Entendendo o Gerenciamento de Dados do Perfil**: O Visualizador de Tarefas usa uma abordagem híbrida para armazenamento de dados que prioriza tanto persistência quanto precisão em tempo real. Configurações de perfil (como nomes de abas, caminhos de pastas e ordem de abas) são armazenadas localmente em um arquivo de configurações JSON no seu diretório home, enquanto dados de tarefas são lidos diretamente das pastas do seu projeto em tempo real.

- **Arquivo de Configurações**: `~/.shrimp-task-viewer-settings.json`
  
  Este arquivo oculto no seu diretório home armazena todas as configurações dos seus perfis, incluindo nomes de abas, caminhos de pastas, ordenação de abas e outras preferências. É criado automaticamente quando você adiciona seu primeiro perfil e atualizado sempre que faz mudanças. Você pode editar manualmente este arquivo se necessário, mas tenha cuidado para manter formatação JSON válida.

- **Arquivos de Tarefas**: Lidos diretamente dos caminhos de pasta especificados (sem uploads)
  
  Diferente de aplicações web tradicionais que fazem upload e armazenam cópias de arquivos, o Visualizador de Tarefas lê arquivos `tasks.json` diretamente dos caminhos de pasta especificados. Isso garante que você sempre veja o estado atual das suas tarefas sem necessidade de re-upload ou sincronização. Quando adiciona um perfil, você está simplesmente dizendo ao visualizador onde procurar o arquivo tasks.json.

- **Hot Reload**: Mudanças de desenvolvimento reconstroem automaticamente
  
  Quando executando em modo de desenvolvimento (`npm run dev`), quaisquer mudanças no código fonte acionam reconstruções automáticas e atualizações do navegador. Isso se aplica a componentes React, estilos e código do servidor, tornando o desenvolvimento mais rápido e eficiente.

### Histórico de Tarefas Git

**Controle de Versão Automático**: Começando com v3.0, o Gerenciador de Tarefas Shrimp rastreia automaticamente todas as mudanças de tarefas usando Git. Isso fornece uma trilha de auditoria completa sem configuração manual.

- **Localização do Repositório**: `<shrimp-data-directory>/.git`
  
  Cada projeto obtém seu próprio repositório Git no diretório de dados configurado no seu arquivo `.mcp.json`. Isso é completamente separado do repositório Git principal do seu projeto, prevenindo conflitos ou interferências.

- **Visualizando Histórico**: Use comandos Git padrão para explorar histórico de tarefas
  ```bash
  cd <shrimp-data-directory>
  git log --oneline          # Visualizar histórico de commits
  git show <commit-hash>     # Ver mudanças específicas
  git diff HEAD~5            # Comparar com 5 commits atrás
  ```

- **Formato de Commit**: Todos os commits incluem timestamps e mensagens descritivas
  ```
  [2025-08-07T13:45:23-07:00] Adicionar nova tarefa: Implementar autenticação de usuário
  [2025-08-07T14:12:10-07:00] Atualizar tarefa: Corrigir validação de login
  [2025-08-07T14:45:55-07:00] Operação de tarefas em massa: modo anexar, 6 tarefas
  ```

- **Recuperação**: Restaurar estados anteriores de tarefas se necessário
  ```bash
  cd <shrimp-data-directory>
  git checkout <commit-hash> -- tasks.json  # Restaurar versão específica
  git reset --hard <commit-hash>            # Reset completo para estado anterior
  ```

## 🏗️ Arquitetura Técnica

### Stack Tecnológico

- **Frontend**: React 19 + Vite para desenvolvimento com hot reload
- **Componente de Tabela**: TanStack React Table para recursos avançados de tabela
- **Estilização**: CSS personalizado com tema escuro e design responsivo
- **Backend**: Servidor HTTP Node.js com API RESTful
- **Sistema de Construção**: Vite para desenvolvimento rápido e construções de produção otimizadas

### Estrutura de Arquivos

**Organização do Projeto**: O Visualizador de Tarefas segue uma estrutura limpa e modular que separa responsabilidades e torna a base de código fácil de navegar e estender. Cada diretório e arquivo tem um propósito específico na arquitetura da aplicação.

```
task-viewer/
├── src/                       # Código fonte da aplicação React
│   ├── App.jsx               # Componente React principal - gerencia estado, perfis e abas
│   ├── components/           # Componentes React reutilizáveis
│   │   ├── TaskTable.jsx     # Tabela TanStack para exibir e classificar tarefas
│   │   ├── Help.jsx          # Visualizador README com renderização markdown
│   │   └── ReleaseNotes.jsx  # Histórico de versões com destaque de sintaxe
│   ├── data/                 # Dados estáticos e configuração
│   │   └── releases.js       # Metadata de releases e informações de versão
│   └── index.css             # Sistema completo de estilização com tema escuro
├── releases/                  # Arquivos markdown de notas de release e imagens
│   ├── v*.md                 # Arquivos individuais de notas de release
│   └── *.png                 # Screenshots e imagens para releases
├── dist/                     # Saída da construção de produção (auto-gerada)
│   ├── index.html            # Ponto de entrada HTML otimizado
│   └── assets/               # JS, CSS e outros assets agrupados
├── server.js                 # Servidor de API Node.js estilo Express
├── cli.js                    # Interface de linha de comando para gerenciamento de serviços
├── vite.config.js            # Configuração da ferramenta de construção para desenvolvimento/produção
├── package.json              # Metadata do projeto, dependências e scripts npm
├── install-service.sh        # Instalador de serviço systemd Linux
└── README.md                 # Documentação abrangente (este arquivo)
```

**Diretórios Principais Explicados**:

- **`src/`**: Contém todo o código fonte React. É aqui que você fará a maioria das mudanças de UI.
- **`dist/`**: Construção de produção auto-gerada. Nunca edite estes arquivos diretamente.
- **`releases/`**: Armazena notas de release em formato markdown com imagens associadas.
- **Arquivos raiz**: Arquivos de configuração e servidor que lidam com construção, servir e implantação.

### Endpoints da API

- `GET /` - Serve a aplicação React
- `GET /api/agents` - Lista todos os perfis configurados
- `GET /api/tasks/{profileId}` - Retorna tarefas para perfil específico
- `POST /api/add-profile` - Adiciona novo perfil com caminho da pasta
- `DELETE /api/remove-profile/{profileId}` - Remove perfil
- `PUT /api/rename-profile/{profileId}` - Renomeia perfil
- `PUT /api/update-profile/{profileId}` - Atualiza configurações do perfil
- `GET /api/readme` - Retorna conteúdo README para aba de ajuda
- `GET /releases/*.md` - Serve arquivos markdown de notas de release
- `GET /releases/*.png` - Serve imagens de notas de release

## 🛠️ Desenvolvimento

### Configurando Ambiente de Desenvolvimento

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento com hot reload
npm run dev

# Servidor de desenvolvimento executa em http://localhost:3000
# Servidor de API backend executa em http://localhost:9998
```

### Construindo para Produção

```bash
# Construir pacote de produção otimizado
npm run build

# Arquivos são gerados no diretório dist/
# Iniciar servidor de produção
npm start
```

### Estendendo a Interface

A arquitetura React modular torna fácil estender:

1. **Adicionar Novos Componentes**: Crie em `src/components/`
2. **Modificar Estilização**: Edite `src/index.css` com propriedades CSS personalizadas
3. **Adicionar Recursos**: Estenda `App.jsx` com novo estado e funcionalidade
4. **Integração de API**: Adicione endpoints em `server.js`

## 🔒 Segurança e Performance

### Recursos de Segurança

- **Ligação de Localhost**: Servidor acessível apenas da máquina local
- **Acesso Direto a Arquivos**: Lê arquivos de tarefas diretamente de caminhos do sistema de arquivos
- **Sem Dependências Externas**: Auto-contido com superfície de ataque mínima
- **Proteção CORS**: Endpoints da API protegidos com cabeçalhos CORS

### Otimizações de Performance

- **Substituição de Módulo Quente**: Atualizações instantâneas de desenvolvimento
- **Code Splitting**: Carregamento otimizado de pacotes
- **Re-renderização Eficiente**: Padrões de otimização React
- **Cache**: Cache de assets estáticos para carregamentos mais rápidos
- **Imagens Responsivas**: Otimizadas para todos os tamanhos de dispositivos

## 🐛 Solução de Problemas

### Problemas Comuns

**Servidor Não Inicia**
```bash
# Verificar se a porta está em uso
lsof -i :9998

# Matar processos existentes
pkill -f "node.*server.js"

# Tentar porta diferente
SHRIMP_VIEWER_PORT=8080 node server.js
```

**Aba Help/Readme Mostra HTML**
Se a aba Help exibe HTML em vez do conteúdo README, o servidor precisa ser reiniciado para carregar os novos endpoints da API:
```bash
# Pare o servidor (Ctrl+C) e reinicie
npm start
```

**Hot Reload Não Funciona**
```bash
# Garantir que dependências de desenvolvimento estão instaladas
npm install

# Reiniciar servidor de desenvolvimento
npm run dev
```

**Tarefas Não Carregam**
1. Verifique se arquivos `tasks.json` contêm JSON válido
2. Verifique se permissões de arquivo são legíveis
3. Verifique console do navegador para mensagens de erro
4. Use botão de atualização manual para recarregar dados

**Erros de Construção**
```bash
# Limpar node_modules e reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpar cache Vite
rm -rf dist/
npm run build
```

## 📋 Changelog

### Versão 2.1.0 (Mais Recente) - 2025-07-29

#### 🚀 Recursos Principais
- **Suporte Direto a Caminhos de Arquivos**: Substituiu upload de arquivos por entrada direta de caminho de pasta para atualizações ao vivo
- **Aba Help/Readme**: Adicionada aba de documentação com renderização markdown
- **Aba de Notas de Release**: Visualizador de notas de release na aplicação com suporte a imagens  
- **Dependências Clicáveis**: Navegue entre tarefas dependentes facilmente
- **Coluna de Ações de IA**: Copie instruções de IA para conclusão de tarefas
- **Gerenciamento Aprimorado de UUID**: Clique em badges de tarefas para copiar UUIDs
- **Edição de Perfis**: Renomeie perfis e configure raízes de projetos
- **Suporte a Módulos ES**: Convertido para módulos ES para melhor compatibilidade

#### 🐛 Correção Crítica
- **Corrigido Problema de Cópia de Arquivos Estáticos**: Arquivos são agora lidos diretamente de caminhos especificados em vez de criar cópias estáticas em `/tmp/`

### Versão 1.0.3 - 2025-07-26

#### 🧪 Testes e Confiabilidade
- **Suíte de Testes Abrangente**: Adicionada cobertura completa de testes com Vitest
- **Testes de Componentes**: Testes React Testing Library para todos os componentes
- **Testes de Integração**: Testes end-to-end de servidor e endpoints de API
- **Correções de Bugs**: Resolvido tratamento de dados de formulário multipart no gerenciamento de perfis

### Versão 1.0.2 - 2025-07-26

#### 🎨 Visualização de Detalhes da Tarefa
- **Navegação na Aba**: Substituiu modal por detalhes de tarefa perfeitos na aba
- **Botão Voltar**: Navegação fácil de volta à lista de tarefas
- **UX Melhorada**: Melhor fluxo de trabalho sem interrupções de popup

### Versão 1.0.1 - 2025-07-13

#### 🎨 Grande Reformulação da UI
- **Interface de Abas Moderna**: Abas profissionais estilo navegador com reordenamento arrastar e soltar
- **Design Conectado**: Conexão visual perfeita entre abas e conteúdo
- **Layout Melhorado**: Pesquisa e controles reposicionados para melhor fluxo de trabalho

#### ⚡ Funcionalidade Aprimorada  
- **Auto-atualização Configurável**: Escolha intervalos de 5 segundos a 5 minutos
- **Pesquisa Avançada**: Filtragem em tempo real em todos os campos de tarefa
- **Colunas Classificáveis**: Clique nos cabeçalhos para classificar por qualquer coluna
- **Desenvolvimento Hot Reload**: Atualizações instantâneas durante desenvolvimento

#### 🔧 Melhorias Técnicas
- **Arquitetura React**: Reescrita completa usando React 19 + Vite
- **TanStack Table**: Componente de tabela profissional com paginação
- **Design Responsivo**: Abordagem mobile-first com otimização de breakpoints
- **Performance**: Renderização otimizada e gerenciamento de estado eficiente

### Versão 1.0.0 - 2025-07-01

#### 🚀 Release Inicial
- **Visualizador Básico**: Implementação inicial com interface web básica
- **Gerenciamento de Perfis**: Adicionar e remover perfis de tarefas
- **API do Servidor**: Endpoints RESTful para dados de tarefas
- **Exibição de Tarefas**: Visualizar tarefas de múltiplos projetos

## 📄 Licença

Licença MIT - veja a licença do projeto principal para detalhes.

## 🤝 Contribuindo

Esta ferramenta faz parte do projeto MCP Gerenciador de Tarefas Shrimp. Contribuições são bem-vindas!

1. Faça fork do repositório
2. Crie uma branch de recurso (`git checkout -b feature/recurso-incrivel`)
3. Faça suas mudanças com testes apropriados
4. Commit suas mudanças (`git commit -m 'Adicionar recurso incrível'`)
5. Push para a branch (`git push origin feature/recurso-incrivel`)
6. Submeta um pull request

### Diretrizes de Desenvolvimento

- Siga as melhores práticas React e padrões de hooks
- Mantenha princípios de design responsivo
- Adicione tipos TypeScript apropriados onde aplicável
- Teste em diferentes navegadores e dispositivos
- Atualize documentação para novos recursos

---

**Feliz gerenciamento de tarefas! 🦐✨**

Construído com ❤️ usando React, Vite e tecnologias web modernas.