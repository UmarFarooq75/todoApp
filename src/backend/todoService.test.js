import test from 'node:test';
import assert from 'node:assert';
import { v4 as uuidv4 } from 'uuid';
import * as todoService from './todoService.js';
import { readTodos, writeTodos, ensureDataFile } from './db.js';

// Helper to reset database before each test
function resetDB() {
  writeTodos([]);
}

// ===== HEALTH & INITIALIZATION =====
test('Database should initialize properly', () => {
  resetDB();
  ensureDataFile();
  const todos = readTodos();
  assert.strictEqual(Array.isArray(todos), true);
});

// ===== CREATE TODO TESTS =====
test('Should create a new todo with title only', () => {
  resetDB();
  const todo = todoService.createTodo('Test Todo');
  
  assert.strictEqual(todo.title, 'Test Todo');
  assert.strictEqual(todo.status, 'todo');
  assert.strictEqual(todo.priority, 'medium');
  assert.strictEqual(todo.description, '');
  assert.strictEqual(Array.isArray(todo.tags), true);
  assert.ok(todo.id);
  assert.ok(todo.createdAt);
});

test('Should create a todo with full details', () => {
  resetDB();
  const todo = todoService.createTodo(
    'Complete Project',
    'Finish the Node.js project',
    '2026-03-20'
  );
  
  assert.strictEqual(todo.title, 'Complete Project');
  assert.strictEqual(todo.description, 'Finish the Node.js project');
  assert.strictEqual(todo.dueDate, '2026-03-20');
  assert.strictEqual(todo.status, 'todo');
});

test('Should generate unique IDs for todos', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  
  assert.notStrictEqual(todo1.id, todo2.id);
});

// ===== READ TODO TESTS =====
test('Should get all todos', () => {
  resetDB();
  todoService.createTodo('Todo 1');
  todoService.createTodo('Todo 2');
  todoService.createTodo('Todo 3');
  
  const todos = todoService.getAllTodos();
  assert.strictEqual(todos.length, 3);
});

test('Should get todo by ID', () => {
  resetDB();
  const created = todoService.createTodo('Find Me');
  const found = todoService.getTodoById(created.id);
  
  assert.strictEqual(found.id, created.id);
  assert.strictEqual(found.title, 'Find Me');
});

test('Should return null for non-existent todo', () => {
  resetDB();
  const found = todoService.getTodoById('non-existent-id');
  assert.strictEqual(found, null);
});

test('Should filter todos by status', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  const todo3 = todoService.createTodo('Todo 3');
  
  todoService.updateTodoStatus(todo1.id, 'completed');
  todoService.updateTodoStatus(todo2.id, 'in-progress');
  
  const completed = todoService.getAllTodos('completed');
  const inProgress = todoService.getAllTodos('in-progress');
  const todo = todoService.getAllTodos('todo');
  
  assert.strictEqual(completed.length, 1);
  assert.strictEqual(inProgress.length, 1);
  assert.strictEqual(todo.length, 1);
});

// ===== UPDATE TODO TESTS =====
test('Should update todo title', () => {
  resetDB();
  const todo = todoService.createTodo('Old Title');
  const updated = todoService.updateTodo(todo.id, { title: 'New Title' });
  
  assert.strictEqual(updated.title, 'New Title');
  assert.ok(updated.updatedAt);
});

test('Should update todo description', () => {
  resetDB();
  const todo = todoService.createTodo('Todo', '');
  const updated = todoService.updateTodo(todo.id, { description: 'New Description' });
  
  assert.strictEqual(updated.description, 'New Description');
});

test('Should update todo priority', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  const updated = todoService.updateTodo(todo.id, { priority: 'high' });
  
  assert.strictEqual(updated.priority, 'high');
});

test('Should update todo due date', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  const updated = todoService.updateTodo(todo.id, { dueDate: '2026-04-01' });
  
  assert.strictEqual(updated.dueDate, '2026-04-01');
});

