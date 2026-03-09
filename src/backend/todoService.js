import { v4 as uuidv4 } from 'uuid';
import { readTodos, writeTodos } from './db.js';

// Get all todos with filtering
export function getAllTodos(status = null) {
  const todos = readTodos();
  if (status) {
    return todos.filter(todo => todo.status === status);
  }
  return todos;
}

// Get a single todo
export function getTodoById(id) {
  const todos = readTodos();
  return todos.find(todo => todo.id === id) || null;
}

// Create a new todo
export function createTodo(title, description = '', dueDate = null) {
  const todos = readTodos();
  const newTodo = {
    id: uuidv4(),
    title,
    description,
    status: 'todo', // todo, in-progress, completed
    priority: 'medium', // low, medium, high
    dueDate: dueDate || null,
    closedDate: null,
    tags: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  todos.push(newTodo);
  writeTodos(todos);
  return newTodo;
}

// Update a todo
export function updateTodo(id, updates) {
  const todos = readTodos();
  const index = todos.findIndex(todo => todo.id === id);
  
  if (index === -1) {
    return null;
  }
  
  todos[index] = {
    ...todos[index],
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  
  // BUG: This sets closedDate for ANY status update, not just when completing
  // It should check: if (updates.status === 'completed' && !todos[index].closedDate)
  if (updates.status) {
    todos[index].closedDate = new Date().toISOString();
  }
  
  writeTodos(todos);
  return todos[index];
}

// Delete a todo
export function deleteTodo(id) {
  const todos = readTodos();
  const filtered = todos.filter(todo => todo.id !== id);
  writeTodos(filtered);
  return true;
}

// Update todo status
export function updateTodoStatus(id, status) {
  return updateTodo(id, { status });
}

// Add tag to todo
export function addTagToTodo(id, tag) {
  const todo = getTodoById(id);
  if (!todo) return null;
  
  if (!todo.tags.includes(tag)) {
    todo.tags.push(tag);
  }
  
  return updateTodo(id, { tags: todo.tags });
}

// Get todos by tag
export function getTodosByTag(tag) {
  const todos = readTodos();
  return todos.filter(todo => todo.tags.includes(tag));
}

// Get stats
export function getStats() {
  const todos = readTodos();
  return {
    total: todos.length,
    completed: todos.filter(t => t.status === 'completed').length,
    inProgress: todos.filter(t => t.status === 'in-progress').length,
    todo: todos.filter(t => t.status === 'todo').length,
    highPriority: todos.filter(t => t.priority === 'high').length,
    overdue: todos.filter(t => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'completed').length,
  };
}

// Bulk delete completed todos
export function deleteCompletedTodos() {
  const todos = readTodos();
  const filtered = todos.filter(todo => todo.status !== 'completed');
  writeTodos(filtered);
  return todos.filter(todo => todo.status === 'completed').length;
}

// Search todos
export function searchTodos(query) {
  const todos = readTodos();
  const q = query.toLowerCase();
  // BUG: This returns NO results even when matches exist!
  // The problem: using .every() instead of .some() - EVERY field must match, not ANY
  return todos.filter(todo =>
    todo.title.toLowerCase().includes(q) &&
    todo.description.toLowerCase().includes(q) &&
    todo.tags.every(tag => tag.toLowerCase().includes(q))
  );
}
