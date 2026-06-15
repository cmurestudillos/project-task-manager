# Project Task Manager - Gestor de Proyectos y Tareas con Electron

Project Task Manager es una aplicación de escritorio para gestión de proyectos y tareas construida con Electron. Proporciona una interfaz intuitiva tipo Kanban para organizar tu trabajo, inspirada en herramientas como Asana o Jira pero diseñada para funcionar localmente en tu computadora.

## ✨ Características

- **Gestión de Proyectos**: Crea, edita y organiza múltiples proyectos.
- **Tablero Kanban**: Visualiza tus tareas en columnas de Pendiente, En Progreso y Completadas.
- **Arrastrar y Soltar**: Mueve tareas entre estados con facilidad.
- **Subtareas**: Divide tareas complejas en pasos más pequeños.
- **Prioridades**: Marca tareas con prioridad alta, media o baja.
- **Etiquetas**: Categoriza tus tareas con etiquetas personalizables.
- **Fechas Límite**: Establece fechas de vencimiento para tus tareas.
- **Responsables**: Asigna tareas a diferentes miembros del equipo.
- **Almacenamiento Local**: Todos los datos se guardan localmente.
- **Importación/Exportación**: Respalda tus datos en formato JSON.
- **Notificaciones**: Recibe alertas para tareas próximas a vencer.
- **Búsqueda**: Encuentra rápidamente tareas por texto o etiquetas.

## 🚀 Instalación

### Prerrequisitos
- [Node.js](https://nodejs.org/) (v20 o superior)
- [pnpm](https://pnpm.io/) (`corepack enable` o `npm install -g pnpm`)

### Instalación desde código fuente

```bash
# Clonar repositorio
git clone https://github.com/cmurestudillos/project-task-manager.git
cd project-task-manager

# Instalar dependencias
pnpm install

# Iniciar aplicación
pnpm start
```

### Descargar versión compilada
Puedes descargar la versión compilada para Windows, macOS o Linux desde la sección de [Releases](https://github.com/cmurestudillos/project-task-manager/releases).

## 🖥️ Uso

### Crear un nuevo proyecto
1. Haz clic en "Nuevo Proyecto" en la barra superior.
2. Ingresa un nombre y descripción para tu proyecto.
3. Haz clic en "Guardar".

### Crear una tarea
1. Selecciona un proyecto de la lista.
2. Haz clic en "Nueva Tarea".
3. Completa los detalles como título, descripción, fecha límite, etc.
4. Haz clic en "Guardar".

### Manejar subtareas
1. En una tarea, haz clic en "Añadir subtarea".
2. Ingresa el título de la subtarea.
3. Marca las subtareas como completadas a medida que avanzas.

### Cambiar el estado de una tarea
- Arrastra la tarea entre las columnas "Pendiente", "En Progreso" y "Completada".
- O edita la tarea y cambia su estado manualmente.

### Exportar/Importar datos
- Haz clic en "Exportar" para guardar todos tus proyectos y tareas en un archivo JSON.
- Haz clic en "Importar" para cargar datos previamente exportados.

## 🛠️ Tecnologías utilizadas

- [Electron](https://www.electronjs.org/) - Framework para crear aplicaciones de escritorio con tecnologías web
- [electron-store](https://github.com/sindresorhus/electron-store) - Almacenamiento persistente para aplicaciones Electron
- JavaScript (ES6+)
- HTML5
- CSS3

## 📂 Estructura del proyecto

```
taskflow/
├── package.json          # Configuración del proyecto y dependencias
├── main.js               # Proceso principal de Electron
├── preload.js            # Script de precarga para comunicación segura
├── index.html            # Interfaz de usuario principal
├── renderer.js           # JavaScript de la interfaz de usuario
├── styles.css            # Estilos CSS de la aplicación
└── db/
    └── database.js       # Capa de abstracción para almacenamiento
```

## 🔧 Personalización

### Tema oscuro
La aplicación incluye un tema oscuro incorporado. Para activarlo, descomenta la sección correspondiente en `styles.css`.

### Columnas personalizadas
Si deseas modificar las columnas del tablero Kanban:

1. Edita `index.html` para añadir o modificar las div de columnas en la sección `tasks-list`.
2. Actualiza `renderer.js` para manejar los nuevos estados en la función `renderTasks`.
3. Actualiza los selectores de estado en los formularios de tareas.

## 📜 Licencia

Este proyecto está licenciado bajo la [Licencia MIT](LICENSE).

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor, siente libre de hacer un fork, crear un Pull Request o abrir un Issue.

1. Haz un fork del proyecto
2. Crea tu rama de funcionalidad (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Haz push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## 📝 Notas

- Esta aplicación guarda todos los datos localmente en tu computadora.
- No hay sincronización en la nube incluida, pero puedes usar la exportación/importación para transferir datos entre dispositivos.