const Store = require('electron-store');

// Creamos una instancia de Store para manejar el almacenamiento persistente
const store = new Store();

/**
 * Clase Database para abstraer las operaciones de almacenamiento
 */
class Database {
  /**
   * Constructor de la clase Database
   */
  constructor() {
    // Inicializar el almacenamiento si es necesario
    if (!store.has('projects')) {
      store.set('projects', []);
    }
  }

  /**
   * Obtiene todos los proyectos
   * @returns {Array} Lista de proyectos
   */
  getProjects() {
    return store.get('projects', []);
  }

  /**
   * Obtiene un proyecto por su ID
   * @param {string} projectId - ID del proyecto
   * @returns {Object|null} Proyecto encontrado o null
   */
  getProjectById(projectId) {
    const projects = this.getProjects();
    return projects.find(p => p.id === projectId) || null;
  }

  /**
   * Añade un nuevo proyecto
   * @param {Object} project - Datos del proyecto a añadir
   * @returns {Object} Proyecto añadido con ID generado
   */
  addProject(project) {
    const projects = this.getProjects();
    
    // Generar ID único basado en timestamp
    project.id = Date.now().toString();
    project.tasks = [];
    project.createdAt = new Date().toISOString();
    
    // Añadir el proyecto y guardar
    projects.push(project);
    store.set('projects', projects);
    
    return project;
  }

  /**
   * Actualiza un proyecto existente
   * @param {Object} updatedProject - Datos actualizados del proyecto
   * @returns {Object|null} Proyecto actualizado o null si no se encuentra
   */
  updateProject(updatedProject) {
    const projects = this.getProjects();
    const index = projects.findIndex(p => p.id === updatedProject.id);
    
    if (index !== -1) {
      // Preservar las tareas y otros campos que no se actualizan
      projects[index] = { 
        ...projects[index], 
        ...updatedProject,
        updatedAt: new Date().toISOString() 
      };
      
      store.set('projects', projects);
      return projects[index];
    }
    
    return null;
  }

  /**
   * Elimina un proyecto por su ID
   * @param {string} projectId - ID del proyecto a eliminar
   * @returns {boolean} true si se eliminó, false si no existía
   */
  deleteProject(projectId) {
    const projects = this.getProjects();
    const newProjects = projects.filter(p => p.id !== projectId);
    
    if (newProjects.length < projects.length) {
      store.set('projects', newProjects);
      return true;
    }
    
    return false;
  }

  /**
   * Añade una tarea a un proyecto
   * @param {string} projectId - ID del proyecto
   * @param {Object} task - Datos de la tarea a añadir
   * @returns {Object|null} Tarea añadida o null si el proyecto no existe
   */
  addTask(projectId, task) {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      // Generar ID único y añadir metadatos
      task.id = Date.now().toString();
      task.status = task.status || 'pendiente';
      task.createdAt = new Date().toISOString();
      
      // Inicializar el array de tareas si no existe
      if (!projects[projectIndex].tasks) {
        projects[projectIndex].tasks = [];
      }
      
      // Añadir la tarea y guardar
      projects[projectIndex].tasks.push(task);
      store.set('projects', projects);
      
      return task;
    }
    
    return null;
  }

  /**
   * Actualiza una tarea existente
   * @param {string} projectId - ID del proyecto
   * @param {string} taskId - ID de la tarea
   * @param {Object} updatedTask - Datos actualizados de la tarea
   * @returns {Object|null} Tarea actualizada o null si no se encuentra
   */
  updateTask(projectId, taskId, updatedTask) {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      const taskIndex = projects[projectIndex].tasks.findIndex(t => t.id === taskId);
      
      if (taskIndex !== -1) {
        // Actualizar la tarea manteniendo los campos existentes que no se actualizan
        projects[projectIndex].tasks[taskIndex] = { 
          ...projects[projectIndex].tasks[taskIndex], 
          ...updatedTask,
          updatedAt: new Date().toISOString() 
        };
        
        store.set('projects', projects);
        return projects[projectIndex].tasks[taskIndex];
      }
    }
    
    return null;
  }

  /**
   * Elimina una tarea de un proyecto
   * @param {string} projectId - ID del proyecto
   * @param {string} taskId - ID de la tarea a eliminar
   * @returns {boolean} true si se eliminó, false si no se encontró
   */
  deleteTask(projectId, taskId) {
    const projects = this.getProjects();
    const projectIndex = projects.findIndex(p => p.id === projectId);
    
    if (projectIndex !== -1) {
      const initialTaskCount = projects[projectIndex].tasks.length;
      projects[projectIndex].tasks = projects[projectIndex].tasks.filter(t => t.id !== taskId);
      
      if (projects[projectIndex].tasks.length < initialTaskCount) {
        store.set('projects', projects);
        return true;
      }
    }
    
    return false;
  }

  /**
   * Obtiene estadísticas de un proyecto
   * @param {string} projectId - ID del proyecto
   * @returns {Object|null} Estadísticas del proyecto o null si no existe
   */
  getProjectStats(projectId) {
    const project = this.getProjectById(projectId);
    
    if (project && project.tasks) {
      const total = project.tasks.length;
      const completed = project.tasks.filter(t => t.status === 'completada').length;
      const inProgress = project.tasks.filter(t => t.status === 'en-progreso').length;
      const pending = project.tasks.filter(t => t.status === 'pendiente').length;
      
      return {
        total,
        completed,
        inProgress,
        pending,
        completionPercentage: total ? Math.round((completed / total) * 100) : 0
      };
    }
    
    return null;
  }

  /**
   * Obtiene tareas próximas a vencer
   * @param {number} daysThreshold - Días de umbral para considerar una tarea próxima a vencer
   * @returns {Array} Lista de tareas próximas a vencer con información del proyecto
   */
  getUpcomingTasks(daysThreshold = 3) {
    const projects = this.getProjects();
    const today = new Date();
    const upcomingTasks = [];
    
    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          if (task.dueDate && task.status !== 'completada') {
            const dueDate = new Date(task.dueDate);
            const diffDays = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
            
            if (diffDays >= 0 && diffDays <= daysThreshold) {
              upcomingTasks.push({
                projectId: project.id,
                projectName: project.name,
                taskId: task.id,
                taskTitle: task.title,
                dueDate: task.dueDate,
                daysLeft: diffDays
              });
            }
          }
        });
      }
    });
    
    return upcomingTasks;
  }

  /**
   * Busca tareas con un término de búsqueda en su título o descripción
   * @param {string} searchTerm - Término a buscar
   * @returns {Array} Tareas encontradas con información del proyecto
   */
  searchTasks(searchTerm) {
    if (!searchTerm) return [];
    
    const projects = this.getProjects();
    const searchResults = [];
    const term = searchTerm.toLowerCase();
    
    projects.forEach(project => {
      if (project.tasks) {
        project.tasks.forEach(task => {
          if (
            (task.title && task.title.toLowerCase().includes(term)) ||
            (task.description && task.description.toLowerCase().includes(term)) ||
            (task.tags && task.tags.some(tag => tag.toLowerCase().includes(term)))
          ) {
            searchResults.push({
              projectId: project.id,
              projectName: project.name,
              task: { ...task }
            });
          }
        });
      }
    });
    
    return searchResults;
  }

  /**
   * Exporta todos los datos como JSON
   * @returns {string} Datos en formato JSON
   */
  exportData() {
    return JSON.stringify(this.getProjects(), null, 2);
  }

  /**
   * Importa datos desde un JSON
   * @param {string|Array} data - Datos en formato JSON o Array de proyectos
   * @returns {boolean} true si se importó correctamente
   */
  importData(data) {
    try {
      let projects;
      
      if (typeof data === 'string') {
        projects = JSON.parse(data);
      } else if (Array.isArray(data)) {
        projects = data;
      } else {
        return false;
      }
      
      store.set('projects', projects);
      return true;
    } catch (error) {
      console.error('Error al importar datos:', error);
      return false;
    }
  }

  /**
 * Añade una subtarea a una tarea
 * @param {string} projectId - ID del proyecto
 * @param {string} taskId - ID de la tarea
 * @param {Object} subtask - Datos de la subtarea a añadir
 * @returns {Object|null} Subtarea añadida o null si la tarea no existe
 */