// ===== BUG TEST: closedDate is set incorrectly =====
test('Should set closedDate only when status is "completed"', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');

  // Updating to a non-completed status should NOT set closedDate
  const updated = todoService.updateTodo(todo.id, { status: 'in-progress' });

  assert.strictEqual(updated.closedDate, null);
});

test('Should update todo status to completed', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  const updated = todoService.updateTodoStatus(todo.id, 'completed');
  
  assert.strictEqual(updated.status, 'completed');
});

test('Should update todo status to in-progress', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  const updated = todoService.updateTodoStatus(todo.id, 'in-progress');
  
  assert.strictEqual(updated.status, 'in-progress');
});

test('Should return null when updating non-existent todo', () => {
  resetDB();
  const updated = todoService.updateTodo('non-existent', { title: 'New' });
  assert.strictEqual(updated, null);
});

// ===== DELETE TODO TESTS =====
test('Should delete a todo', () => {
  resetDB();
  const todo = todoService.createTodo('Delete Me');
  todoService.deleteTodo(todo.id);
  
  const found = todoService.getTodoById(todo.id);
  assert.strictEqual(found, null);
});

test('Should delete all completed todos', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  const todo3 = todoService.createTodo('Todo 3');
  
  todoService.updateTodoStatus(todo1.id, 'completed');
  todoService.updateTodoStatus(todo2.id, 'completed');
  
  const count = todoService.deleteCompletedTodos();
  const remaining = todoService.getAllTodos();
  
  assert.strictEqual(count, 2);
  assert.strictEqual(remaining.length, 1);
});

// ===== TAG TESTS =====
test('Should add tag to todo', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  const updated = todoService.addTagToTodo(todo.id, 'urgent');
  
  assert.ok(updated.tags.includes('urgent'));
});

test('Should not add duplicate tags', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  todoService.addTagToTodo(todo.id, 'urgent');
  todoService.addTagToTodo(todo.id, 'urgent');
  
  const found = todoService.getTodoById(todo.id);
  assert.strictEqual(found.tags.filter(t => t === 'urgent').length, 1);
});

test('Should get todos by tag', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  const todo3 = todoService.createTodo('Todo 3');
  
  todoService.addTagToTodo(todo1.id, 'urgent');
  todoService.addTagToTodo(todo2.id, 'urgent');
  
  const urgent = todoService.getTodosByTag('urgent');
  assert.strictEqual(urgent.length, 2);
});

// ===== SEARCH TESTS =====
test('Should search todos by title', () => {
  resetDB();
  todoService.createTodo('Learn Node.js');
  todoService.createTodo('Learn React');
  todoService.createTodo('Buy Groceries');
  
  const results = todoService.searchTodos('Learn');
  assert.strictEqual(results.length, 2);
});

test('Should search todos by description', () => {
  resetDB();
  todoService.createTodo('Task 1', 'Complete the project');
  todoService.createTodo('Task 2', 'Review code');
  
  const results = todoService.searchTodos('project');
  assert.strictEqual(results.length, 1);
});

test('Should search todos by tag', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  
  todoService.addTagToTodo(todo1.id, 'javascript');
  todoService.addTagToTodo(todo2.id, 'python');
  
  const results = todoService.searchTodos('javascript');
  assert.strictEqual(results.length, 1);
});

test('Should return empty array for non-matching search', () => {
  resetDB();
  todoService.createTodo('Todo 1');
  
  const results = todoService.searchTodos('nonexistent');
  assert.strictEqual(results.length, 0);
});

test('Search should be case-insensitive', () => {
  resetDB();
  todoService.createTodo('LEARN NODE.JS');
  
  const results = todoService.searchTodos('learn');
  assert.strictEqual(results.length, 1);
});

// ===== STATS TESTS =====
test('Should calculate stats correctly', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  const todo3 = todoService.createTodo('Todo 3');
  
  todoService.updateTodoStatus(todo1.id, 'completed');
  todoService.updateTodoStatus(todo2.id, 'in-progress');
  
  const stats = todoService.getStats();
  
  assert.strictEqual(stats.total, 3);
  assert.strictEqual(stats.completed, 1);
  assert.strictEqual(stats.inProgress, 1);
  assert.strictEqual(stats.todo, 1);
});

