const { app, BrowserWindow, ipcMain, Notification } = require('electron');
const path = require('path');
const db = require('./db/database'); // Importamos nuestra capa de base de datos

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1800,
    height: 1169,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.loadFile('index.html');

  // Abre DevTools en desarrollo para depuración
  // mainWindow.webContents.openDevTools();
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

// Comunicación IPC para gestionar proyectos y tareas usando la capa de base de datos
ipcMain.handle('get-projects', async () => {
  return db.getProjects();
});

ipcMain.handle('get-project', async (event, projectId) => {
  return db.getProjectById(projectId);
});

ipcMain.handle('add-project', async (event, project) => {
  return db.addProject(project);
});

ipcMain.handle('update-project', async (event, updatedProject) => {
  return db.updateProject(updatedProject);
});

ipcMain.handle('delete-project', async (event, projectId) => {
  return db.deleteProject(projectId);
});

ipcMain.handle('add-task', async (event, { projectId, task }) => {
  return db.addTask(projectId, task);
});

ipcMain.handle('update-task', async (event, { projectId, taskId, updatedTask }) => {
  return db.updateTask(projectId, taskId, updatedTask);
});

ipcMain.handle('delete-task', async (event, { projectId, taskId }) => {
  return db.deleteTask(projectId, taskId);
});

// Manejadores para exportar e importar proyectos
ipcMain.handle('export-projects', async () => {
  return db.getProjects();
});

ipcMain.handle('import-projects', async (event, importedProjects) => {
  return db.importData(importedProjects);
});

// Manejador para obtener estadísticas del proyecto
ipcMain.handle('get-project-stats', async (event, projectId) => {
  return db.getProjectStats(projectId);
});

// Manejador para buscar tareas
ipcMain.handle('search-tasks', async (event, searchTerm) => {
  return db.searchTasks(searchTerm);
});

// Manejador para obtener tareas próximas a vencer
ipcMain.handle('get-upcoming-tasks', async (event, daysThreshold) => {
  return db.getUpcomingTasks(daysThreshold);
});

// Manejador para añadir subtareas
ipcMain.handle('add-subtask', async (event, { projectId, taskId, subtask }) => {
  return db.addSubtask(projectId, taskId, subtask);
});

// Manejador para actualizar subtareas
ipcMain.handle('update-subtask', async (event, { projectId, taskId, subtaskId, updatedSubtask }) => {
  return db.updateSubtask(projectId, taskId, subtaskId, updatedSubtask);
});

// Manejador para eliminar subtareas
ipcMain.handle('delete-subtask', async (event, { projectId, taskId, subtaskId }) => {
  return db.deleteSubtask(projectId, taskId, subtaskId);
});

// Función para verificar tareas por vencer
function checkDueTasks() {
  const upcomingTasks = db.getUpcomingTasks(1); // Tareas que vencen en 1 día

  upcomingTasks.forEach(task => {
    new Notification({
      title: '¡Tarea por vencer!',
      body: `La tarea "${task.taskTitle}" del proyecto "${task.projectName}" vence mañana.`,
    }).show();
  });
}

// Verificar tareas por vencer cada 24 horas
setInterval(checkDueTasks, 24 * 60 * 60 * 1000);
