[🇺🇸 English](../../README.md) | [🇩🇪 Deutsch](../de/README.md) | [🇫🇷 Français](../fr/README.md) | [🇰🇷 한국어](../ko/README.md) | [🇧🇷 Português](README.md) | [🇷🇺 Русский](../ru/README.md) | [🇨🇳 中文](../zh/README.md)

## Índice

- [✨ Funcionalidades](#funcionalidades1)
- [🧭 Guia de Uso](#guia-uso)
- [🖥️ Ferramenta Task Viewer](#task-viewer-ferramenta)
- [🔬 Modo de Pesquisa](#modo-pesquisa)
- [🤖 Sistema de Gerenciamento de Agentes](#sistema-gerenciamento-agentes)
- [🧠 Função de Memória de Tarefas](#funcao-memoria-tarefas)
- [📋 Inicialização de Regras do Projeto](#regras-projeto)
- [🌐 Interface Web](#interface-web)
- [📚 Recursos de Documentação](#documentacao)
- [🔧 Instalação e Uso](#instalacao)
- [🔌 Uso com Clientes Compatíveis com MCP](#clientes)
- [💡 Guia de Prompts do Sistema](#prompt)
- [🛠️ Visão Geral das Ferramentas Disponíveis](#ferramentas)
- [🏗️ Visão Geral da Arquitetura](#visao-geral-arquitetura)
- [📄 Licença](#licenca)
- [🤖 Modelos Recomendados](#modelos-recomendados)

# MCP Shrimp Task Manager

[![Shrimp Task Manager Demo](/docs/yt.png)](https://www.youtube.com/watch?v=Arzu0lV09so)

[![smithery badge](https://smithery.ai/badge/@cjo4m06/mcp-shrimp-task-manager)](https://smithery.ai/server/@cjo4m06/mcp-shrimp-task-manager)

> 🚀 Um sistema inteligente de gerenciamento de tarefas baseado no Model Context Protocol (MCP), fornecendo uma estrutura eficiente de fluxo de trabalho de programação para Agentes de IA.

<a href="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@cjo4m06/mcp-shrimp-task-manager/badge" alt="Shrimp Task Manager MCP server" />
</a>

O Shrimp Task Manager guia Agentes através de fluxos de trabalho estruturados para programação sistemática, aprimorando mecanismos de gerenciamento de memória de tarefas e evitando efetivamente trabalho de codificação redundante e repetitivo.

## ✨ <a id="funcionalidades1"></a>Funcionalidades

- **Planejamento e Análise de Tarefas**: Compreensão profunda e análise de requisitos de tarefas complexas
- **Decomposição Inteligente de Tarefas**: Divide automaticamente tarefas grandes em tarefas menores gerenciáveis
- **Gerenciamento de Dependências**: Trata precisamente dependências entre tarefas, garantindo ordem de execução correta
- **Rastreamento de Status de Execução**: Monitoramento em tempo real do progresso e status de execução de tarefas
- **Verificação de Completude de Tarefas**: Garante que os resultados das tarefas atendam aos requisitos esperados
- **Avaliação de Complexidade de Tarefas**: Avalia automaticamente a complexidade das tarefas e fornece sugestões de tratamento otimizadas
- **Atualizações Automáticas de Resumo de Tarefas**: Gera automaticamente resumos após a conclusão das tarefas, otimizando o desempenho da memória
- **Função de Memória de Tarefas**: Backup automático do histórico de tarefas, fornecendo capacidades de memória e referência de longo prazo
- **Modo de Pesquisa**: Capacidades sistemáticas de pesquisa técnica com fluxos de trabalho guiados para explorar tecnologias, melhores práticas e comparações de soluções
- **Inicialização de Regras do Projeto**: Define padrões e regras do projeto para manter consistência em projetos grandes
- **<a id="interface-web"></a>Interface Web**: Fornece uma interface gráfica de usuário baseada na web opcional para gerenciamento de tarefas. Ative definindo `ENABLE_GUI=true` no seu arquivo `.env`. Quando ativado, um arquivo `WebGUI.md` contendo o endereço de acesso será criado no seu `DATA_DIR`. Você pode personalizar a porta da web definindo `WEB_PORT` (se não especificado, uma porta disponível será selecionada automaticamente).
- **<a id="task-viewer-ferramenta"></a>Task Viewer**: Uma interface web moderna baseada em React para visualizar e gerenciar dados de tarefas em múltiplos perfis com recursos avançados como abas arrastar e soltar, pesquisa em tempo real e atualização automática configurável. Veja a [documentação do Task Viewer](../../tools/task-viewer) para instruções de configuração e uso.

  <kbd><img src="../../tools/task-viewer/task-viewer-interface.png" alt="Interface do Task Viewer" /></kbd>
  
  <kbd><img src="../../tools/task-viewer/task-details-view.png" alt="Visualização de Detalhes da Tarefa" /></kbd>

- **<a id="sistema-gerenciamento-agentes"></a>Gerenciamento de Agentes**: Sistema abrangente de gerenciamento de subagentes para tratamento especializado de tarefas. Atribua agentes de IA específicos às tarefas, gerencie metadados de agentes e aproveite o sistema de agentes do Claude para execução otimizada de tarefas.

## 🧭 <a id="guia-uso"></a>Guia de Uso

O Shrimp Task Manager oferece uma abordagem estruturada para programação assistida por IA através de fluxos de trabalho guiados e gerenciamento sistemático de tarefas.

### O que é Shrimp?

Shrimp é essencialmente um modelo de prompt que guia Agentes de IA para melhor compreender e trabalhar com seu projeto. Ele usa uma série de prompts para garantir que o Agente se alinhe estreitamente com as necessidades específicas e convenções do seu projeto.

### Modo de Pesquisa na Prática

Antes de mergulhar no planejamento de tarefas, você pode aproveitar o modo de pesquisa para investigação técnica e coleta de conhecimento. Isso é particularmente útil quando:

- Você precisa explorar novas tecnologias ou frameworks
- Você quer comparar diferentes abordagens de solução
- Você está investigando melhores práticas para seu projeto
- Você precisa entender conceitos técnicos complexos

Simplesmente diga ao Agente "research [seu tópico]" ou "enter research mode for [tecnologia/problema]" para iniciar investigação sistemática. Os achados da pesquisa irão então informar seu planejamento de tarefas subsequente e decisões de desenvolvimento.

### Configuração Inicial

Ao trabalhar com um novo projeto, simplesmente diga ao Agente "init project rules". Isso guiará o Agente para gerar um conjunto de regras adaptadas aos requisitos específicos e estrutura do seu projeto.

### Processo de Planejamento de Tarefas

Para desenvolver ou atualizar funcionalidades, use o comando "plan task [sua descrição]". O sistema referenciará as regras previamente estabelecidas, tentará entender seu projeto, procurará por seções de código relevantes e proporá um plano abrangente baseado no estado atual do seu projeto.

*[Outras seções permanecem em inglês pois a tradução está em andamento]*

## 🏗️ <a id="visao-geral-arquitetura"></a>Visão Geral da Arquitetura

### Arquitetura Central

O MCP Shrimp Task Manager é construído como um servidor Model Context Protocol (MCP) que fornece capacidades estruturadas de gerenciamento de tarefas para agentes de IA através de fluxos de trabalho guiados e decomposição sistemática de tarefas.

#### 1. **Fundamentos do Servidor MCP**
- Construído sobre `@modelcontextprotocol/sdk` para conformidade com o protocolo MCP
- Usa transporte stdio para comunicação com clientes de IA
- Expõe 16 ferramentas especializadas via definições JSON Schema
- Suporta operações síncronas e assíncronas

#### 2. **Modelo de Dados de Tarefas** (`src/types/index.ts`, `src/models/taskModel.ts`)
- **Entidade de Tarefa**: Estrutura de dados central com ID único, nome, descrição, status e dependências
- **Estados de Tarefa**: PENDING → IN_PROGRESS → COMPLETED (ou BLOCKED)
- **Grafo de Dependências**: Gerencia relacionamentos de tarefas e ordem de execução
- **Arquivos Relacionados**: Rastreia arquivos associados a cada tarefa (TO_MODIFY, REFERENCE, CREATE, etc.)
- **Persistência**: Armazenamento de arquivos JSON com versionamento Git para histórico completo
- **Sistema de Memória**: Backups automáticos e preservação de histórico de tarefas de longo prazo

#### 3. **Arquitetura do Sistema de Ferramentas** (`src/tools/`)
O sistema fornece ferramentas especializadas organizadas em três categorias principais:

**Ferramentas de Gerenciamento de Tarefas:**
- `plan_task`: Converte linguagem natural em planos de desenvolvimento estruturados
- `analyze_task`: Análise técnica profunda com avaliação de complexidade
- `split_tasks`: Decomposição inteligente de tarefas complexas em subtarefas gerenciáveis
- `execute_task`: Implementação guiada com instruções passo a passo
- `verify_task`: Verificação de completude e garantia de qualidade
- `list_tasks`, `query_task`, `get_task_detail`: Inspeção e recuperação de tarefas
- `update_task`, `delete_task`, `clear_all_tasks`: Manipulação de tarefas

**Ferramentas Cognitivas:**
- `process_thought`: Framework de raciocínio em cadeia de pensamento para resolução de problemas complexos
- `reflect_task`: Análise pós-conclusão e extração de aprendizado
- `research_mode`: Investigação técnica sistemática com fluxos de trabalho guiados

**Ferramentas de Projeto:**
- `init_project_rules`: Estabelece convenções e padrões específicos do projeto

#### 4. **Sistema de Templates de Prompt** (`src/prompts/`)
- **Suporte Multi-idioma**: Templates em inglês e chinês tradicional
- **Geração Baseada em Templates**: Construção modular de prompts
- **Prompts Sensíveis ao Contexto**: Geração dinâmica de prompts baseada no estado da tarefa
- **Templates Customizáveis**: Sobreposição ou extensão via variáveis de ambiente
- **Carregamento de Templates**: Seleção dinâmica de templates baseada em configuração

#### 5. **Sistema de Integração de Agentes** (`src/utils/agentLoader.ts`)
- **Atribuição de Agentes**: Tarefas podem ser atribuídas a agentes de IA especializados
- **Metadados de Agentes**: Armazena capacidades e especializações de agentes
- **Correspondência de Agentes**: Seleção inteligente de agentes baseada nos requisitos das tarefas
- **Integração com Claude**: Integração perfeita com o sistema de agentes do Claude

### Fluxo de Dados e Fluxo de Trabalho

#### 1. **Fase de Planejamento de Tarefas**
```
Solicitação do Usuário → plan_task → analyze_task → split_tasks (se complexo)
```
- Linguagem natural é analisada e convertida em tarefas estruturadas
- Avaliação de complexidade determina se a divisão de tarefas é necessária
- Dependências são automaticamente identificadas e mapeadas

#### 2. **Fase de Execução**
```
execute_task → Guia de Implementação → Atualizações de Status → Rastreamento de Arquivos
```
- Guia de implementação passo a passo gerado
- Arquivos relacionados rastreados e monitorados
- Status de progresso atualizado em tempo real
- Commits do Git criados para controle de versão

#### 3. **Fase de Verificação**
```
verify_task → reflect_task → Resumo da Tarefa → Armazenamento na Memória
```
- Conclusão verificada contra critérios de aceitação
- Lições aprendidas extraídas para referência futura
- Resumo da tarefa gerado e armazenado
- Sistema de memória preserva conhecimento para tarefas futuras

#### 4. **Memória e Persistência**
- **Armazenamento Primário**: `tasks.json` no DATA_DIR
- **Controle de Versão**: Repositório Git rastreia todas as mudanças
- **Sistema de Backup**: Backups automáticos com timestamp
- **Diretório de Memória**: Armazenamento de longo prazo de tarefas concluídas
- **Isolamento de Projeto**: Protocolo ListRoots permite separação de dados por projeto

### Princípios de Design Chave

1. **Raciocínio em Cadeia de Pensamento**: Ferramentas guiam a IA através de processos de pensamento estruturados
2. **Refinamento Iterativo**: Tarefas podem ser analisadas, divididas e refinadas múltiplas vezes
3. **Preservação de Contexto**: Histórico do Git e sistema de memória previnem perda de contexto entre sessões
4. **Flexibilidade de Linguagem**: Suporte bilíngue com templates customizáveis
5. **Gerenciamento com Estado**: Armazenamento persistente mantém estado da tarefa entre conversas
6. **Fluxos de Trabalho Guiados**: Sistema guia ao invés de comandar, garantindo consistência

### Interfaces Web

#### 1. **GUI Web Integrada** (`src/web/webServer.ts`)
- Servidor Express.js opcional (ENABLE_GUI=true)
- Visualização de tarefas em tempo real
- Seleção automática de porta com fallback
- Gera WebGUI.md com URL de acesso

#### 2. **Ferramenta Task Viewer** (`tools/task-viewer/`)
- Aplicação React independente
- Suporte multi-perfil para diferentes projetos
- Monitoramento de tarefas em tempo real com atualização automática
- Interface arrastar e soltar para organização
- Integração de gerenciamento de agentes

### Pontos de Integração

- **Protocolo MCP**: Protocolo padrão para interação com modelos de IA
- **Sistema de Arquivos**: Manipulação direta de arquivos para dados de tarefas
- **Integração Git**: Controle de versão para histórico de tarefas
- **Variáveis de Ambiente**: Opções de configuração extensivas
- **APIs Web**: Endpoints RESTful para interação com GUI

## 🔧 Implementação Técnica

- **Node.js**: Ambiente de execução JavaScript de alta performance
- **TypeScript**: Fornece ambiente de desenvolvimento type-safe
- **MCP SDK**: Interface para interação perfeita com Large Language Models
- **UUID**: Gera identificadores únicos e confiáveis para tarefas
- **Express.js**: Servidor web para GUI opcional
- **Git**: Controle de versão para histórico de tarefas

*[Outras seções serão traduzidas quando a tradução completa for solicitada]*

## 📄 <a id="licenca"></a>Licença

Este projeto está licenciado sob a Licença MIT - veja o arquivo [LICENSE](../../LICENSE) para detalhes.

## <a id="modelos-recomendados"></a>Modelos Recomendados

Para a melhor experiência, recomendamos usar os seguintes modelos:

- **Claude 3.7**: Oferece fortes capacidades de compreensão e geração.
- **Gemini 2.5**: O modelo mais recente do Google, tem excelente desempenho.

Devido às diferenças nos métodos de treinamento e capacidades de compreensão entre modelos, usar outros modelos pode levar a resultados variados para os mesmos prompts. Este projeto foi otimizado para Claude 3.7 e Gemini 2.5.

## Star History

[![Star History Chart](https://api.star-history.com/svg?repos=cjo4m06/mcp-shrimp-task-manager&type=Timeline)](https://www.star-history.com/#cjo4m06/mcp-shrimp-task-manager&Timeline)