test('Should count high priority todos in stats', () => {
  resetDB();
  const todo1 = todoService.createTodo('Todo 1');
  const todo2 = todoService.createTodo('Todo 2');
  
  todoService.updateTodo(todo1.id, { priority: 'high' });
  
  const stats = todoService.getStats();
  assert.strictEqual(stats.highPriority, 1);
});

test('Should detect overdue todos in stats', () => {
  resetDB();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const todo1 = todoService.createTodo('Overdue Task', '', yesterdayStr);
  const todo2 = todoService.createTodo('Not Overdue', '', '2099-12-31');
  
  const stats = todoService.getStats();
  assert.strictEqual(stats.overdue, 1);
});

test('Should not count completed overdue as overdue', () => {
  resetDB();
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split('T')[0];
  
  const todo = todoService.createTodo('Was Overdue', '', yesterdayStr);
  todoService.updateTodoStatus(todo.id, 'completed');
  
  const stats = todoService.getStats();
  assert.strictEqual(stats.overdue, 0);
});

// ===== DATA PERSISTENCE TESTS =====
test('Should persist todos to file', () => {
  resetDB();
  const todo = todoService.createTodo('Persistent Todo');
  
  const todos = readTodos();
  assert.strictEqual(todos.length, 1);
  assert.strictEqual(todos[0].title, 'Persistent Todo');
});

test('Should read todos from file', () => {
  resetDB();
  const created = todoService.createTodo('Created Todo');
  
  const todos = readTodos();
  const found = todos.find(t => t.id === created.id);
  
  assert.ok(found);
  assert.strictEqual(found.title, 'Created Todo');
});

// ===== EDGE CASES =====
test('Should handle empty title gracefully', () => {
  resetDB();
  const todo = todoService.createTodo('');
  assert.strictEqual(todo.title, '');
});

test('Should handle very long descriptions', () => {
  resetDB();
  const longDescription = 'A'.repeat(10000);
  const todo = todoService.createTodo('Todo', longDescription);
  
  assert.strictEqual(todo.description.length, 10000);
});

test('Should handle special characters in title', () => {
  resetDB();
  const specialChars = '!@#$%^&*()_+-=[]{}|;:\'",.<>?/~`';
  const todo = todoService.createTodo(specialChars);
  
  assert.strictEqual(todo.title, specialChars);
});

test('Should handle emoji in title', () => {
  resetDB();
  const emoji = '📝 Todo with emoji 🎯';
  const todo = todoService.createTodo(emoji);
  
  assert.strictEqual(todo.title, emoji);
});

test('Should handle multiple rapid updates', () => {
  resetDB();
  const todo = todoService.createTodo('Todo');
  
  for (let i = 0; i < 10; i++) {
    todoService.updateTodo(todo.id, { title: `Updated ${i}` });
  }
  
  const found = todoService.getTodoById(todo.id);
  assert.strictEqual(found.title, 'Updated 9');
});

// ===== CONCURRENT-LIKE TESTS =====
test('Should handle many todos', () => {
  resetDB();
  
  for (let i = 0; i < 100; i++) {
    todoService.createTodo(`Todo ${i}`);
  }
  
  const todos = todoService.getAllTodos();
  assert.strictEqual(todos.length, 100);
});

test('Should maintain data integrity with mixed operations', () => {
  resetDB();
  const todos = [];
  
  // Create
  for (let i = 0; i < 10; i++) {
    todos.push(todoService.createTodo(`Todo ${i}`));
  }
  
  // Update
  todos.forEach((todo, i) => {
    if (i % 2 === 0) {
      todoService.updateTodoStatus(todo.id, 'completed');
    } else {
      todoService.updateTodoStatus(todo.id, 'in-progress');
    }
  });
  
  // Delete
  todoService.deleteTodo(todos[0].id);
  
  const final = todoService.getAllTodos();
  assert.strictEqual(final.length, 9);
});

console.log('\n✅ All tests defined. Run with: npm test\n');