addSubtask(projectId, taskId, subtask) {
  const projects = this.getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex !== -1) {
    const taskIndex = projects[projectIndex].tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1) {
      // Inicializar el array de subtareas si no existe
      if (!projects[projectIndex].tasks[taskIndex].subtasks) {
        projects[projectIndex].tasks[taskIndex].subtasks = [];
      }
      
      // Generar ID único y añadir metadatos
      subtask.id = Date.now().toString();
      subtask.completed = subtask.completed || false;
      subtask.createdAt = new Date().toISOString();
      
      // Añadir la subtarea y guardar
      projects[projectIndex].tasks[taskIndex].subtasks.push(subtask);
      store.set('projects', projects);
      
      return subtask;
    }
  }
  
  return null;
}

/**
 * Actualiza una subtarea existente
 * @param {string} projectId - ID del proyecto
 * @param {string} taskId - ID de la tarea
 * @param {string} subtaskId - ID de la subtarea
 * @param {Object} updatedSubtask - Datos actualizados de la subtarea
 * @returns {Object|null} Subtarea actualizada o null si no se encuentra
 */
updateSubtask(projectId, taskId, subtaskId, updatedSubtask) {
  const projects = this.getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex !== -1) {
    const taskIndex = projects[projectIndex].tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1 && projects[projectIndex].tasks[taskIndex].subtasks) {
      const subtaskIndex = projects[projectIndex].tasks[taskIndex].subtasks.findIndex(s => s.id === subtaskId);
      
      if (subtaskIndex !== -1) {
        // Actualizar subtarea manteniendo los campos existentes
        projects[projectIndex].tasks[taskIndex].subtasks[subtaskIndex] = { 
          ...projects[projectIndex].tasks[taskIndex].subtasks[subtaskIndex], 
          ...updatedSubtask,
          updatedAt: new Date().toISOString() 
        };
        
        store.set('projects', projects);
        return projects[projectIndex].tasks[taskIndex].subtasks[subtaskIndex];
      }
    }
  }
  
  return null;
}

/**
 * Elimina una subtarea
 * @param {string} projectId - ID del proyecto
 * @param {string} taskId - ID de la tarea
 * @param {string} subtaskId - ID de la subtarea a eliminar
 * @returns {boolean} true si se eliminó, false si no se encontró
 */
deleteSubtask(projectId, taskId, subtaskId) {
  const projects = this.getProjects();
  const projectIndex = projects.findIndex(p => p.id === projectId);
  
  if (projectIndex !== -1) {
    const taskIndex = projects[projectIndex].tasks.findIndex(t => t.id === taskId);
    
    if (taskIndex !== -1 && projects[projectIndex].tasks[taskIndex].subtasks) {
      const initialSubtaskCount = projects[projectIndex].tasks[taskIndex].subtasks.length;
      projects[projectIndex].tasks[taskIndex].subtasks = projects[projectIndex].tasks[taskIndex].subtasks.filter(s => s.id !== subtaskId);
      
      if (projects[projectIndex].tasks[taskIndex].subtasks.length < initialSubtaskCount) {
        store.set('projects', projects);
        return true;
      }
    }
  }
  
  return false;
}
}



// Exportamos una instancia única de Database
module.exports = new Database();