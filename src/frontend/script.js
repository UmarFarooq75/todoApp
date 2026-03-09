const API_URL = 'http://localhost:3001/api';

let allTodos = [];
let currentFilter = 'all';
let currentTodo = null;

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
  loadTodos();
  setupEventListeners();
});

// Event Listeners
function setupEventListeners() {
  document.getElementById('todoForm').addEventListener('submit', handleAddTodo);
  document.getElementById('clearCompleted').addEventListener('click', handleClearCompleted);
  document.getElementById('statsBtn').addEventListener('click', toggleStats);
  document.getElementById('searchInput').addEventListener('input', handleSearch);

  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      currentFilter = e.target.dataset.filter;
      renderTodos();
    });
  });

  // Modal
  document.getElementById('closeBtn').addEventListener('click', closeModal);
  document.getElementById('saveBtn').addEventListener('click', handleSaveTodo);
  document.getElementById('deleteBtn').addEventListener('click', handleDeleteTodo);
  document.querySelector('.modal-close').addEventListener('click', closeModal);

  document.getElementById('tagInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag();
    }
  });
}

// Load todos from API
async function loadTodos() {
  try {
    const response = await fetch(`${API_URL}/todos`);
    const result = await response.json();
    if (result.success) {
      allTodos = result.data;
      renderTodos();
    }
  } catch (error) {
    console.error('Error loading todos:', error);
    showError('Failed to load todos');
  }
}

