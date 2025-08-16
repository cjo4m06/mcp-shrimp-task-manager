export const esDocumentation = {
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
      content: `# 🚀 Notas de la Versión v2.1.0 del Visor de Tareas

*Lanzado: 29 de julio de 2025*

## 🎉 Novedades

### 🔗 Rutas de Archivo Clicables con Soporte de Raíz del Proyecto
**¡Copia rutas completas de archivos con un clic!**

- **Rutas de Archivo con Clic para Copiar**: Ahora cuando haces clic en una tarea y vas a la página de Detalles de la Tarea, si hay archivos relacionados listados que la tarea modifica o crea, ese nombre de archivo ahora tendrá un hipervínculo al archivo real en tu sistema de archivos (siempre que configures la carpeta del proyecto al crear/editar la pestaña del perfil)

### 📋 Gestión Mejorada de UUID
**Copia simplificada de UUID con interacciones intuitivas**

Al interactuar con Claude, a veces es útil referenciar fácilmente una tarea shrimp, por ejemplo:
"Claude, por favor completa esta tarea shrimp: da987923-2afe-4ac3-985e-ac029cc831e7". Por lo tanto, agregamos una función de Clic para copiar en las insignias de Tarea # y en el UUID listado en la columna Nombre de Tarea.

- **Clic para Copiar Insignias de Tarea**: Haz clic en cualquier insignia de número de tarea para copiar instantáneamente su UUID
- **UUID concatenado mostrado bajo el nombre de la tarea en la Columna Nombre de Tarea**: Haz clic en el UUID para copiar

### 🔄 Columna de Dependencias de Tareas para Paralelización Fácil

Agregamos una columna de Dependencias que lista los UUID vinculados de cualquier tarea dependiente. Ahora puedes navegar fácilmente a las tareas dependientes.

### 🤖 Acciones de Instrucciones de IA
**Instrucciones de tareas de IA con un clic**

Agregamos una Columna de Acciones que tiene un emoji de Robot útil. Si haces clic en el emoji, copiará una Instrucción de IA al portapapeles que luego puedes pegar en el chat de tu agente. La instrucción ha sido codificada para copiar lo siguiente: "Usa el administrador de tareas para completar esta tarea shrimp: < UUID >"

Esta instrucción es útil para la paralelización. Por ejemplo, si las siguientes 3 tareas no tienen dependencias, puedes abrir varias ventanas de terminal y pegar las Instrucciones de IA. Ejemplo:

Terminal 1: Usa el administrador de tareas para completar esta tarea shrimp: da987923-2afe-4ac3-985e-ac029cc831e7
Terminal 2: Usa el administrador de tareas para completar esta tarea shrimp: 4afe3f1c-bf7f-4642-8485-668c33a1e0fc
Terminal 3: Usa el administrador de tareas para completar esta tarea shrimp: 21bd2cb9-4109-4897-9904-885ee2b0792e

### ✏️ Botón de Edición de Perfil

**Configuración de Raíz del Proyecto**: Ahora puedes establecer la raíz del proyecto por perfil, esto te permitirá habilitar la copia completa de rutas de archivos cuando veas "archivos relacionados" al ver la página de detalles de la tarea.

**Capacidad para Renombrar un Perfil**: Ahora puedes renombrar una pestaña de perfil sin tener que eliminar y recrear.

## 🔄 Cambios

### Mejoras de UI/UX
- **Acciones de Copia Simplificadas**: Copia de UUID consolidada solo al clic de la insignia de tarea
- **Dependencias sobre Notas**: Reemplazó la columna de Notas con la columna de Dependencias más útil
- **Notas de Versión en la Aplicación**: Las notas de versión para el visor de tareas se muestran en el banner superior
- **Navegación Basada en Pestañas**: Notas de versión integradas en el sistema de pestañas con funcionalidad de cierre

### Actualizaciones de Arquitectura
- **Compatibilidad con Módulos ES**: Se eliminó la dependencia de busboy para mejor soporte de módulos ES
- **Análisis de Formularios Nativo**: Se reemplazó el análisis de formularios de terceros con funciones integradas de Node.js
- **Actualización de Versión**: Actualizado a v2.1.0 (para el visor de tareas) para reflejar adiciones significativas de características

## 🐛 Correcciones de Errores

### 🚨 CORRECCIÓN CRÍTICA: La Carga de Archivos Crea Copias Estáticas
**El Problema**: Al agregar perfiles cargando un archivo tasks.json, el sistema estaba creando una copia estática en el directorio \`/tmp/\`. Esto significaba que cualquier cambio en tu archivo de tareas real NO se reflejaría en el visor: las tareas aparecerían atascadas en su estado original (por ejemplo, mostrando "en progreso" cuando en realidad estaban "completadas").

**La Solución**: Se eliminó completamente la carga de archivos. Ahora debes ingresar la ruta de la carpeta directamente, y el sistema agrega automáticamente \`/tasks.json\`. Esto asegura que el visor siempre lea desde tu archivo real en vivo.

**Cómo usar**:
1. Navega a tu carpeta de datos shrimp en la terminal
2. Escribe \`pwd\` para obtener la ruta completa (resaltada en amarillo en la UI)
3. Pega esta ruta en el campo "Ruta de la Carpeta de Tareas"
4. El sistema usa automáticamente \`[tu-ruta]/tasks.json\`

### Gestión de Perfiles
- **Auto-Selección Corregida**: Los nuevos perfiles ahora se seleccionan y cargan automáticamente después de la creación
- **Problemas de Importación Resueltos**: Se corrigieron problemas de importación de módulos ES con la biblioteca busboy
- **Modal de Edición Unificado**: Se combinó el renombrado y la edición de raíz del proyecto en una sola interfaz

### Manejo de Datos
- **Persistencia de Raíz del Proyecto**: Las rutas de raíz del proyecto ahora se guardan correctamente con los datos del perfil
- **Carga de Tareas**: Se corrigieron las condiciones de carrera al cambiar entre perfiles
- **Gestión de Estado**: Manejo mejorado del estado de selección de perfil

## 🗑️ Eliminado

### Características Obsoletas
- **Dependencia de Busboy**: Reemplazada con análisis de formularios nativo de Node.js
- **Columna de Notas**: Reemplazada por la columna de Dependencias más útil
- **Botones de Copia Individuales**: Copia de UUID consolidada al clic de la insignia de tarea
- **Botón de Renombrar Separado**: Fusionado en el botón unificado de Editar Perfil

## 📝 Detalles Técnicos

### Nuevos Endpoints de API
- **PUT /api/update-profile/:id**: Actualizar nombre y configuración del perfil
- **Mejorado /api/tasks/:id**: Ahora incluye projectRoot en la respuesta
- **GET /releases/*.md**: Servir archivos markdown de notas de versión

### Componentes del Frontend
- **Componente ReleaseNotes**: Hermosas notas de versión renderizadas en markdown
- **TaskTable Mejorado**: Soporte para columnas de dependencias y acciones
- **TaskDetailView Mejorado**: Rutas de archivo clicables con copia de ruta completa

### Configuración
- **Almacenamiento de Raíz del Proyecto**: Los perfiles ahora almacenan la ruta opcional de projectRoot
- **Persistencia de Configuración**: Todos los datos del perfil se guardan en ~/.shrimp-task-viewer-settings.json

## 🎯 Resumen

La versión 2.1.0 transforma el Visor de Tareas en una herramienta de desarrollo más integrada con gestión mejorada de rutas de archivos, manejo mejorado de UUID y mejor visualización de relaciones de tareas. La gestión unificada de perfiles y las notas de versión en la aplicación proporcionan una experiencia de usuario más cohesiva mientras mantienen la interfaz limpia e intuitiva.`
    },
    'v2.0.0': {
      title: 'Notas de la Versión v2.0.0 del Visor de Tareas',
      date: 'Lanzado: 27 de julio de 2025',
      content: `# Notas de la Versión v2.0.0 del Visor de Tareas

*Lanzado: 27 de julio de 2025*

## 🚀 Lanzamiento Independiente Inicial

### Características Principales
- **Visor de Tareas Basado en Web**: Interfaz moderna con gestión de perfiles
- **Actualizaciones en Tiempo Real**: Actualización automática del estado de las tareas
- **UI Moderna**: Tema oscuro con diseño responsivo
- **Gestión de Perfiles**: Soporte para seguimiento de tareas de múltiples proyectos

### Stack Tecnológico
- React 19 + Vite
- TanStack Table
- Backend Node.js
- Desarrollo con recarga en caliente

## 🎉 Nuevas Características
- Reordenamiento de pestañas con arrastrar y soltar
- Búsqueda y filtrado avanzados
- Intervalos de actualización automática configurables
- Panel de estadísticas de tareas

## 🔧 Instalación
\`\`\`bash
npm install
npm run build
npm start
\`\`\`

El visor estará disponible en http://localhost:9998`
    }
  },
  readme: {
    title: '🦐 Visor del Gestor de Tareas Shrimp',
    content: `# 🦐 Visor del Gestor de Tareas Shrimp

Una interfaz web moderna basada en React para ver y gestionar tareas del [Gestor de Tareas Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) creadas a través de la herramienta MCP (Protocolo de Contexto del Modelo). Esta interfaz visual te permite ver información detallada de las tareas, rastrear el progreso en múltiples proyectos y copiar fácilmente los UUID de las tareas para las interacciones con agentes de IA.

## ¿Por qué usar el Visor de Tareas Shrimp?

Al usar el Gestor de Tareas Shrimp como servidor MCP con agentes de IA como Claude, este visor proporciona visibilidad esencial sobre tu ecosistema de tareas:

- **Vista General Visual de Tareas**: Ve todas las tareas, su estado, dependencias y progreso en una interfaz de pestañas limpia
- **Gestión de UUID**: Haz clic en cualquier insignia de tarea para copiar instantáneamente su UUID para comandos como \`"Usa el administrador de tareas para completar esta tarea shrimp: [UUID]"\`
- **Ejecución Paralela**: Abre múltiples terminales y usa la columna de Acciones de IA (🤖) para copiar instrucciones de tareas para ejecución paralela de agentes de IA
- **Actualizaciones en Vivo**: La lectura directa de rutas de archivos asegura que siempre veas el estado actual de las tareas
- **Soporte Multi-Proyecto**: Gestiona tareas en diferentes proyectos con pestañas de perfil arrastrables

Para información sobre cómo configurar el Gestor de Tareas Shrimp como servidor MCP, consulta el [repositorio principal](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 🌟 Características

### 🏷️ Interfaz de Pestañas Moderna
- **Pestañas Arrastrables**: Reordena perfiles arrastrando pestañas
- **Diseño Profesional**: Pestañas estilo navegador que se conectan perfectamente con el contenido
- **Retroalimentación Visual**: Indicación clara de pestaña activa y efectos al pasar el cursor
- **Agregar Nuevos Perfiles**: Botón integrado "+ Agregar Pestaña" que coincide con el diseño de la interfaz

### 🔍 Búsqueda y Filtrado Avanzados
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de tareas por nombre, descripción, estado o ID
- **Columnas Ordenables**: Haz clic en los encabezados de columna para ordenar por cualquier campo
- **TanStack Table**: Potente componente de tabla con paginación y filtrado
- **Diseño Responsivo**: Funciona perfectamente en escritorio, tableta y móvil

### 🔄 Auto-Actualización Inteligente
- **Intervalos Configurables**: Elige entre 5s, 10s, 15s, 30s, 1m, 2m o 5m
- **Controles Inteligentes**: Alternar auto-actualización con selección de intervalo
- **Indicadores Visuales**: Estados de carga y estado de actualización
- **Actualización Manual**: Botón de actualización dedicado para actualizaciones bajo demanda

### 📊 Gestión Integral de Tareas
- **Estadísticas de Tareas**: Conteos en vivo para tareas Totales, Completadas, En Progreso y Pendientes
- **Gestión de Perfiles**: Agregar/eliminar/reordenar perfiles a través de una interfaz intuitiva
- **Configuración Persistente**: Las configuraciones de perfil se guardan entre sesiones
- **Recarga en Caliente**: Modo de desarrollo con actualizaciones instantáneas

### 🎨 UI/UX Profesional
- **Tema Oscuro**: Optimizado para entornos de desarrollo
- **Diseño Responsivo**: Se adapta a todos los tamaños de pantalla
- **Accesibilidad**: Navegación completa por teclado y soporte para lectores de pantalla
- **Elementos Interactivos**: Información sobre herramientas al pasar el cursor y retroalimentación visual en toda la aplicación

## 🚀 Inicio Rápido

### Instalación y Configuración

1. **Clona y navega al directorio del visor de tareas**
   \`\`\`bash
   cd ruta/a/mcp-shrimp-task-manager/tools/task-viewer
   \`\`\`

2. **Instala las dependencias**
   \`\`\`bash
   npm install
   \`\`\`

3. **Construye la aplicación React**
   \`\`\`bash
   npm run build
   \`\`\`

4. **Inicia el servidor**
   \`\`\`bash
   npm start
   \`\`\`

   El visor estará disponible en \`http://localhost:9998\`

### Modo de Desarrollo

Para desarrollo con recarga en caliente:

\`\`\`bash
# Inicia el servidor de desarrollo
npm run dev
\`\`\`

La aplicación estará disponible en \`http://localhost:3000\` con reconstrucción automática al cambiar archivos.

## 🖥️ Uso

### Primeros Pasos

1. **Inicia el servidor**:
   \`\`\`bash
   npm start
   \`\`\`

2. **Abre tu navegador**:
   Navega a \`http://127.0.0.1:9998\`

3. **Agrega tu primer perfil**:
   - Haz clic en el botón "**+ Agregar Pestaña**"
   - Ingresa un nombre descriptivo para el perfil (ej., "Tareas del Equipo Alpha")
   - Ingresa la ruta a tu carpeta de datos shrimp que contiene tasks.json
   - **Consejo:** Navega a tu carpeta en la terminal y escribe \`pwd\` para obtener la ruta completa
   - Haz clic en "**Agregar Perfil**"

4. **Gestiona tus tareas**:
   - Cambia entre perfiles usando las pestañas
   - Busca tareas usando el cuadro de búsqueda
   - Ordena columnas haciendo clic en los encabezados
   - Configura la auto-actualización según sea necesario

### Gestión de Pestañas

- **Cambiar Perfiles**: Haz clic en cualquier pestaña para cambiar a ese perfil
- **Reordenar Pestañas**: Arrastra las pestañas para reorganizarlas en tu orden preferido
- **Agregar Nuevo Perfil**: Haz clic en el botón "**+ Agregar Pestaña**"
- **Eliminar Perfil**: Haz clic en la × en cualquier pestaña (con confirmación)

## 📄 Licencia

Licencia MIT - consulta la licencia del proyecto principal para más detalles.

## 🤝 Contribuir

Esta herramienta es parte del proyecto MCP Gestor de Tareas Shrimp. ¡Las contribuciones son bienvenidas!

---

**¡Feliz gestión de tareas! 🦐✨**

Construido con ❤️ usando React, Vite y tecnologías web modernas.`
  }
};