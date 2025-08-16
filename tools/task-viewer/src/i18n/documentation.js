export const documentation = {
  en: {
    releaseNotes: {
      header: '📋 Release Notes',
      versions: 'Versions',
      loading: 'Loading release notes...',
      notFound: 'Release notes not found.',
      error: 'Error loading release notes.',
      copy: 'Copy',
      copied: 'Copied!'
    },
    help: {
      header: 'ℹ️ Help & Documentation',
      loading: 'Loading documentation...',
      notFound: 'README not found.',
      error: 'Error loading README.',
      copy: 'Copy',
      copied: 'Copied!'
    },
    releases: {
      'v2.1.0': {
        title: '🚀 Task Viewer v2.1.0 Release Notes',
        date: 'Released: July 29, 2025',
        content: ``
      },
      'v2.0.0': {
        title: 'Task Viewer v2.0.0 Release Notes',
        date: 'Released: July 27, 2025',
        content: ``
      }
    },
    readme: {
      title: '🦐 Shrimp Task Manager Viewer',
      content: ``
    }
  },
  zh: {
    releaseNotes: {
      header: '📋 发布说明',
      versions: '版本',
      loading: '正在加载发布说明...',
      notFound: '未找到发布说明。',
      error: '加载发布说明时出错。',
      copy: '复制',
      copied: '已复制！'
    },
    help: {
      header: 'ℹ️ 帮助与文档',
      loading: '正在加载文档...',
      notFound: '未找到 README。',
      error: '加载 README 时出错。',
      copy: '复制',
      copied: '已复制！'
    },
    releases: {
      'v2.1.0': {
        title: '🚀 任务查看器 v2.1.0 发布说明',
        date: '发布日期：2025年7月29日',
        content: ``
      },
      'v2.0.0': {
        title: '任务查看器 v2.0.0 发布说明',
        date: '发布日期：2025年7月27日',
        content: ``
      }
    },
    readme: {
      title: '🦐 虾任务管理器查看器',
      content: ``
    }
  },
  es: {
    releaseNotes: {
      header: '📋 Notas de la Versión',
      versions: 'Versiones',
      loading: 'Cargando notas de la versión...',
      notFound: 'Notas de la versión no encontradas.',
      error: 'Error al cargar las notas de la versión.',
      copy: 'Copiar',
      copied: '¡Copiado!'
    },
    help: {
      header: 'ℹ️ Ayuda y Documentación',
      loading: 'Cargando documentación...',
      notFound: 'README no encontrado.',
      error: 'Error al cargar el README.',
      copy: 'Copiar',
      copied: '¡Copiado!'
    },
    releases: {
      'v2.1.0': {
        title: '🚀 Notas de la Versión v2.1.0 del Visor de Tareas',
        date: 'Lanzado: 29 de julio de 2025',
        content: ``
      },
      'v2.0.0': {
        title: 'Notas de la Versión v2.0.0 del Visor de Tareas',
        date: 'Lanzado: 27 de julio de 2025',
        content: ``
      }
    },
    readme: {
      title: '🦐 Visor del Gestor de Tareas Shrimp',
      content: ``
    }
  }
};

export const getReleaseContent = (version, language = 'en') => {
  return documentation[language]?.releases[version] || documentation.en.releases[version] || null;
};

export const getReadmeContent = (language = 'en') => {
  return documentation[language]?.readme || documentation.en.readme;
};

export const getUIStrings = (component, language = 'en') => {
  return documentation[language]?.[component] || documentation.en[component];
};