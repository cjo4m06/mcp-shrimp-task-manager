export const ptDocumentation = {
  releaseNotes: {
    header: '📋 Notas de Lançamento',
    versions: 'Versões',
    loading: 'Carregando notas de lançamento...',
    notFound: 'Notas de lançamento não encontradas.',
    error: 'Erro ao carregar notas de lançamento.',
    copy: 'Copiar',
    copied: 'Copiado!'
  },
  help: {
    header: 'ℹ️ Ajuda e Documentação',
    loading: 'Carregando documentação...',
    notFound: 'README não encontrado.',
    error: 'Erro ao carregar README.',
    copy: 'Copiar',
    copied: 'Copiado!'
  },
  releases: {
    'v3.0.0': {
      title: '🚀 Notas de Lançamento do Task Viewer v3.0.0',
      date: 'Lançado: 7 de agosto de 2025',
      content: `# 🚀 Notas de Lançamento do Task Viewer v3.0.0

*Lançado: 7 de agosto de 2025*

## 📑 Índice

- [🎉 Principais Novos Recursos](#-principais-novos-recursos)
  - [🤖 Sistema de Gerenciamento de Agentes](#-sistema-de-gerenciamento-de-agentes)
  - [🤖 Atribuição de Agentes em Massa com IA](#-atribuição-de-agentes-em-massa-com-ia)
  - [📊 Controle de Versão Git para Histórico de Tarefas](#-controle-de-versão-git-para-histórico-de-tarefas)
  - [📊 Visualização do Histórico do Projeto](#-visualização-do-histórico-do-projeto)
  - [🎨 Sistema de Gerenciamento de Templates](#-sistema-de-gerenciamento-de-templates)
  - [🌍 Suporte à Internacionalização (i18n)](#-suporte-à-internacionalização-i18n)
  - [🧭 Navegação e UI Aprimoradas](#-navegação-e-ui-aprimoradas)

## 🎉 Principais Novos Recursos

### 🤖 Sistema de Gerenciamento de Agentes
O SHRIMP-TASK-MANAGER agora suporta poderosas capacidades de gerenciamento de agentes, permitindo que você defina e use agentes de IA especializados para diferentes tipos de tarefas.

### 🤖 Atribuição de Agentes em Massa com IA
O Task Viewer agora se integra com o GPT-4 da OpenAI para atribuir agentes inteligentemente a tarefas com base em suas descrições e requisitos.

### 📊 Controle de Versão Git para Histórico de Tarefas
O SHRIMP-TASK-MANAGER agora inclui integração Git integrada que rastreia automaticamente todas as mudanças no arquivo tasks.json.

### 📊 Visualização do Histórico do Projeto
A nova Visualização do Histórico do Projeto expõe o histórico de tarefas, permitindo explorar como seu projeto evoluiu ao longo do tempo.

### 🎨 Sistema de Gerenciamento de Templates
Templates são as instruções centrais que guiam o SHRIMP-TASK-MANAGER na análise e execução de tarefas. Esta nova interface de Gerenciamento de Templates fornece uma maneira intuitiva de personalizar instruções de IA.

### 🌍 Suporte à Internacionalização (i18n)
- **Três Idiomas Suportados**: Inglês (en), Chinês (中文) e Espanhol (Español)
- **Seleção Persistente de Idioma**: Sua preferência de idioma é salva e lembrada
- **Tradução Completa da UI**: Todos elementos da UI são totalmente traduzidos
- **Troca Dinâmica de Idioma**: Mude idiomas instantaneamente sem recarregar a página

### 🧭 Navegação e UI Aprimoradas
- **Sistema de Abas Aninhadas**: Navegação organizada com abas primárias e secundárias
- **Sincronização de Estado da URL**: URL do navegador atualiza para refletir a visualização atual
- **Navegação de Detalhes da Tarefa**: Botões Anterior/Próximo permitem revisão sequencial de tarefas
- **Spinners de Carregamento**: Feedback visual durante carregamento de dados

## 🔄 Melhorias Significativas

### Navegação de Detalhes da Tarefa
A visualização de Detalhes da Tarefa agora inclui botões de navegação Anterior/Próximo que transformam como você revisa e trabalha com tarefas.

### Melhorias de Performance
- **Renderizações Otimizadas**: Hooks React adequadamente memoizados para melhor performance
- **Carregamento Preguiçoso**: Componentes carregam sob demanda
- **Gerenciamento de Estado Eficiente**: Atualizações de estado desnecessárias reduzidas

## 🐛 Correções de Bugs

### Correções Críticas
- **Erro do Hook useRef**: Corrigido import de hook React ausente causando crashes do app
- **Chaves de Tradução**: Adicionadas chaves de tradução ausentes para todos idiomas suportados
- **Loop de Link Simbólico**: Resolvido problema de loop infinito do diretório Screenshots

### Correções de UI
- **Z-index de Modal**: Corrigidos problemas de camadas de modal
- **Seleção de Aba**: Corrigida persistência de aba através de recarregamentos de página
- **Seletor de Idioma**: Corrigidos problemas de sincronização de estado

## 🏗️ Atualizações Técnicas

### Novas Dependências
- \`@headlessui/react\`: Componentes UI modernos
- \`@tanstack/react-table\`: Funcionalidade avançada de tabela
- \`@uiw/react-md-editor\`: Edição Markdown para templates

### Melhorias de API
- **GET /api/templates**: Lista todos templates disponíveis
- **PUT /api/templates/:name**: Atualiza conteúdo do template
- **POST /api/templates/:name/duplicate**: Duplica templates

## 📝 Alterações Significativas

### Atualizações de Configuração
- **Configurações de Idioma**: Novo formato de armazenamento de preferência de idioma
- **Armazenamento de Template**: Templates agora armazenados no diretório home do usuário

## 🚀 Guia de Migração

### De v2.1 para v3.0
1. **Seleção de Idioma**: Seu idioma padrão será Inglês; selecione idioma preferido do novo seletor
2. **Templates**: Templates personalizados existentes serão preservados mas podem precisar reativação
3. **Cache do Navegador**: Limpe cache do navegador para performance ótima

## 🎯 Resumo

A versão 3.0 representa um salto significativo para o Task Viewer, transformando-o de uma ferramenta simples de visualização de tarefas em uma plataforma abrangente de gerenciamento e customização de tarefas. Com suporte completo à internacionalização, gerenciamento poderoso de templates, automação com IA e capacidades de rastreamento histórico baseadas em Git, este lançamento fornece às equipes controle sem precedentes sobre seus fluxos de trabalho de desenvolvimento assistidos por IA.`
    },
    'v2.1.0': {
      title: 'Notas de Lançamento do Task Viewer v2.1.0',
      date: 'Lançado: 29 de julho de 2025',
      content: `# Notas de Lançamento do Task Viewer v2.1.0

*Lançado: 29 de julho de 2025*

## 🚀 Recursos Principais

### 🔗 Caminhos de Arquivo Clicáveis com Suporte de Raiz do Projeto
- **Caminhos de Arquivo com Clic para Copiar**: Clique em qualquer caminho de arquivo relacionado à tarefa para copiar instantaneamente
- **Configuração de Raiz do Projeto**: Configure a raiz do projeto por perfil para habilitar cópia completa de caminhos de arquivos

### 📋 Gerenciamento Aprimorado de UUID
- **Clic para Copiar Badges de Tarefa**: Clique em qualquer badge de número de tarefa para copiar instantaneamente seu UUID
- **UUID Concatenado**: UUID mostrado sob o nome da tarefa na coluna Nome da Tarefa

### 🔄 Coluna de Dependências de Tarefas
Adicionada coluna de Dependências que lista os UUIDs vinculados de qualquer tarefa dependente. Agora você pode navegar facilmente para tarefas dependentes.

### 🤖 Ações de Instruções de IA
Adicionada Coluna de Ações com emoji de Robô útil. Clique no emoji para copiar uma Instrução de IA para a área de transferência.

### ✏️ Botão de Edição de Perfil
- **Configuração de Raiz do Projeto**: Configure a raiz do projeto por perfil
- **Capacidade para Renomear um Perfil**: Renomeie uma aba de perfil sem ter que deletar e recriar

## 🔄 Mudanças

### Melhorias de UI/UX
- **Ações de Cópia Simplificadas**: Cópia de UUID consolidada apenas ao clic do badge de tarefa
- **Dependências sobre Notas**: Substituiu a coluna de Notas com a coluna de Dependências mais útil
- **Notas de Versão na App**: Notas de versão para o visualizador de tarefas mostradas no banner superior

### Atualizações de Arquitetura
- **Compatibilidade com Módulos ES**: Removida dependência de busboy para melhor suporte de módulos ES
- **Análise de Formulários Nativo**: Substituído análise de formulários de terceiros com funções integradas do Node.js

## 🐛 Correções de Bugs

### 🚨 CORREÇÃO CRÍTICA: Upload de Arquivos Cria Cópias Estáticas
**O Problema**: Ao adicionar perfis carregando um arquivo tasks.json, o sistema estava criando uma cópia estática no diretório \`/tmp/\`.

**A Solução**: Removida completamente a funcionalidade de upload de arquivos. Agora você deve inserir o caminho da pasta diretamente, e o sistema adiciona automaticamente \`/tasks.json\`.

## 🗑️ Removido

### Recursos Obsoletos
- **Dependência de Busboy**: Substituída por análise de formulários nativo do Node.js
- **Coluna de Notas**: Substituída pela coluna de Dependências mais útil
- **Botões de Cópia Individuais**: Cópia de UUID consolidada ao clic do badge de tarefa`
    }
  },
  readme: {
    title: '🦐 Visualizador do Gerenciador de Tarefas Shrimp',
    content: `# 🦐 Visualizador do Gerenciador de Tarefas Shrimp

Uma interface web moderna baseada em React para visualizar e gerenciar tarefas do [Gerenciador de Tarefas Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) criadas através da ferramenta MCP (Protocolo de Contexto do Modelo).

## Por que usar o Visualizador de Tarefas Shrimp?

Ao usar o Gerenciador de Tarefas Shrimp como servidor MCP com agentes de IA como Claude, este visualizador fornece visibilidade essencial em seu ecossistema de tarefas:

- **Visão Geral Visual das Tarefas**: Veja todas as tarefas, seus status, dependências e progresso em uma interface de abas limpa
- **Gerenciamento de UUID**: Clique em qualquer badge de tarefa para copiar instantaneamente seu UUID
- **Execução Paralela**: Abra múltiplos terminais e use a coluna de Ações de IA (🤖) para copiar instruções de tarefas
- **Atualizações em Tempo Real**: A leitura direta de caminhos de arquivos garante que você sempre veja o estado atual das tarefas
- **Suporte Multi-Projeto**: Gerencie tarefas entre diferentes projetos com abas de perfil arrastáveis

## 🌟 Recursos

### 🏷️ Interface de Abas Moderna
- **Abas Arrastáveis**: Reordene perfis arrastando abas
- **Design Profissional**: Abas estilo navegador que se conectam perfeitamente ao conteúdo
- **Feedback Visual**: Indicação clara de aba ativa e efeitos de hover
- **Adicionar Novos Perfis**: Botão integrado "+ Adicionar Aba"

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

### 🤖 Recursos com IA
- **Atribuição de Agentes em Massa**: Selecione múltiplas tarefas e use GPT-4 para atribuir automaticamente os agentes mais apropriados
- **Integração OpenAI**: Configure sua chave da API nas Configurações Globais ou via variáveis de ambiente
- **Correspondência Inteligente**: A IA analisa descrições de tarefas e capacidades de agentes para atribuições ótimas

### 🎨 UI/UX Profissional
- **Tema Escuro**: Otimizado para ambientes de desenvolvimento
- **Layout Responsivo**: Adapta-se a todos os tamanhos de tela
- **Acessibilidade**: Navegação completa por teclado e suporte a leitor de tela
- **Elementos Interativos**: Tooltips de hover e feedback visual por toda parte

## 🚀 Início Rápido

### Instalação e Configuração

1. **Clone e navegue para o diretório do visualizador de tarefas**
   \`\`\`bash
   cd caminho/para/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Instale as dependências**
   \`\`\`bash
   npm install
   \`\`\`

3. **Construa a aplicação React**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Inicie o servidor**
   \`\`\`bash
   npm start
   \`\`\`

   O visualizador estará disponível em \`http://localhost:9998\`

## 🖥️ Uso

### Começando

1. **Inicie o servidor**: \`npm start\`
2. **Abra seu navegador**: Navegue para \`http://127.0.0.1:9998\`
3. **Adicione seu primeiro perfil**: Clique no botão "+ Adicionar Aba"
4. **Gerencie suas tarefas**: Alterne entre perfis, pesquise e classifique tarefas

### Gerenciamento de Abas
- **Alternar Perfis**: Clique em qualquer aba para alternar para esse perfil
- **Reordenar Abas**: Arraste abas para reorganizá-las
- **Adicionar Novo Perfil**: Clique no botão "+ Adicionar Aba"
- **Remover Perfil**: Clique no × em qualquer aba

## 🔧 Configuração

### Variáveis de Ambiente
\`\`\`bash
SHRIMP_VIEWER_PORT=9998           # Porta do servidor (padrão: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Host do servidor (apenas localhost)
OPENAI_API_KEY=sk-...             # Chave da API OpenAI para atribuição de agentes
\`\`\`

### Configuração de Desenvolvimento
- **Desenvolvimento com hot reload**: \`npm run start:all\`
- **Apenas servidor de API**: \`npm start\`
- **Construir para produção**: \`npm run build && npm start\`

## 🐛 Solução de Problemas

### Problemas Comuns

**Servidor Não Inicia**
\`\`\`bash
# Verificar se a porta está em uso
lsof -i :9998

# Matar processos existentes
pkill -f "node.*server.js"

# Tentar porta diferente
SHRIMP_VIEWER_PORT=8080 node server.js
\`\`\`

**Hot Reload Não Funciona**
\`\`\`bash
# Garantir que dependências de desenvolvimento estão instaladas
npm install

# Reiniciar servidor de desenvolvimento
npm run dev
\`\`\`

## 📄 Licença

Licença MIT - veja a licença do projeto principal para detalhes.

## 🤝 Contribuindo

Esta ferramenta faz parte do projeto MCP Gerenciador de Tarefas Shrimp. Contribuições são bem-vindas!

---

**Feliz gerenciamento de tarefas! 🦐✨**

Construído com ❤️ usando React, Vite e tecnologias web modernas.`
  }
};