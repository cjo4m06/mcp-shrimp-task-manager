// Metadados de lançamento apenas - o conteúdo real é carregado dos arquivos /releases/*.md
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Sistema de Armazenamento de Resumos de Conclusão de Tarefas',
    summary: 'Detalhes aprimorados de conclusão de tarefas com modelo de dados estruturado e recursos inteligentes de análise de resumos'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Notas de Lançamento Aprimoradas e Sistema de Arquivo',
    summary: 'Rastreamento de contexto com Exibição de Solicitação Inicial, resumos baseados em IA, Notas de Lançamento aprimoradas com sumário, e gerenciamento abrangente de Arquivos'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Exibição de Solicitação Inicial',
    summary: 'Captura e exibe a solicitação original do usuário que iniciou o planejamento de tarefas, fornecendo contexto essencial para listas de tarefas'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internacionalização, Histórico de Tarefas, Sub-agentes, Lightbox',
    summary: 'Suporte multi-idioma, personalização de modelos, histórico de projetos, gerenciamento de agentes, lightbox de imagens, e grandes melhorias na interface'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Gerenciamento Aprimorado de Tarefas e Integração com VS Code',
    summary: 'Links de arquivos do VS Code, gerenciamento melhorado de UUID, coluna de dependências, e notas de lançamento integradas ao aplicativo'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Lançamento Inicial Independente',
    summary: 'Visualizador de tarefas baseado na web com gerenciamento de perfis, atualizações em tempo real, e interface moderna'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};