// Add new todo
async function handleAddTodo(e) {
  e.preventDefault();

  const title = document.getElementById('titleInput').value.trim();
  const description = document.getElementById('descriptionInput').value.trim();
  const dueDate = document.getElementById('dueDateInput').value;
  const priority = document.getElementById('priorityInput').value;

  if (!title) {
    showError('Please enter a title');
    return;
  }

  try {
    const response = await fetch(`${API_URL}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, dueDate: dueDate || null }),
    });

    const result = await response.json();

    if (result.success) {
      const newTodo = result.data;
      
      // Update priority if not default
      if (priority !== 'medium') {
        await updateTodo(newTodo.id, { priority });
      }

      document.getElementById('todoForm').reset();
      loadTodos();
      showSuccess('Todo added!');
    } else {
      showError(result.error);
    }
  } catch (error) {
    console.error('Error adding todo:', error);
    showError('Failed to add todo');
  }
}

// Render todos
function renderTodos() {
  const todosList = document.getElementById('todosList');
  
  let filtered = allTodos;

  // Apply filter
  if (currentFilter !== 'all') {
    filtered = allTodos.filter(todo => todo.status === currentFilter);
  }

  if (filtered.length === 0) {
    todosList.innerHTML = '<div class="empty-state">📭 No todos found</div>';
    return;
  }

  todosList.innerHTML = filtered.map(todo => createTodoElement(todo)).join('');

  // Add event listeners to todo items
  document.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.todo-checkbox') && !e.target.closest('.todo-actions')) {
        openModal(item.dataset.id);
      }
    });
  });

  document.querySelectorAll('.todo-checkbox').forEach(checkbox => {
    checkbox.addEventListener('change', (e) => {
      e.stopPropagation();
      const id = e.target.closest('.todo-item').dataset.id;
      const todo = allTodos.find(t => t.id === id);
      const newStatus = e.target.checked ? 'completed' : 'todo';
      updateTodo(id, { status: newStatus });
    });
  });

  document.querySelectorAll('.todo-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const id = btn.closest('.todo-item').dataset.id;
      const action = btn.dataset.action;
      
      if (action === 'delete') {
        if (confirm('Delete this todo?')) {
          deleteTodo(id);
        }
      }
    });
  });
}

function createTodoElement(todo) {
  const isCompleted = todo.status === 'completed';
  const isOverdue = todo.dueDate && new Date(todo.dueDate) < new Date() && !isCompleted;
  const dueDateStr = todo.dueDate ? new Date(todo.dueDate).toLocaleDateString() : '';

  return `
    <div class="todo-item ${isCompleted ? 'completed' : ''}" data-id="${todo.id}">
      <input 
        type="checkbox" 
        class="todo-checkbox" 
        ${isCompleted ? 'checked' : ''}
      >
      <div class="todo-content">
        <div class="todo-title">${escapeHtml(todo.title)}</div>
        ${todo.description ? `<div class="todo-description">${escapeHtml(todo.description)}</div>` : ''}
        <div class="todo-meta">
          <span class="priority-badge ${todo.priority}">${todo.priority}</span>
          <span class="status-badge ${todo.status}">${todo.status.replace('-', ' ')}</span>
          ${todo.dueDate ? `<span class="due-date ${isOverdue ? 'overdue' : ''}">${isOverdue ? '⚠️ ' : '📅 '}${dueDateStr}</span>` : ''}
          ${todo.tags.map(tag => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}
        </div>
      </div>
      <div class="todo-actions">
        <button class="todo-btn" data-action="delete">🗑️</button>
      </div>
    </div>
  `;
}

// Modal functions
function openModal(todoId) {
  currentTodo = allTodos.find(t => t.id === todoId);
  if (!currentTodo) return;

  document.getElementById('modalTitle').textContent = currentTodo.title;
  document.getElementById('modalStatus').value = currentTodo.status;
  document.getElementById('modalDescription').value = currentTodo.description;
  document.getElementById('modalPriority').value = currentTodo.priority;
  document.getElementById('modalDueDate').value = currentTodo.dueDate || '';

  renderTags();

  document.getElementById('createdDate').textContent = new Date(currentTodo.createdAt).toLocaleString();
  document.getElementById('updatedDate').textContent = new Date(currentTodo.updatedAt).toLocaleString();

  if (currentTodo.closedDate) {
    document.getElementById('closedDateInfo').style.display = 'block';
    document.getElementById('closedDate').textContent = new Date(currentTodo.closedDate).toLocaleString();
  } else {
    document.getElementById('closedDateInfo').style.display = 'none';
  }

  document.getElementById('todoModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('todoModal').style.display = 'none';
  currentTodo = null;
}

async function handleSaveTodo() {
  if (!currentTodo) return;

  const updates = {
    title: document.getElementById('modalTitle').textContent,
    description: document.getElementById('modalDescription').value,
    status: document.getElementById('modalStatus').value,
    priority: document.getElementById('modalPriority').value,
    dueDate: document.getElementById('modalDueDate').value || null,
  };

  await updateTodo(currentTodo.id, updates);
  closeModal();
}

async function handleDeleteTodo() {
  if (!currentTodo) return;
  
  if (confirm('Delete this todo?')) {
    await deleteTodo(currentTodo.id);
    closeModal();
  }
}

// API functions
async function updateTodo(id, updates) {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const result = await response.json();
    if (result.success) {
      loadTodos();
      showSuccess('Todo updated!');
    } else {
      showError(result.error);
    }
  } catch (error) {
    console.error('Error updating todo:', error);
    showError('Failed to update todo');
  }
}

async function deleteTodo(id) {
  try {
    const response = await fetch(`${API_URL}/todos/${id}`, { method: 'DELETE' });
    const result = await response.json();
    
    if (result.success) {
      loadTodos();
      showSuccess('Todo deleted!');
    } else {
      showError(result.error);
    }
  } catch (error) {
    console.error('Error deleting todo:', error);
    showError('Failed to delete todo');
  }
}

async function handleClearCompleted() {
  if (confirm('Delete all completed todos?')) {
    try {
      const response = await fetch(`${API_URL}/todos/completed/all`, { method: 'DELETE' });
      const result = await response.json();
      
      if (result.success) {
        loadTodos();
        showSuccess(`Deleted ${result.deletedCount} completed todos!`);
      }
    } catch (error) {
      showError('Failed to clear completed todos');
    }
  }
}

async function handleSearch() {
  const query = document.getElementById('searchInput').value.trim();
  
  if (!query) {
    renderTodos();
    return;
  }

  try {
    const response = await fetch(`${API_URL}/search?q=${encodeURIComponent(query)}`);
    const result = await response.json();
    
    if (result.success) {
      const todosList = document.getElementById('todosList');
      if (result.data.length === 0) {
        todosList.innerHTML = '<div class="empty-state">No results found</div>';
      } else {
        todosList.innerHTML = result.data.map(todo => createTodoElement(todo)).join('');
        setupTodoListeners();
      }
    }
  } catch (error) {
    console.error('Error searching:', error);
  }
}

function setupTodoListeners() {
  // Add event listeners for search results
  document.querySelectorAll('.todo-item').forEach(item => {
    item.addEventListener('click', (e) => {
      if (!e.target.closest('.todo-checkbox')) {
        openModal(item.dataset.id);
      }
    });
  });
}

// Tags
function renderTags() {
  const container = document.getElementById('tagsContainer');
  container.innerHTML = currentTodo.tags.map(tag => `
    <span class="tag">
      ${escapeHtml(tag)}
      <button type="button" onclick="removeTag('${tag}')">×</button>
    </span>
  `).join('');
}

function addTag() {
  const tagInput = document.getElementById('tagInput');
  const tag = tagInput.value.trim();

  if (!tag) return;

  if (!currentTodo.tags.includes(tag)) {
    currentTodo.tags.push(tag);
    renderTags();
    tagInput.value = '';
  }
}

function removeTag(tag) {
  currentTodo.tags = currentTodo.tags.filter(t => t !== tag);
  renderTags();
}

// Stats
async function toggleStats() {
  const statsSection = document.getElementById('statsSection');
  
  if (statsSection.style.display === 'none') {
    await loadStats();
    statsSection.style.display = 'grid';
  } else {
    statsSection.style.display = 'none';
  }
}

async function loadStats() {
  try {
    const response = await fetch(`${API_URL}/stats`);
    const result = await response.json();
    
    if (result.success) {
      const stats = result.data;
      document.getElementById('statTotal').textContent = stats.total;
      document.getElementById('statCompleted').textContent = stats.completed;
      document.getElementById('statInProgress').textContent = stats.inProgress;
      document.getElementById('statTodo').textContent = stats.todo;
      document.getElementById('statHighPriority').textContent = stats.highPriority;
      document.getElementById('statOverdue').textContent = stats.overdue;
    }
  } catch (error) {
    console.error('Error loading stats:', error);
  }
}

// Utils
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

function showError(message) {
  alert('❌ ' + message);
}

function showSuccess(message) {
  console.log('✅ ' + message);
}
