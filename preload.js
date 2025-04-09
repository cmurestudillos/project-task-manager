const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  // Proyectos
  getProjects: () => ipcRenderer.invoke('get-projects'),
  getProject: projectId => ipcRenderer.invoke('get-project', projectId),
  addProject: project => ipcRenderer.invoke('add-project', project),
  updateProject: project => ipcRenderer.invoke('update-project', project),
  deleteProject: projectId => ipcRenderer.invoke('delete-project', projectId),

  // Tareas
  addTask: (projectId, task) => ipcRenderer.invoke('add-task', { projectId, task }),
  updateTask: (projectId, taskId, task) => ipcRenderer.invoke('update-task', { projectId, taskId, updatedTask: task }),
  deleteTask: (projectId, taskId) => ipcRenderer.invoke('delete-task', { projectId, taskId }),

  // Estadísticas
  getProjectStats: projectId => ipcRenderer.invoke('get-project-stats', projectId),

  // Búsqueda
  searchTasks: searchTerm => ipcRenderer.invoke('search-tasks', searchTerm),

  // Tareas próximas a vencer
  getUpcomingTasks: daysThreshold => ipcRenderer.invoke('get-upcoming-tasks', daysThreshold),

  // Exportar/Importar
  exportProjects: () => ipcRenderer.invoke('export-projects'),
  importProjects: projects => ipcRenderer.invoke('import-projects', projects),

  // Subtareas
  addSubtask: (projectId, taskId, subtask) => ipcRenderer.invoke('add-subtask', { projectId, taskId, subtask }),
  updateSubtask: (projectId, taskId, subtaskId, subtask) =>
    ipcRenderer.invoke('update-subtask', { projectId, taskId, subtaskId, updatedSubtask: subtask }),
  deleteSubtask: (projectId, taskId, subtaskId) =>
    ipcRenderer.invoke('delete-subtask', { projectId, taskId, subtaskId }),
});
