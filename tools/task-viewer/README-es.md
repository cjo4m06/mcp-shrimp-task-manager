# 🦐 Visor del Gestor de Tareas Shrimp

Una interfaz web moderna basada en React para visualizar y gestionar las tareas del [Gestor de Tareas Shrimp](https://github.com/cjo4m06/mcp-shrimp-task-manager) creadas a través de la herramienta MCP (Model Context Protocol). Esta interfaz visual le permite ver información detallada de las tareas, hacer seguimiento del progreso en múltiples proyectos y copiar instantáneamente comandos de agentes IA listos para ejecutar para la ejecución paralela de tareas.

## ¿Por qué usar el Visor de Tareas Shrimp?

El Visor del Gestor de Tareas Shrimp fue construido por desarrolladores para desarrolladores como una herramienta esencial para visualizar y gestionar los flujos de trabajo complejos de tareas que ejecutan los agentes IA. Cuando está trabajando con asistentes IA como Claude a través del MCP (Model Context Protocol), es crucial tener visibilidad en tiempo real de qué tareas se están planificando, cuáles están en progreso y cómo se interconectan a través de dependencias. Este visor transforma los datos abstractos de tareas en una interfaz visual intuitiva que le permite monitorear, controlar y optimizar su flujo de trabajo de desarrollo impulsado por IA.

El visor sobresale en permitir a los desarrolladores trabajar en múltiples proyectos simultáneamente. Puede mantener listas de tareas separadas para diferentes características o experimentos, cambiar rápidamente entre ellas usando pestañas de perfil e incluso archivar flujos de trabajo completados para referencia futura. Cuando un error crítico interrumpe el desarrollo de su característica, simplemente archive su lista de tareas actual, cambie perfiles para manejar el problema urgente, luego regrese sin problemas a su trabajo original con todo el contexto preservado.

El verdadero poder de esta herramienta radica en su soporte para la ejecución paralela de agentes IA. La columna de Acciones IA (🤖) proporciona acceso con un clic a comandos completos y listos para ejecutar que puede pegar directamente en múltiples sesiones de terminal o conversaciones IA. En lugar de construir manualmente comandos o copiar UUIDs, obtiene instantáneamente instrucciones formateadas como `"use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id]"` que le dicen al agente IA exactamente qué hacer. Esto permite una verdadera paralelización: abra cinco ventanas de terminal, asigne diferentes tareas a diferentes agentes IA y véalos trabajar concurrentemente en su proyecto. Con actualizaciones en vivo que reflejan cambios en tiempo real y seguimiento completo de dependencias, esta herramienta cierra la brecha entre la planificación IA y la supervisión humana, asegurando que siempre entienda exactamente qué están haciendo sus asistentes IA y maximizando su rendimiento de desarrollo a través de la paralelización inteligente.

Para información sobre cómo configurar el Gestor de Tareas Shrimp como servidor MCP, vea el [repositorio principal](https://github.com/cjo4m06/mcp-shrimp-task-manager).

## 📖 Documentación de Pestañas

![Resumen de Pestañas](Screenshots/tabs.png)

## 📋 Pestaña de Tareas

La pestaña principal de Tareas es su centro de comando para la gestión de tareas. Proporciona una vista completa de todas las tareas en el perfil seleccionado con características poderosas para organización y ejecución.

![Resumen de la Pestaña de Tareas](task-viewer-interface.png)

**Características Clave:**
- **Tabla de Tareas**: Muestra todas las tareas con columnas ordenables incluyendo Nº de Tarea, Estado, Agente, Fecha de Creación, Nombre, Dependencias y Acciones
- **Insignias de Estado**: Insignias codificadas por color (🟡 Pendiente, 🔵 En Progreso, 🟢 Completada, 🔴 Bloqueada)
- **Asignación de Agentes**: Selector desplegable para asignar agentes IA específicos a las tareas
- **Ventana Emergente del Visualizador de Agentes**: Haga clic en el ícono del ojo (👁️) para abrir una ventana emergente donde puede navegar y seleccionar agentes
- **Columna de Dependencias**: Muestra IDs de tareas vinculadas con funcionalidad de clic para navegar
- **Columna de Acciones**: Contiene el poderoso emoji robot (🤖) para la ejecución de tareas IA
- **Navegación de Detalles de Tareas**: Al ver detalles de tareas, use los botones ← Anterior y Siguiente → para navegar rápidamente entre tareas

#### 🤖 Emoji Robot - Ejecución de Tareas IA

El emoji robot en la columna de Acciones es una característica poderosa para la ejecución de tareas asistida por IA:

![Información sobre el Emoji Robot](releases/agent-copy-instruction-tooltip.png)

**Cómo funciona:**
1. **Haga clic en el emoji 🤖** para copiar una instrucción de ejecución de tarea a su portapapeles
2. **Para tareas con agentes**: Copia `use the built in subagent located in ./claude/agents/[agent-name] to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
3. **Para tareas sin agentes**: Copia `Use task manager to complete this shrimp task: [task-id] please when u start working mark the shrimp task as in progress`
4. **Retroalimentación visual**: El emoji cambia brevemente a ✓ para confirmar la acción de copia

**Casos de Uso:**
- **Ejecución Paralela**: Abra múltiples ventanas de terminal con diferentes agentes IA y pegue instrucciones para procesamiento concurrente de tareas
- **Especialización de Agentes**: Asigne agentes especializados (ej., `react-components.md`, `database-specialist.md`) a las tareas apropiadas
- **Transferencia Rápida**: Delegue rápidamente tareas a agentes IA sin escribir comandos complejos

#### 🤖 Asignación Masiva de Agentes Impulsada por IA

La pestaña de Tareas ahora incluye asignación masiva de agentes impulsada por IA usando GPT-4 de OpenAI:

**Cómo usar:**
1. **Seleccionar Tareas**: Use las casillas de verificación para seleccionar múltiples tareas que necesitan asignación de agentes
2. **Barra de Acciones Masivas**: Aparece una barra azul mostrando "🤖 AI Assign Agents (X tareas seleccionadas)"
3. **Asignación con Un Clic**: Haga clic en el botón para que GPT-4 analice las tareas y asigne los agentes apropiados
4. **Coincidencia Automática**: La IA considera las descripciones de tareas, dependencias y capacidades de agentes

**Requisitos de Configuración:**
1. **Configurar Clave API**: Navegue a Configuración → Pestaña de Configuración Global
2. **Ingresar Clave OpenAI**: Pegue su clave API de OpenAI en el campo (se muestra como ✓ Configurada cuando está establecida)
3. **Método Alternativo**: Establezca la variable de entorno `OPENAI_API_KEY` o `OPEN_AI_KEY_SHRIMP_TASK_VIEWER`
4. **Obtener Clave API**: Visite [OpenAI Platform](https://platform.openai.com/api-keys) para generar una clave

![Clave OpenAI de Configuración Global](releases/global-settings-openai-key.png)
*La pestaña de Configuración Global proporciona un campo seguro para configurar su clave API de OpenAI*

#### 📝 Vista de Detalles de Tareas

Haga clic en cualquier fila de tarea para abrir la vista detallada con información completa:

**Características:**
- **Información Completa de la Tarea**: Vea descripciones completas, notas, guías de implementación y criterios de verificación
- **Navegación de Tareas**: Use los botones ← Anterior y Siguiente → para moverse entre tareas sin regresar a la lista
- **Archivos Relacionados**: Vea todos los archivos asociados con la tarea con números de línea
- **Gráfico de Dependencias**: Representación visual de las dependencias de tareas
- **Modo de Edición**: Haga clic en Editar para modificar detalles de la tarea (para tareas no completadas)
- **Acciones Rápidas**: Copie el ID de la tarea, vea JSON en bruto o elimine la tarea

**Beneficios de Navegación:**
- **Revisión Eficiente**: Revise rápidamente múltiples tareas en secuencia
- **Preservación del Contexto**: Permanezca en vista detallada mientras se mueve entre tareas
- **Soporte de Teclado**: Use las teclas de flecha para navegación aún más rápida

#### 📤 Característica de Exportación

Exporte sus datos de tareas en múltiples formatos para informes, respaldo o propósitos de intercambio:

**Opciones de Exportación:**
- **Formato JSON**: Datos completos de tareas con todos los metadatos, perfecto para respaldo e intercambio de datos
- **Formato CSV**: Formato tabular ideal para análisis de hojas de cálculo e informes
- **Formato Markdown**: Formato legible por humanos con tareas numeradas y visualización de solicitud inicial

**Características de Exportación:**
- **Tareas Numeradas**: Todos los formatos de exportación incluyen numeración secuencial de tareas para referencia fácil
- **Visualización de Solicitud Inicial**: Los archivos exportados incluyen la solicitud inicial del proyecto para contexto
- **Datos Completos**: Toda la información de tareas incluyendo descripciones, estado, dependencias y metadatos
- **Listo para Descarga**: Los archivos se formatean automáticamente y están listos para descarga inmediata

**Cómo Exportar:**
1. Navegue a la lista de tareas de cualquier proyecto
2. Haga clic en el botón "Exportar" en el área superior derecha
3. Elija su formato preferido (JSON, CSV o Markdown)
4. El archivo se descarga automáticamente con un nombre de archivo con marca de tiempo

## 📊 Pestaña de Historial de Tareas

La pestaña de Historial de Tareas proporciona información valiosa sobre la evolución de su proyecto al mostrar instantáneas de tareas completadas guardadas por el Gestor de Tareas Shrimp.

![Resumen del Historial de Tareas](releases/project-history-view.png)

**Características:**
- **Vista de Cronología**: Navegue a través de instantáneas históricas de los estados de tareas de su proyecto
- **Archivos de Memoria**: Guardados automáticamente por el Gestor de Tareas Shrimp al iniciar nuevas sesiones
- **Evolución de Tareas**: Haga seguimiento de cómo las tareas progresaron desde la creación hasta la finalización
- **Sistema de Notas**: Agregue anotaciones personales a entradas históricas

![Detalle del Historial de Tareas](releases/project-history-detail-view.png)

**Navegación:**
- Haga clic en cualquier entrada histórica para ver el estado detallado de las tareas en ese momento
- Use los botones de navegación para moverse entre diferentes instantáneas
- Busque y filtre tareas históricas igual que en la vista principal de tareas

## 🤖 Pestaña de Sub-Agentes

La pestaña de Sub-Agentes le permite gestionar agentes IA especializados que pueden ser asignados a tareas para ejecución óptima.

![Vista de Lista de Agentes con Instrucción IA](releases/agent-list-view-with-ai-instruction.png)

**Características:**
- **Biblioteca de Agentes**: Vea todos los agentes disponibles de su carpeta `.claude/agents`
- **Columna de Instrucción IA**: Haga clic en el emoji robot (🤖) para copiar instantáneamente las instrucciones de uso del agente
  - Ejemplo: `use subagent debugger.md located in ./claude/agents to perform:`
  - No necesita escribir manualmente rutas de agentes o recordar sintaxis
  - La retroalimentación visual confirma la copia exitosa al portapapeles
- **Editor de Agentes**: Editor markdown integrado para crear y modificar agentes
- **Codificación por Colores**: Asigne colores a los agentes para organización visual
- **Asignación de Agentes**: Asigne fácilmente agentes a tareas a través del menú desplegable en la tabla de tareas
- **Ventana Emergente del Visualizador de Agentes**: Haga clic en el ícono del ojo (👁️) para navegar y seleccionar agentes

![Editor de Agentes](releases/agent-editor-color-selection.png)

**Flujo de Trabajo de Asignación de Agentes:**

![Menú Desplegable de Agentes](releases/agent-dropdown-task-table.png)

1. **Seleccione un agente** del menú desplegable en la tabla de tareas
2. **O haga clic en el ícono del ojo (👁️)** para abrir la ventana emergente del visualizador de agentes
3. **Navegue a través de agentes** en la ventana emergente para encontrar el adecuado para su tarea
4. **Guardar automáticamente** actualiza los metadatos de la tarea
5. **Use el emoji robot** para copiar instrucciones de ejecución específicas del agente

![Ventana Emergente del Visualizador de Agentes](releases/agent-viewer-popup.png)
*La ventana emergente del visualizador de agentes le permite navegar por todos los agentes disponibles y seleccionar el mejor para cada tarea*

## 🎨 Pestaña de Plantillas

Gestione plantillas de instrucciones IA que guían cómo el Gestor de Tareas Shrimp analiza y ejecuta diferentes tipos de operaciones.

![Gestión de Plantillas](releases/template-management-system.png)

**Capacidades:**
- **Editor de Plantillas**: Editor markdown completo con resaltado de sintaxis
- **Tipos de Plantillas**: Estados Predeterminado, Personalizado y Personalizado+Anexar
- **Vista Previa en Vivo**: Vea los efectos de las plantillas antes de la activación
- **Exportar/Importar**: Comparta plantillas con miembros del equipo

## 📦 Pestaña de Archivos de Tareas

La pestaña de Archivos de Tareas proporciona poderosas capacidades de archivo y restauración de listas de tareas, permitiendo guardar instantáneas de sus tareas actuales y restaurarlas más tarde.

**Características Clave:**
- **Archivo de Lista de Tareas**: Guarde el estado actual de todas las tareas como un archivo con marca de tiempo
- **Gestión de Archivos**: Vea todas las listas de tareas archivadas con información detallada
- **Opciones de Importación Flexibles**: Elija anexar tareas archivadas a tareas actuales o reemplazar todas las tareas actuales
- **Estadísticas de Archivo**: Vea estadísticas de finalización para cada lista de tareas archivada
- **Exportación de Datos**: Exporte listas de tareas en múltiples formatos (JSON, CSV, Markdown) con tareas numeradas

**Flujo de Trabajo de Archivo:**

![Diálogo de Archivo](releases/archive-dialog.png)
*El diálogo Archivar Tareas Actuales que aparece cuando presiona el botón Archivar, mostrando un resumen de lo que se archivará incluyendo nombre del proyecto, conteos de tareas y la solicitud inicial completa*

1. **Crear Archivo**: Haga clic en el botón "Archivar Tareas" para guardar el estado actual de las tareas
2. **Navegar Archivos**: Vea todas las listas de tareas archivadas con marcas de tiempo y estadísticas
3. **Importar Tareas**: Restaure tareas archivadas con dos opciones:
   - **Anexar**: Agregue tareas archivadas a su lista de tareas actual
   - **Reemplazar**: Reemplace todas las tareas actuales con tareas archivadas (se proporciona advertencia)
4. **Exportar Datos**: Descargue datos de tareas en su formato preferido

![Lista de Archivos](releases/archive-list.png)
*La pestaña de Archivos mostrando todas las listas de tareas archivadas. Los usuarios pueden hacer clic en "Ver" para examinar tareas dentro de un archivo, "Eliminar" para remover un archivo o "Importar" para restaurar tareas*

![Diálogo de Importar Archivo](releases/archive-import.png)
*El diálogo Importar Archivo con opciones para anexar tareas archivadas a la lista actual o reemplazar completamente las tareas existentes*

**Estructura de Datos de Archivo:**
Cada archivo contiene:
- **Marca de Tiempo**: Cuándo se creó el archivo
- **Solicitud Inicial**: La solicitud original del proyecto o descripción
- **Estadísticas de Tareas**: Conteos de tareas completadas, en progreso y pendientes
- **Datos Completos de Tareas**: Información completa de tareas incluyendo descripciones, dependencias y metadatos

**Formatos de Exportación:**
- **JSON**: Datos completos de tareas con todos los metadatos
- **CSV**: Formato tabular adecuado para hojas de cálculo
- **Markdown**: Formato legible por humanos con tareas numeradas y visualización de solicitud inicial

## ⚙️ Pestaña de Configuración Global

Configure configuraciones a nivel de sistema incluyendo la ruta de carpeta Claude para acceder a agentes globales.

**Configuraciones Incluyen:**
- **Ruta de Carpeta Claude**: Establezca la ruta a su carpeta `.claude` global
- **Configuración de Clave API**: Gestione variables de entorno para servicios IA
- **Preferencias de Idioma**: Cambie entre idiomas soportados

## 🌟 Características

### 🏷️ Interfaz de Pestañas Moderna
- **Pestañas Arrastrables**: Reordene perfiles arrastrando pestañas
- **Diseño Profesional**: Pestañas estilo navegador que se conectan perfectamente al contenido
- **Retroalimentación Visual**: Indicación clara de pestaña activa y efectos de hover
- **Agregar Nuevos Perfiles**: Botón integrado "+ Agregar Pestaña" que coincide con el diseño de la interfaz

### 🔍 Búsqueda y Filtrado Avanzados
- **Búsqueda en Tiempo Real**: Filtrado instantáneo de tareas por nombre, descripción, estado o ID
- **Columnas Ordenables**: Haga clic en encabezados de columna para ordenar por cualquier campo
- **TanStack Table**: Componente de tabla poderoso con paginación y filtrado
- **Diseño Responsivo**: Funciona perfectamente en escritorio, tablet y móvil

### 🔄 Auto-Actualización Inteligente
- **Intervalos Configurables**: Elija entre 5s, 10s, 15s, 30s, 1m, 2m o 5m
- **Controles Inteligentes**: Alternancia de auto-actualización con selección de intervalo
- **Indicadores Visuales**: Estados de carga y estado de actualización
- **Actualización Manual**: Botón de actualización dedicado para actualizaciones bajo demanda

### 📊 Gestión de Tareas
- **Estadísticas de Tareas**: Conteos en vivo para Total, Completadas, En Progreso y Pendientes
- **Gestión de Perfiles**: Agregar/remover/reordenar perfiles a través de interfaz intuitiva
- **Configuraciones Persistentes**: Configuraciones de perfil guardadas entre sesiones
- **Recarga en Caliente**: Modo de desarrollo con actualizaciones instantáneas

### 🤖 Características Impulsadas por IA
- **Asignación Masiva de Agentes**: Seleccione múltiples tareas y use GPT-4 para asignar automáticamente los agentes más apropiados
- **Integración OpenAI**: Configure su clave API en Configuración Global o a través de variables de entorno
- **Coincidencia Inteligente**: La IA analiza descripciones de tareas y capacidades de agentes para asignaciones óptimas
- **Orientación de Errores**: Instrucciones claras si la clave API no está configurada

### 📚 Control de Versiones e Historial
- **Integración Git**: Los commits automáticos de Git rastrean cada cambio a tasks.json con mensajes con marca de tiempo
- **Rastro de Auditoría Completo**: Revise el historial completo de modificaciones de tareas usando herramientas Git estándar
- **Operaciones No Bloqueantes**: Los fallos de Git no interrumpen la gestión de tareas
- **Repositorio Aislado**: Historial de tareas rastreado separadamente de su repositorio de proyecto

### 📦 Archivo y Gestión de Datos
- **Archivo de Lista de Tareas**: Guarde instantáneas completas de estados de tareas con marcas de tiempo
- **Restauración Flexible**: Importe tareas archivadas anexando a tareas actuales o reemplazando completamente
- **Estadísticas de Archivo**: Vea métricas de finalización para cada lista de tareas archivada
- **Exportación Multi-Formato**: Descargue datos de tareas como JSON, CSV o Markdown con tareas numeradas
- **Preservación de Datos**: Los archivos incluyen solicitudes iniciales del proyecto y metadatos completos de tareas
- **Gestión de Almacenamiento**: Vea, elimine y organice listas de tareas archivadas eficientemente

### 🎨 UI/UX Profesional
- **Tema Oscuro**: Optimizado para entornos de desarrollo
- **Diseño Responsivo**: Se adapta a todos los tamaños de pantalla
- **Accesibilidad**: Navegación completa por teclado y soporte de lector de pantalla
- **Elementos Interactivos**: Información sobre herramientas hover y retroalimentación visual en toda la aplicación

## 🚀 Inicio Rápido

### Instalación y Configuración

1. **Clonar y navegar al directorio del visor de tareas**
   ```bash
   cd ruta/a/mcp-shrimp-task-manager/tools/task-viewer
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Construir la aplicación React**
   ```bash
   npm run build
   ```

4. **Iniciar el servidor**
   ```bash
   npm start
   ```

   El visor estará disponible en `http://localhost:9998`

### Modo de Desarrollo

Para desarrollo con recarga en caliente:

```bash
# Iniciar tanto el servidor API como el servidor de desarrollo juntos
npm run start:all

# Ejecutar servidores por separado si es necesario:
npm start          # Servidor API en puerto 9998
npm run dev        # Servidor dev Vite en puerto 3000
```

La aplicación estará disponible en `http://localhost:3000` con reconstrucción automática en cambios de archivos.

### Despliegue en Producción

#### Despliegue Estándar

```bash
# Construir la aplicación para producción
npm run build

# Iniciar el servidor de producción
npm start
```

#### Servicio Systemd (Linux)

Para inicio automático y gestión de procesos:

1. **Instalar como servicio**
   ```bash
   sudo ./install-service.sh
   ```

2. **Gestionar el servicio**
   ```bash
   # Verificar estado
   systemctl status shrimp-task-viewer
   
   # Iniciar/detener/reiniciar
   sudo systemctl start shrimp-task-viewer
   sudo systemctl stop shrimp-task-viewer
   sudo systemctl restart shrimp-task-viewer
   
   # Ver logs
   journalctl -u shrimp-task-viewer -f
   
   # Deshabilitar/habilitar inicio automático
   sudo systemctl disable shrimp-task-viewer
   sudo systemctl enable shrimp-task-viewer
   ```

3. **Desinstalar el servicio**
   ```bash
   sudo ./uninstall-service.sh
   ```

## 🖥️ Uso

### Comenzando

1. **Iniciar el servidor**:
   ```bash
   npm start
   ```
   
   **Nota**: Si aún no ha construido la aplicación o quiere usar el modo de desarrollo con recarga en caliente, use `npm run start:all` en su lugar.

2. **Abrir su navegador**:
   Navegue a `http://127.0.0.1:9998` (producción) o `http://localhost:3000` (desarrollo)

3. **Agregar su primer proyecto**:
   - Haga clic en el botón "**+ Agregar Pestaña**"
   - Ingrese un nombre de perfil descriptivo (ej., "Tareas del Equipo Alpha")
   - Ingrese la ruta a su carpeta de datos shrimp que contiene tasks.json
   - **Consejo:** Navegue a su carpeta en terminal y escriba `pwd` para obtener la ruta completa
   - Haga clic en "**Agregar Perfil**"

4. **Gestionar sus tareas**:
   - Cambie entre perfiles usando las pestañas
   - Busque tareas usando la caja de búsqueda
   - Ordene columnas haciendo clic en encabezados
   - Configure auto-actualización según necesite

### Gestión de Pestañas

- **Cambiar Perfiles**: Haga clic en cualquier pestaña para cambiar a ese perfil
- **Reordenar Pestañas**: Arrastre pestañas para reorganizarlas en su orden preferido
- **Agregar Nuevo Perfil**: Haga clic en el botón "**+ Agregar Pestaña**"
- **Remover Perfil**: Haga clic en el × en cualquier pestaña (con confirmación)

### Búsqueda y Filtrado

- **Búsqueda Global**: Escriba en la caja de búsqueda para filtrar en todos los campos de tarea
- **Ordenamiento de Columnas**: Haga clic en cualquier encabezado de columna para ordenar (haga clic nuevamente para invertir)
- **Paginación**: Navegue listas grandes de tareas con controles de paginación integrados
- **Actualizaciones en Tiempo Real**: La búsqueda y ordenamiento se actualizan instantáneamente mientras escribe

### Configuración de Auto-Actualización

1. **Habilitar Auto-actualización**: Marque la casilla "Auto-actualización"
2. **Establecer Intervalo**: Elija del menú desplegable (5s a 5m)
3. **Actualización Manual**: Haga clic en el botón 🔄 en cualquier momento para actualización inmediata
4. **Retroalimentación Visual**: El spinner se muestra durante operaciones de actualización

## 🔧 Configuración

### Variables de Entorno

Para hacer las variables de entorno persistentes entre sesiones de terminal, agréguelas a su archivo de configuración de shell:

#### Ejemplos de Configuración de Shell

**Para macOS/Linux con Zsh** (predeterminado en macOS moderno):
```bash
# Agregar variables de entorno a ~/.zshrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.zshrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.zshrc

# Recargar la configuración
source ~/.zshrc
```

**Para Linux/Unix con Bash**:
```bash
# Agregar variables de entorno a ~/.bashrc
echo 'export SHRIMP_VIEWER_PORT=9998' >> ~/.bashrc
echo 'export SHRIMP_VIEWER_HOST=127.0.0.1' >> ~/.bashrc

# Recargar la configuración
source ~/.bashrc
```

**¿Por qué agregar a la configuración de shell?**
- **Persistencia**: Variables establecidas con `export` en terminal solo duran para esa sesión
- **Consistencia**: Todas las nuevas ventanas de terminal tendrán estas configuraciones
- **Conveniencia**: No necesita establecer variables cada vez que inicie el servidor

**Variables Disponibles**:
```bash
SHRIMP_VIEWER_PORT=9998           # Puerto del servidor (predeterminado: 9998)
SHRIMP_VIEWER_HOST=127.0.0.1      # Host del servidor (solo localhost)
OPENAI_API_KEY=sk-...             # Clave API OpenAI para asignación de agentes IA
OPEN_AI_KEY_SHRIMP_TASK_VIEWER=sk-...  # Variable env alternativa para clave OpenAI
```

### Configuración de Desarrollo

#### Ejecutar Servidores de Desarrollo

**Desarrollo con recarga en caliente (recomendado para desarrollo)**:
```bash
npm run start:all  # Ejecuta servidor API (9998) + servidor dev Vite (3000)
```

**¿Por qué usar start:all?** Este comando ejecuta tanto el servidor API como el servidor dev Vite simultáneamente. Obtiene reemplazo instantáneo de módulo en caliente (HMR) para cambios UI mientras tiene la funcionalidad completa de API. Sus cambios aparecen inmediatamente en el navegador en `http://localhost:3000` sin actualización manual.

**Solo servidor API (para producción o pruebas de API)**:
```bash
npm start  # Ejecuta en puerto 9998
```

**¿Por qué usar solo servidor API?** Use esto cuando haya construido los archivos de producción y quiera probar la aplicación completa como se ejecutaría en producción, o cuando solo necesite los endpoints API.

**Construir y servir para producción**:
```bash
npm run build && npm start  # Construir luego servir en puerto 9998
```

**¿Por qué construir para producción?** La construcción de producción optimiza su código minimizando JavaScript, removiendo código muerto y empaquetando assets eficientemente. Esto resulta en tiempos de carga más rápidos y mejor rendimiento para usuarios finales. Siempre use la construcción de producción al desplegar.

### Almacenamiento de Datos de Perfiles

**Entender la Gestión de Datos de Perfiles**: El Visor de Tareas usa un enfoque híbrido para el almacenamiento de datos que prioriza tanto la persistencia como la precisión en tiempo real. Las configuraciones de perfiles (como nombres de pestañas, rutas de carpetas y orden de pestañas) se almacenan localmente en un archivo JSON de configuraciones en su directorio home, mientras que los datos de tareas se leen directamente de sus carpetas de proyecto en tiempo real.

- **Archivo de Configuraciones**: `~/.shrimp-task-viewer-settings.json`
  
  Este archivo oculto en su directorio home almacena todas sus configuraciones de perfil incluyendo nombres de pestañas, rutas de carpetas, orden de pestañas y otras preferencias. Se crea automáticamente cuando agrega su primer perfil y se actualiza cada vez que hace cambios. Puede editar manualmente este archivo si es necesario, pero tenga cuidado de mantener el formateo JSON válido.

- **Archivos de Tareas**: Leídos directamente de rutas de carpetas especificadas (sin cargas)
  
  A diferencia de las aplicaciones web tradicionales que cargan y almacenan copias de archivos, el Visor de Tareas lee archivos `tasks.json` directamente de sus rutas de carpetas especificadas. Esto asegura que siempre vea el estado actual de sus tareas sin necesidad de re-cargar o sincronizar. Cuando agrega un perfil, simplemente está diciéndole al visor dónde buscar el archivo tasks.json.

- **Recarga en Caliente**: Los cambios de desarrollo se reconstruyen automáticamente
  
  Al ejecutar en modo de desarrollo (`npm run dev`), cualquier cambio al código fuente activa reconstrucciones automáticas y actualizaciones del navegador. Esto aplica a componentes React, estilos y código del servidor, haciendo el desarrollo más rápido y eficiente.

### Historial de Tareas Git

**Control de Versiones Automático**: Comenzando con v3.0, el Gestor de Tareas Shrimp rastrea automáticamente todos los cambios de tareas usando Git. Esto proporciona un rastro de auditoría completo sin configuración manual.

- **Ubicación del Repositorio**: `<directorio-datos-shrimp>/.git`
  
  Cada proyecto obtiene su propio repositorio Git en el directorio de datos configurado en su archivo `.mcp.json`. Esto está completamente separado del repositorio Git principal de su proyecto, previniendo cualquier conflicto o interferencia.

- **Ver Historial**: Use comandos Git estándar para explorar el historial de tareas
  ```bash
  cd <directorio-datos-shrimp>
  git log --oneline          # Ver historial de commits
  git show <commit-hash>     # Ver cambios específicos
  git diff HEAD~5            # Comparar con 5 commits atrás
  ```

- **Formato de Commits**: Todos los commits incluyen marcas de tiempo y mensajes descriptivos
  ```
  [2025-08-07T13:45:23-07:00] Add new task: Implement user authentication
  [2025-08-07T14:12:10-07:00] Update task: Fix login validation
  [2025-08-07T14:45:55-07:00] Bulk task operation: append mode, 6 tasks
  ```

- **Recuperación**: Restaure estados previos de tareas si es necesario
  ```bash
  cd <directorio-datos-shrimp>
  git checkout <commit-hash> -- tasks.json  # Restaurar versión específica
  git reset --hard <commit-hash>            # Reset completo a estado anterior
  ```

## 🏗️ Arquitectura Técnica

### Stack Tecnológico

- **Frontend**: React 19 + Vite para desarrollo con recarga en caliente
- **Componente de Tabla**: TanStack React Table para características avanzadas de tabla
- **Estilos**: CSS personalizado con tema oscuro y diseño responsivo
- **Backend**: Servidor HTTP Node.js con API RESTful
- **Sistema de Construcción**: Vite para desarrollo rápido y construcciones de producción optimizadas

### Estructura de Archivos

**Organización del Proyecto**: El Visor de Tareas sigue una estructura limpia y modular que separa preocupaciones y hace que la base de código sea fácil de navegar y extender. Cada directorio y archivo tiene un propósito específico en la arquitectura de la aplicación.

```
task-viewer/
├── src/                       # Código fuente de la aplicación React
│   ├── App.jsx               # Componente React principal - gestiona estado, perfiles y pestañas
│   ├── components/           # Componentes React reutilizables
│   │   ├── TaskTable.jsx     # Tabla TanStack para mostrar y ordenar tareas
│   │   ├── Help.jsx          # Visor README con renderizado markdown
│   │   └── ReleaseNotes.jsx  # Historial de versiones con resaltado de sintaxis
│   ├── data/                 # Datos estáticos y configuración
│   │   └── releases.js       # Metadatos de versión e información de versión
│   └── index.css             # Sistema de estilos completo con tema oscuro
├── releases/                  # Archivos markdown de notas de versión e imágenes
│   ├── v*.md                 # Archivos individuales de notas de versión
│   └── *.png                 # Capturas de pantalla e imágenes para versiones
├── dist/                     # Salida de construcción de producción (auto-generada)
│   ├── index.html            # Punto de entrada HTML optimizado
│   └── assets/               # JS, CSS y otros assets empaquetados
├── server.js                 # Servidor API Node.js estilo Express
├── cli.js                    # Interfaz de línea de comandos para gestión de servicios
├── vite.config.js            # Configuración de herramienta de construcción para desarrollo/producción
├── package.json              # Metadatos del proyecto, dependencias y scripts npm
├── install-service.sh        # Instalador de servicio systemd Linux
└── README.md                 # Documentación completa (este archivo)
```

**Directorios Clave Explicados**:

- **`src/`**: Contiene todo el código fuente React. Aquí es donde hará la mayoría de cambios UI.
- **`dist/`**: Construcción de producción auto-generada. Nunca edite estos archivos directamente.
- **`releases/`**: Almacena notas de versión en formato markdown con imágenes asociadas.
- **Archivos raíz**: Archivos de configuración y servidor que manejan construcción, servicio y despliegue.

### Endpoints de API

- `GET /` - Sirve la aplicación React
- `GET /api/agents` - Lista todos los perfiles configurados
- `GET /api/tasks/{profileId}` - Devuelve tareas para perfil específico
- `POST /api/add-profile` - Agrega nuevo perfil con ruta de carpeta
- `DELETE /api/remove-profile/{profileId}` - Remueve perfil
- `PUT /api/rename-profile/{profileId}` - Renombra perfil
- `PUT /api/update-profile/{profileId}` - Actualiza configuraciones de perfil
- `GET /api/readme` - Devuelve contenido README para pestaña de ayuda
- `GET /releases/*.md` - Sirve archivos markdown de notas de versión
- `GET /releases/*.png` - Sirve imágenes de notas de versión

## 🛠️ Desarrollo

### Configurar Entorno de Desarrollo

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo con recarga en caliente
npm run dev

# Servidor de desarrollo ejecuta en http://localhost:3000
# Servidor API backend ejecuta en http://localhost:9998
```

### Construir para Producción

```bash
# Construir paquete de producción optimizado
npm run build

# Archivos se generan en directorio dist/
# Iniciar servidor de producción
npm start
```

### Extender la Interfaz

La arquitectura React modular hace que extender sea fácil:

1. **Agregar Nuevos Componentes**: Crear en `src/components/`
2. **Modificar Estilos**: Editar `src/index.css` con propiedades personalizadas CSS
3. **Agregar Características**: Extender `App.jsx` con nuevo estado y funcionalidad
4. **Integración API**: Agregar endpoints en `server.js`

## 🔒 Seguridad y Rendimiento

### Características de Seguridad

- **Enlace Localhost**: Servidor solo accesible desde máquina local
- **Acceso Directo a Archivos**: Lee archivos de tareas directamente de rutas del sistema de archivos
- **Sin Dependencias Externas**: Auto-contenido con superficie de ataque mínima
- **Protección CORS**: Endpoints API protegidos con encabezados CORS

### Optimizaciones de Rendimiento

- **Reemplazo de Módulo en Caliente**: Actualizaciones de desarrollo instantáneas
- **División de Código**: Carga de paquete optimizada
- **Re-renderizado Eficiente**: Patrones de optimización React
- **Almacenamiento en Caché**: Cache de assets estáticos para cargas más rápidas
- **Imágenes Responsivas**: Optimizadas para todos los tamaños de dispositivo

## 🐛 Solución de Problemas

### Problemas Comunes

**El Servidor No Inicia**
```bash
# Verificar si el puerto está en uso
lsof -i :9998

# Terminar procesos existentes
pkill -f "node.*server.js"

# Probar puerto diferente
SHRIMP_VIEWER_PORT=8080 node server.js
```

**La Pestaña de Ayuda/Readme Muestra HTML**
Si la pestaña de Ayuda muestra HTML en lugar del contenido README, el servidor necesita ser reiniciado para cargar los nuevos endpoints API:
```bash
# Detener el servidor (Ctrl+C) y reiniciar
npm start
```

**La Recarga en Caliente No Funciona**
```bash
# Asegurarse de que las dependencias de desarrollo estén instaladas
npm install

# Reiniciar servidor de desarrollo
npm run dev
```

**Las Tareas No Se Cargan**
1. Verifique que los archivos `tasks.json` contengan JSON válido
2. Verifique que los permisos de archivo sean legibles
3. Verifique la consola del navegador para mensajes de error
4. Use el botón de actualización manual para recargar datos

**Errores de Construcción**
```bash
# Limpiar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Limpiar cache de Vite
rm -rf dist/
npm run build
```

## 📋 Registro de Cambios

### Versión 2.1.0 (Más Reciente) - 2025-07-29

#### 🚀 Características Principales
- **Soporte de Ruta de Archivo Directo**: Reemplazó carga de archivo con entrada de ruta de carpeta directa para actualizaciones en vivo
- **Pestaña Ayuda/Readme**: Agregada pestaña de documentación con renderizado markdown
- **Pestaña Notas de Versión**: Visor de notas de versión dentro de la aplicación con soporte de imágenes
- **Dependencias Clicables**: Navegue entre tareas dependientes fácilmente
- **Columna Acciones IA**: Copie instrucciones IA para finalización de tareas
- **Gestión UUID Mejorada**: Haga clic en insignias de tareas para copiar UUIDs
- **Edición de Perfiles**: Renombre perfiles y configure raíces de proyectos
- **Soporte Módulos ES**: Convertido a módulos ES para mejor compatibilidad

#### 🐛 Corrección Crítica
- **Corregido Problema de Copia de Archivo Estático**: Los archivos ahora se leen directamente de rutas especificadas en lugar de crear copias estáticas en `/tmp/`

### Versión 1.0.3 - 2025-07-26

#### 🧪 Pruebas y Confiabilidad
- **Suite de Pruebas Completa**: Agregada cobertura completa de pruebas con Vitest
- **Pruebas de Componentes**: Pruebas React Testing Library para todos los componentes
- **Pruebas de Integración**: Pruebas end-to-end del servidor y endpoints API
- **Correcciones de Errores**: Resuelto manejo de datos de formulario multipart en gestión de perfiles

### Versión 1.0.2 - 2025-07-26

#### 🎨 Vista de Detalles de Tarea
- **Navegación en Pestaña**: Reemplazó modal con detalles de tarea sin fisuras dentro de pestaña
- **Botón Atrás**: Navegación fácil de vuelta a lista de tareas
- **UX Mejorada**: Mejor flujo de trabajo sin interrupciones de popup

### Versión 1.0.1 - 2025-07-13

#### 🎨 Renovación Principal de UI
- **Interfaz de Pestañas Moderna**: Pestañas profesionales estilo navegador con reordenamiento arrastrar y soltar
- **Diseño Conectado**: Conexión visual sin fisuras entre pestañas y contenido
- **Layout Mejorado**: Búsqueda y controles reposicionados para mejor flujo de trabajo

#### ⚡ Funcionalidad Mejorada
- **Auto-actualización Configurable**: Elija intervalos de 5 segundos a 5 minutos
- **Búsqueda Avanzada**: Filtrado en tiempo real a través de todos los campos de tarea
- **Columnas Ordenables**: Haga clic en encabezados para ordenar por cualquier columna
- **Desarrollo Recarga en Caliente**: Actualizaciones instantáneas durante desarrollo

#### 🔧 Mejoras Técnicas
- **Arquitectura React**: Reescritura completa usando React 19 + Vite
- **TanStack Table**: Componente de tabla profesional con paginación
- **Diseño Responsivo**: Enfoque móvil-primero con optimización de puntos de quiebre
- **Rendimiento**: Renderizado optimizado y gestión eficiente de estado

### Versión 1.0.0 - 2025-07-01

#### 🚀 Versión Inicial
- **Visor Básico**: Implementación inicial con interfaz web básica
- **Gestión de Perfiles**: Agregar y remover perfiles de tareas
- **API del Servidor**: Endpoints RESTful para datos de tareas
- **Visualización de Tareas**: Ver tareas de múltiples proyectos

## 📄 Licencia

Licencia MIT - vea la licencia del proyecto principal para detalles.

## 🤝 Contribuir

Esta herramienta es parte del proyecto MCP Gestor de Tareas Shrimp. ¡Las contribuciones son bienvenidas!

1. Fork el repositorio
2. Crear una rama de característica (`git checkout -b feature/caracteristica-increible`)
3. Hacer sus cambios con pruebas apropiadas
4. Commit sus cambios (`git commit -m 'Add amazing feature'`)
5. Push a la rama (`git push origin feature/caracteristica-increible`)
6. Enviar una pull request

### Pautas de Desarrollo

- Seguir mejores prácticas de React y patrones de hooks
- Mantener principios de diseño responsivo
- Agregar tipos TypeScript apropiados donde sea aplicable
- Probar en diferentes navegadores y dispositivos
- Actualizar documentación para nuevas características

---

**¡Feliz gestión de tareas! 🦐✨**

Construido con ❤️ usando React, Vite y tecnologías web modernas.