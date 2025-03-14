document.addEventListener('DOMContentLoaded', () => {
  // Elementos DOM
  const projectsList = document.getElementById('projectsList');
  const projectTitle = document.getElementById('projectTitle');
  const projectDescription = document.getElementById('projectDescription');
  const projectActions = document.getElementById('projectActions');
  const taskStats = document.getElementById('taskStats');
  const totalTasks = document.getElementById('totalTasks');
  const completedTasksCount = document.getElementById('completedTasksCount');
  const progressBar = document.getElementById('progressBar');
  const pendingTasks = document.getElementById('pendingTasks');
  const inProgressTasks = document.getElementById('inProgressTasks');
  const completedTasks = document.getElementById('completedTasks');
  const upcomingTasksList = document.getElementById('upcomingTasksList');
  
  // Elementos de búsqueda
  const searchInput = document.getElementById('searchInput');
  const searchBtn = document.getElementById('searchBtn');
  const searchResults = document.getElementById('searchResults');
  const searchResultsList = document.getElementById('searchResultsList');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const projectView = document.getElementById('projectView');
  
  // Modales
  const projectModal = document.getElementById('projectModal');
  const taskModal = document.getElementById('taskModal');
  const importModal = document.getElementById('importModal');
  const projectForm = document.getElementById('projectForm');
  const taskForm = document.getElementById('taskForm');
  
  // Botones
  const newProjectBtn = document.getElementById('newProjectBtn');
  const addTaskBtn = document.getElementById('addTaskBtn');
  const editProjectBtn = document.getElementById('editProjectBtn');
  const deleteProjectBtn = document.getElementById('deleteProjectBtn');
  const exportBtn = document.getElementById('exportBtn');
  const importBtn = document.getElementById('importBtn');
  const confirmImportBtn = document.getElementById('confirmImportBtn');
  
  // Variables de estado
  let currentProjectId = null;
  let isEditingProject = false;
  let isEditingTask = false;
  let currentTaskId = null;
  
  // Variables adicionales a agregar al principio del archivo, después de las otras declaraciones de constantes
  const subtaskModal = document.getElementById('subtaskModal');
  const subtaskForm = document.getElementById('subtaskForm');

  // Variables de estado adicionales a agregar después de las existentes
  let currentSubtaskId = null;
  let isEditingSubtask = false;
  let parentTaskId = null;

  // Cargar proyectos y tareas próximas al iniciar
  loadProjects();
  loadUpcomingTasks();
  
  // Event Listeners
  newProjectBtn.addEventListener('click', openNewProjectModal);
  addTaskBtn.addEventListener('click', openNewTaskModal);
  editProjectBtn.addEventListener('click', openEditProjectModal);
  deleteProjectBtn.addEventListener('click', confirmDeleteProject);
  exportBtn.addEventListener('click', exportData);
  importBtn.addEventListener('click', () => importModal.style.display = 'block');
  confirmImportBtn.addEventListener('click', importData);
  
  searchBtn.addEventListener('click', performSearch);
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') performSearch();
  });
  closeSearchBtn.addEventListener('click', () => {
    searchResults.style.display = 'none';
    projectView.style.display = 'block';
    searchInput.value = '';
  });
  
  projectForm.addEventListener('submit', saveProject);
  taskForm.addEventListener('submit', saveTask);
  
  // Cerrar modales con X
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });
  
  // Cerrar modales al hacer clic fuera
  window.addEventListener('click', function(event) {
    if (event.target === projectModal) {
      projectModal.style.display = 'none';
    }
    if (event.target === taskModal) {
      taskModal.style.display = 'none';
    }
    if (event.target === importModal) {
      importModal.style.display = 'none';
    }
  });
  
  // Funciones
  async function loadProjects() {
    try {
      const projects = await window.api.getProjects();
      renderProjects(projects);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
    }
  }
  
  function renderProjects(projects) {
    projectsList.innerHTML = '';
    projects.forEach(project => {
      const li = document.createElement('li');
      li.textContent = project.name;
      li.dataset.id = project.id;
      li.addEventListener('click', () => selectProject(project.id));
      projectsList.appendChild(li);
    });
  }
  
  async function selectProject(projectId) {
    try {
      const project = await window.api.getProject(projectId);
      
      if (project) {
        currentProjectId = projectId;
        projectTitle.textContent = project.name;
        projectDescription.textContent = project.description || '';
        projectActions.style.display = 'flex';
        taskStats.style.display = 'flex';
        
        renderTasks(project.tasks || []);
        updateProjectStats(projectId);
      }
    } catch (error) {
      console.error('Error al seleccionar proyecto:', error);
    }
  }
  
  async function updateProjectStats(projectId) {
    try {
      const stats = await window.api.getProjectStats(projectId);
      
      if (stats) {
        totalTasks.textContent = stats.total;
        completedTasksCount.textContent = stats.completed;
        progressBar.style.width = `${stats.completionPercentage}%`;
        progressBar.textContent = `${stats.completionPercentage}%`;
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  }
  
  function renderTasks(tasks) {
    pendingTasks.innerHTML = '';
    inProgressTasks.innerHTML = '';
    completedTasks.innerHTML = '';
    
    tasks.forEach(task => {
      const taskElement = createTaskElement(task);
      
      switch (task.status) {
        case 'pendiente':
          pendingTasks.appendChild(taskElement);
          break;
        case 'en-progreso':
          inProgressTasks.appendChild(taskElement);
          break;
        case 'completada':
          completedTasks.appendChild(taskElement);
          break;
      }
    });
    
    setupDragAndDrop();
  }
  
  function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-card priority-${task.priority || 'media'}`;
    div.dataset.id = task.id;
    
    let tagsHtml = '';
    if (task.tags && task.tags.length > 0) {
      tagsHtml = `
        <div class="task-tags">
          ${task.tags.map(tag => `<span class="task-tag">${tag}</span>`).join('')}
        </div>
      `;
    }
    
    let subtasksHtml = '';
    if (task.subtasks && task.subtasks.length > 0) {
      const completedCount = task.subtasks.filter(s => s.completed).length;
      const totalCount = task.subtasks.length;
      
      subtasksHtml = `
        <div class="task-subtasks">
          <div class="subtasks-header">
            <span>Subtareas (${completedCount}/${totalCount})</span>
            <button class="add-subtask-btn" data-task-id="${task.id}">+ Añadir</button>
          </div>
          <ul class="subtasks-list">
            ${task.subtasks.map(subtask => `
              <li class="subtask-item ${subtask.completed ? 'completed' : ''}">
                <input type="checkbox" class="subtask-checkbox" data-subtask-id="${subtask.id}" ${subtask.completed ? 'checked' : ''}>
                <span class="subtask-title">${subtask.title}</span>
                <div class="subtask-actions">
                  <button class="edit-subtask-btn" data-subtask-id="${subtask.id}">✏️</button>
                  <button class="delete-subtask-btn" data-subtask-id="${subtask.id}">🗑️</button>
                </div>
              </li>
            `).join('')}
          </ul>
        </div>
      `;
    } else {
      subtasksHtml = `
        <div class="task-subtasks">
          <button class="add-subtask-btn" data-task-id="${task.id}">+ Añadir subtarea</button>
        </div>
      `;
    }
    
    div.innerHTML = `
      <div class="task-header">
        <h4>${task.title}</h4>
        <div class="task-actions">
          <button class="edit-task-btn">✏️</button>
          <button class="delete-task-btn">🗑️</button>
        </div>
      </div>
      <p>${task.description || ''}</p>
      ${tagsHtml}
      ${task.assignee ? `<p class="task-assignee">👤 ${task.assignee}</p>` : ''}
      ${task.dueDate ? `<p class="task-due-date">📅 ${new Date(task.dueDate).toLocaleDateString()}</p>` : ''}
      ${subtasksHtml}
    `;
    
    // Eventos para botones de tareas
    div.querySelector('.edit-task-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      openEditTaskModal(task);
    });
    
    div.querySelector('.delete-task-btn').addEventListener('click', (e) => {
      e.stopPropagation();
      confirmDeleteTask(task.id);
    });
    
    // Eventos para botones de subtareas
    div.querySelectorAll('.add-subtask-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        openNewSubtaskModal(task.id);
      });
    });
    
    // Eventos para checkboxes de subtareas
    div.querySelectorAll('.subtask-checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', async (e) => {
        e.stopPropagation();
        const subtaskId = checkbox.dataset.subtaskId;
        await updateSubtaskStatus(task.id, subtaskId, checkbox.checked);
      });
    });
    
    // Eventos para editar subtareas
    div.querySelectorAll('.edit-subtask-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const subtaskId = btn.dataset.subtaskId;
        const subtask = task.subtasks.find(s => s.id === subtaskId);
        if (subtask) {
          openEditSubtaskModal(task.id, subtask);
        }
      });
    });
    
    // Eventos para eliminar subtareas
    div.querySelectorAll('.delete-subtask-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const subtaskId = btn.dataset.subtaskId;
        confirmDeleteSubtask(task.id, subtaskId);
      });
    });
    
    div.draggable = true;
    
    // Eventos de arrastrar y soltar
    div.addEventListener('dragstart', (e) => {
      e.dataTransfer.setData('text/plain', task.id);
    });
    
    return div;
  }
  
  function setupDragAndDrop() {
    const containers = document.querySelectorAll('.tasks-container');
    
    containers.forEach(container => {
      container.addEventListener('dragover', (e) => {
        e.preventDefault();
        container.classList.add('drag-over');
      });
      
      container.addEventListener('dragleave', () => {
        container.classList.remove('drag-over');
      });
      
      container.addEventListener('drop', async (e) => {
        e.preventDefault();
        container.classList.remove('drag-over');
        
        const taskId = e.dataTransfer.getData('text/plain');
        const newStatus = container.dataset.status;
        
        if (currentProjectId && taskId) {
          try {
            await window.api.updateTask(currentProjectId, taskId, { status: newStatus });
            await selectProject(currentProjectId); // Recargar tareas
          } catch (error) {
            console.error('Error al actualizar estado de tarea:', error);
          }
        }
      });
    });
  }
  
  async function loadUpcomingTasks() {
    try {
      const upcomingTasks = await window.api.getUpcomingTasks(3); // Próximos 3 días
      
      upcomingTasksList.innerHTML = '';
      
      if (upcomingTasks.length === 0) {
        upcomingTasksList.innerHTML = '<p class="no-tasks">No hay tareas próximas</p>';
        return;
      }
      
      upcomingTasks.forEach(task => {
        const div = document.createElement('div');
        div.className = 'upcoming-task';
        
        const daysText = task.daysLeft === 0 ? 'Hoy' : 
                         task.daysLeft === 1 ? 'Mañana' : 
                         `En ${task.daysLeft} días`;
        
        div.innerHTML = `
          <h4>${task.taskTitle}</h4>
          <p class="task-project">Proyecto: ${task.projectName}</p>
          <p class="task-due-date">Vence: ${daysText}</p>
        `;
        
        div.addEventListener('click', () => {
          selectProject(task.projectId);
        });
        
        upcomingTasksList.appendChild(div);
      });
    } catch (error) {
      console.error('Error al cargar tareas próximas:', error);
    }
  }
  
  async function performSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) return;
    
    try {
      const results = await window.api.searchTasks(searchTerm);
      
      searchResultsList.innerHTML = '';
      
      if (results.length === 0) {
        searchResultsList.innerHTML = '<p class="no-results">No se encontraron resultados</p>';
      } else {
        results.forEach(result => {
          const div = document.createElement('div');
          div.className = `search-result-item priority-${result.task.priority || 'media'}`;
          
          div.innerHTML = `
            <h3>${result.task.title}</h3>
            <p>${result.task.description || ''}</p>
            <p class="task-project">Proyecto: ${result.projectName}</p>
            <p class="task-status">Estado: ${formatStatus(result.task.status)}</p>
          `;
          
          div.addEventListener('click', () => {
            selectProject(result.projectId);
            searchResults.style.display = 'none';
            projectView.style.display = 'block';
          });
          
          searchResultsList.appendChild(div);
        });
      }
      
      projectView.style.display = 'none';
      searchResults.style.display = 'block';
    } catch (error) {
      console.error('Error al buscar tareas:', error);
    }
  }
  
  function formatStatus(status) {
    switch (status) {
      case 'pendiente': return 'Pendiente';
      case 'en-progreso': return 'En Progreso';
      case 'completada': return 'Completada';
      default: return status;
    }
  }
  
  // Modales y formularios
  function openNewProjectModal() {
    document.getElementById('projectModalTitle').textContent = 'Nuevo Proyecto';
    projectForm.reset();
    isEditingProject = false;
    projectModal.style.display = 'block';
  }
  
  async function openEditProjectModal() {
    if (!currentProjectId) return;
    
    try {
      const project = await window.api.getProject(currentProjectId);
      
      if (project) {
        document.getElementById('projectModalTitle').textContent = 'Editar Proyecto';
        document.getElementById('projectName').value = project.name;
        document.getElementById('projectDesc').value = project.description || '';
        isEditingProject = true;
        projectModal.style.display = 'block';
      }
    } catch (error) {
      console.error('Error al cargar proyecto para editar:', error);
    }
  }
  
  function openNewTaskModal() {
    if (!currentProjectId) return;
    
    document.getElementById('taskModalTitle').textContent = 'Nueva Tarea';
    taskForm.reset();
    isEditingTask = false;
    taskModal.style.display = 'block';
  }
  
  function openEditTaskModal(task) {
    document.getElementById('taskModalTitle').textContent = 'Editar Tarea';
    document.getElementById('taskTitle').value = task.title;
    document.getElementById('taskDesc').value = task.description || '';
    document.getElementById('taskAssignee').value = task.assignee || '';
    document.getElementById('taskStatus').value = task.status;
    document.getElementById('taskPriority').value = task.priority || 'media';
    document.getElementById('taskTags').value = task.tags ? task.tags.join(', ') : '';
    
    if (task.dueDate) {
      document.getElementById('taskDueDate').value = task.dueDate.split('T')[0];
    }
    
    isEditingTask = true;
    currentTaskId = task.id;
    taskModal.style.display = 'block';
  }
  
  async function saveProject(e) {
    e.preventDefault();
    
    const projectData = {
      name: document.getElementById('projectName').value,
      description: document.getElementById('projectDesc').value
    };
    
    try {
      if (isEditingProject && currentProjectId) {
        projectData.id = currentProjectId;
        await window.api.updateProject(projectData);
      } else {
        const newProject = await window.api.addProject(projectData);
        currentProjectId = newProject.id;
      }
      
      projectModal.style.display = 'none';
      await loadProjects();
      
      if (currentProjectId) {
        selectProject(currentProjectId);
      }
    } catch (error) {
      console.error('Error al guardar proyecto:', error);
    }
  }
  
  async function saveTask(e) {
    e.preventDefault();
    
    if (!currentProjectId) return;
    
    const taskTags = document.getElementById('taskTags').value.split(',')
      .map(tag => tag.trim())
      .filter(tag => tag);
    
    const taskData = {
      title: document.getElementById('taskTitle').value,
      description: document.getElementById('taskDesc').value,
      assignee: document.getElementById('taskAssignee').value,
      status: document.getElementById('taskStatus').value,
      priority: document.getElementById('taskPriority').value,
      dueDate: document.getElementById('taskDueDate').value || null,
      tags: taskTags
    };
    
    try {
      if (isEditingTask && currentTaskId) {
        await window.api.updateTask(currentProjectId, currentTaskId, taskData);
      } else {
        await window.api.addTask(currentProjectId, taskData);
      }
      
      taskModal.style.display = 'none';
      await selectProject(currentProjectId);
      await loadUpcomingTasks(); // Actualizar tareas próximas
    } catch (error) {
      console.error('Error al guardar tarea:', error);
    }
  }
  
  async function confirmDeleteProject() {
    if (!currentProjectId) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar este proyecto y todas sus tareas?')) {
      try {
        await window.api.deleteProject(currentProjectId);
        currentProjectId = null;
        projectTitle.textContent = 'Selecciona un proyecto';
        projectDescription.textContent = '';
        projectActions.style.display = 'none';
        taskStats.style.display = 'none';
        pendingTasks.innerHTML = '';
        inProgressTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        await loadProjects();
        await loadUpcomingTasks(); // Actualizar tareas próximas
      } catch (error) {
        console.error('Error al eliminar proyecto:', error);
      }
    }
  }
  
  async function confirmDeleteTask(taskId) {
    if (!currentProjectId || !taskId) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
      try {
        await window.api.deleteTask(currentProjectId, taskId);
        await selectProject(currentProjectId);
        await loadUpcomingTasks(); // Actualizar tareas próximas
      } catch (error) {
        console.error('Error al eliminar tarea:', error);
      }
    }
  }
  
  async function exportData() {
    try {
      const projects = await window.api.exportProjects();
      const dataStr = JSON.stringify(projects, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = 'proyectos.json';
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('Error al exportar datos:', error);
    }
  }
  
  async function importData() {
    try {
      const importDataText = document.getElementById('importData').value;
      
      if (!importDataText) {
        alert('Por favor, ingresa datos JSON válidos para importar.');
        return;
      }
      
      let importedProjects;
      try {
        importedProjects = JSON.parse(importDataText);
      } catch (e) {
        alert('Error: Los datos JSON no son válidos. Por favor, verifica el formato.');
        return;
      }
      
      if (!Array.isArray(importedProjects)) {
        alert('Error: El formato de datos no es válido. Se espera un array de proyectos.');
        return;
      }
      
      const confirmImport = confirm(`¿Estás seguro de que deseas importar ${importedProjects.length} proyectos? Esta acción reemplazará todos tus datos actuales.`);
      
      if (confirmImport) {
        await window.api.importProjects(importedProjects);
        importModal.style.display = 'none';
        document.getElementById('importData').value = '';
        await loadProjects();
        await loadUpcomingTasks();
        
        // Limpiar la vista del proyecto actual
        currentProjectId = null;
        projectTitle.textContent = 'Selecciona un proyecto';
        projectDescription.textContent = '';
        projectActions.style.display = 'none';
        taskStats.style.display = 'none';
        pendingTasks.innerHTML = '';
        inProgressTasks.innerHTML = '';
        completedTasks.innerHTML = '';
        
        alert('Datos importados correctamente.');
      }
    } catch (error) {
      console.error('Error al importar datos:', error);
      alert('Error al importar datos. Por favor, inténtalo de nuevo.');
    }
  }
  
  // Función para verificar tareas próximas a vencer
  async function checkUpcomingTasks() {
    await loadUpcomingTasks();
  }
  
  // Funciones para manejar subtareas
  function openNewSubtaskModal(taskId) {
    document.getElementById('subtaskModalTitle').textContent = 'Nueva Subtarea';
    subtaskForm.reset();
    isEditingSubtask = false;
    parentTaskId = taskId;
    subtaskModal.style.display = 'block';
  }

  function openEditSubtaskModal(taskId, subtask) {
    document.getElementById('subtaskModalTitle').textContent = 'Editar Subtarea';
    document.getElementById('subtaskTitle').value = subtask.title;
    document.getElementById('subtaskCompleted').value = subtask.completed.toString();
    
    isEditingSubtask = true;
    parentTaskId = taskId;
    currentSubtaskId = subtask.id;
    subtaskModal.style.display = 'block';
  }

  async function saveSubtask(e) {
    e.preventDefault();
    
    if (!currentProjectId || !parentTaskId) return;
    
    const subtaskData = {
      title: document.getElementById('subtaskTitle').value,
      completed: document.getElementById('subtaskCompleted').value === 'true'
    };
    
    try {
      if (isEditingSubtask && currentSubtaskId) {
        await window.api.updateSubtask(currentProjectId, parentTaskId, currentSubtaskId, subtaskData);
      } else {
        await window.api.addSubtask(currentProjectId, parentTaskId, subtaskData);
      }
      
      subtaskModal.style.display = 'none';
      await selectProject(currentProjectId);
    } catch (error) {
      console.error('Error al guardar subtarea:', error);
    }
  }

  async function updateSubtaskStatus(taskId, subtaskId, completed) {
    if (!currentProjectId) return;
    
    try {
      await window.api.updateSubtask(currentProjectId, taskId, subtaskId, { completed });
      await selectProject(currentProjectId);
    } catch (error) {
      console.error('Error al actualizar estado de subtarea:', error);
    }
  }
  
  async function confirmDeleteSubtask(taskId, subtaskId) {
    if (!currentProjectId) return;
    
    if (confirm('¿Estás seguro de que deseas eliminar esta subtarea?')) {
      try {
        await window.api.deleteSubtask(currentProjectId, taskId, subtaskId);
        await selectProject(currentProjectId);
      } catch (error) {
        console.error('Error al eliminar subtarea:', error);
      }
    }
  }

  // Event listeners adicionales a agregar al final de la sección de event listeners
  subtaskForm.addEventListener('submit', saveSubtask);

  // Cierre de modal para subtareas
  document.querySelectorAll('.close').forEach(closeBtn => {
    closeBtn.addEventListener('click', function() {
      this.closest('.modal').style.display = 'none';
    });
  });

  // Añadir esto al event listener de window.addEventListener('click'...)
  if (event.target === subtaskModal) {
    subtaskModal.style.display = 'none';
  }

  // Iniciar verificación periódica de tareas próximas a vencer (cada hora)
  setInterval(checkUpcomingTasks, 60 * 60 * 1000);
});