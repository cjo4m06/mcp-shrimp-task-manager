// Metadatos de versiones únicamente - el contenido real se carga desde archivos /releases/*.md
export const releaseMetadata = [
  {
    version: 'v4.1.0',
    date: '2025-09-06',
    title: 'Sistema de Almacenamiento de Resúmenes de Finalización de Tareas',
    summary: 'Detalles mejorados de finalización de tareas con modelo de datos estructurado y capacidades inteligentes de análisis de resúmenes'
  },
  {
    version: 'v4.0.0',
    date: '2025-09-03',
    title: 'Notas de Versión Mejoradas y Sistema de Archivo',
    summary: 'Seguimiento de contexto con Visualización de Solicitud Inicial, resúmenes potenciados por IA, Notas de Versión mejoradas con TOC y gestión integral de Archivo'
  },
  {
    version: 'v3.1.0',
    date: '2025-08-31',
    title: 'Visualización de Solicitud Inicial',
    summary: 'Captura y muestra la solicitud original del usuario que inició la planificación de tareas, proporcionando contexto esencial para las listas de tareas'
  },
  {
    version: 'v3.0.0',
    date: '2025-08-01',
    title: 'Internacionalización, Historial de Tareas, Sub-agentes, Lightbox',
    summary: 'Soporte multi-idioma, personalización de plantillas, historial de proyectos, gestión de agentes, lightbox de imágenes y mejoras importantes de UI'
  },
  {
    version: 'v2.1.0',
    date: '2025-07-29',
    title: 'Gestión de Tareas Mejorada e Integración con VS Code',
    summary: 'Enlaces de archivos de VS Code, gestión mejorada de UUID, columna de dependencias y notas de versión integradas en la aplicación'
  },
  {
    version: 'v2.0.0',
    date: '2025-07-27',
    title: 'Versión Independiente Inicial',
    summary: 'Visualizador de tareas basado en web con gestión de perfiles, actualizaciones en tiempo real e interfaz de usuario moderna'
  }
];

export const getLatestVersion = () => releaseMetadata[0];

export const getReleaseFile = (version) => {
  return `/releases/${version}.md`;
};