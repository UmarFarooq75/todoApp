import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import * as todoService from './todoService.js';
import { ensureDataFile } from './db.js';

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  });
});

// GET all todos
app.get('/api/todos', (req, res) => {
  try {
    const status = req.query.status || null;
    const todos = todoService.getAllTodos(status);
    res.json({
      success: true,
      data: todos,
      count: todos.length,
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET single todo
app.get('/api/todos/:id', (req, res) => {
  try {
    const todo = todoService.getTodoById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// CREATE todo
app.post('/api/todos', (req, res) => {
  try {
    const { title, description, dueDate } = req.body;
    
    if (!title || title.trim() === '') {
      return res.status(400).json({ success: false, error: 'Title is required' });
    }
    
    const todo = todoService.createTodo(title, description || '', dueDate || null);
    res.status(201).json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE todo
app.put('/api/todos/:id', (req, res) => {
  try {
    const todo = todoService.updateTodo(req.params.id, req.body);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// UPDATE todo status
app.patch('/api/todos/:id/status', (req, res) => {
  try {
    const { status } = req.body;
    if (!status) {
      return res.status(400).json({ success: false, error: 'Status is required' });
    }
    const todo = todoService.updateTodoStatus(req.params.id, status);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    res.json({ success: true, data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE todo
app.delete('/api/todos/:id', (req, res) => {
  try {
    const todo = todoService.getTodoById(req.params.id);
    if (!todo) {
      return res.status(404).json({ success: false, error: 'Todo not found' });
    }
    todoService.deleteTodo(req.params.id);
    res.json({ success: true, message: 'Todo deleted', data: todo });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET todos by status
app.get('/api/todos/status/:status', (req, res) => {
  try {
    const todos = todoService.getAllTodos(req.params.status);
    res.json({ success: true, data: todos, count: todos.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET todos by tag
app.get('/api/todos/tag/:tag', (req, res) => {
  try {
    const todos = todoService.getTodosByTag(req.params.tag);
    res.json({ success: true, data: todos, count: todos.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// SEARCH todos
app.get('/api/search', (req, res) => {
  try {
    const { q } = req.query;
    if (!q) {
      return res.status(400).json({ success: false, error: 'Query parameter required' });
    }
    const todos = todoService.searchTodos(q);
    res.json({ success: true, data: todos, count: todos.length });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// GET stats
app.get('/api/stats', (req, res) => {
  try {
    const stats = todoService.getStats();
    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// DELETE completed todos
app.delete('/api/todos/completed/all', (req, res) => {
  try {
    const count = todoService.deleteCompletedTodos();
    res.json({ success: true, message: `Deleted ${count} completed todos`, deletedCount: count });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ success: false, error: 'Internal server error' });
});

// Initialize database and start server
ensureDataFile();

app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════╗
║     📝 TODO APP API STARTED          ║
╠══════════════════════════════════════╣
║ Server: http://localhost:${PORT}        ║
║ API:    http://localhost:${PORT}/api   ║
║ Health: http://localhost:${PORT}/api/health ║
╚══════════════════════════════════════╝
  `);
});
