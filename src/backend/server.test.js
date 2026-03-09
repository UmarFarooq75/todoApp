import test from 'node:test';
import assert from 'node:assert';
import { spawn } from 'node:child_process';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

import net from 'node:net';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_FILE = join(__dirname, '../../data/todos.json');

function getFreePort() {
  return new Promise((resolve, reject) => {
    const s = net.createServer();
    s.unref();
    s.on('error', reject);
    s.listen(0, () => {
      const { port } = s.address();
      s.close(() => resolve(port));
    });
  });
}

let PORT = null;
let API_BASE = null;
let server = null;

// Helper to reset database
function resetDB() {
  mkdirSync(join(__dirname, '../../data'), { recursive: true });
  const initialData = { todos: [], lastUpdated: new Date().toISOString() };
  writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
}

// Start server before tests
async function startServer() {
  if (!PORT) {
    PORT = await getFreePort();
    API_BASE = `http://localhost:${PORT}/api`;
  }

  return new Promise((resolve, reject) => {
    server = spawn('node', ['src/backend/server.js'], {
      cwd: join(__dirname, '../..'),
      stdio: 'pipe',
      env: { ...process.env, PORT: String(PORT) },
    });

    server.on('error', reject);

    // Poll the health endpoint until it's ready (timeout 5000ms)
    const start = Date.now();
    (async function waitReady() {
      try {
        const res = await fetch(`${API_BASE}/health`);
        if (res.ok) return resolve();
      } catch (e) {
        // ignore
      }

      if (Date.now() - start > 5000) {
        return reject(new Error('Server did not become ready in time'));
      }

      setTimeout(waitReady, 200);
    })();
  });
}

// Stop server after tests
async function stopServer() {
  return new Promise((resolve) => {
    if (server) {
      server.kill();
      setTimeout(resolve, 500);
    } else {
      resolve();
    }
  });
}

// API Helper
async function apiCall(method, path, body = null) {
  const options = {
    method,
    headers: { 'Content-Type': 'application/json' },
  };

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    body: body ? JSON.stringify(body) : null,
  });

  const data = await response.json();
  return { status: response.status, data };
}

// ===== HEALTH ENDPOINT TESTS =====
test('Health endpoint should return ok status', async () => {
  resetDB();
  await startServer();
  
  try {
    const { status, data } = await apiCall('GET', '/health');
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.status, 'ok');
    assert.ok(data.timestamp);
  } finally {
    await stopServer();
  }
});

test('Health endpoint should include uptime', async () => {
  resetDB();
  await startServer();
  
  try {
    const { data } = await apiCall('GET', '/health');
    assert.strictEqual(typeof data.uptime, 'number');
    assert.ok(data.uptime > 0);
  } finally {
    await stopServer();
  }
});

// ===== CREATE TODO TESTS =====
test('POST /todos should create a new todo', async () => {
  resetDB();
  await startServer();
  
  try {
    const { status, data } = await apiCall('POST', '/todos', {
      title: 'Test Todo',
      description: 'Test Description',
    });
    
    assert.strictEqual(status, 201);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'Test Todo');
    assert.ok(data.data.id);
  } finally {
    await stopServer();
  }
});

test('POST /todos should require title', async () => {
  resetDB();
  await startServer();
  
  try {
    const { status, data } = await apiCall('POST', '/todos', {
      description: 'No title',
    });
    
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    await stopServer();
  }
});

// ===== GET TODOS TESTS =====
test('GET /todos should return all todos', async () => {
  resetDB();
  await startServer();
  
  try {
    // Create a few todos
    await apiCall('POST', '/todos', { title: 'Todo 1' });
    await apiCall('POST', '/todos', { title: 'Todo 2' });
    
    const { status, data } = await apiCall('GET', '/todos');
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.count, 2);
    assert.strictEqual(Array.isArray(data.data), true);
  } finally {
    await stopServer();
  }
});

test('GET /todos?status=completed should filter by status', async () => {
  resetDB();
  await startServer();
  
  try {
    const todo1 = await apiCall('POST', '/todos', { title: 'Todo 1' });
    const todoId = todo1.data.data.id;
    
    await apiCall('PATCH', `/todos/${todoId}/status`, { status: 'completed' });
    
    const { data } = await apiCall('GET', '/todos?status=completed');
    
    assert.strictEqual(data.count, 1);
    assert.strictEqual(data.data[0].status, 'completed');
  } finally {
    await stopServer();
  }
});

test('GET /todos/:id should return single todo', async () => {
  resetDB();
  await startServer();
  
  try {
    const created = await apiCall('POST', '/todos', { title: 'Find Me' });
    const todoId = created.data.data.id;
    
    const { status, data } = await apiCall('GET', `/todos/${todoId}`);
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'Find Me');
  } finally {
    await stopServer();
  }
});

test('GET /todos/:id should return 404 for non-existent', async () => {
  resetDB();
  await startServer();
  
  try {
    const { status, data } = await apiCall('GET', '/todos/non-existent');
    
    assert.strictEqual(status, 404);
    assert.strictEqual(data.success, false);
  } finally {
    await stopServer();
  }
});

// ===== UPDATE TODO TESTS =====
test('PUT /todos/:id should update todo', async () => {
  resetDB();
  await startServer();
  
  try {
    const created = await apiCall('POST', '/todos', { title: 'Original' });
    const todoId = created.data.data.id;
    
    const { status, data } = await apiCall('PUT', `/todos/${todoId}`, {
      title: 'Updated',
      priority: 'high',
    });
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.title, 'Updated');
    assert.strictEqual(data.data.priority, 'high');
  } finally {
    await stopServer();
  }
});

test('PATCH /todos/:id/status should update status', async () => {
  resetDB();
  await startServer();
  
  try {
    const created = await apiCall('POST', '/todos', { title: 'Todo' });
    const todoId = created.data.data.id;
    
    const { status, data } = await apiCall('PATCH', `/todos/${todoId}/status`, {
      status: 'in-progress',
    });
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.data.status, 'in-progress');
  } finally {
    await stopServer();
  }
});

// ===== DELETE TODO TESTS =====
test('DELETE /todos/:id should delete todo', async () => {
  resetDB();
  await startServer();
  
  try {
    const created = await apiCall('POST', '/todos', { title: 'Delete Me' });
    const todoId = created.data.data.id;
    
    const deleteRes = await apiCall('DELETE', `/todos/${todoId}`);
    assert.strictEqual(deleteRes.status, 200);
    assert.strictEqual(deleteRes.data.success, true);
    
    const getRes = await apiCall('GET', `/todos/${todoId}`);
    assert.strictEqual(getRes.status, 404);
  } finally {
    await stopServer();
  }
});

test('DELETE /todos/completed/all should delete all completed', async () => {
  resetDB();
  await startServer();
  
  try {
    const todo1 = await apiCall('POST', '/todos', { title: 'Todo 1' });
    const todo2 = await apiCall('POST', '/todos', { title: 'Todo 2' });
    const todo3 = await apiCall('POST', '/todos', { title: 'Todo 3' });
    
    await apiCall('PATCH', `/todos/${todo1.data.data.id}/status`, { status: 'completed' });
    await apiCall('PATCH', `/todos/${todo2.data.data.id}/status`, { status: 'completed' });
    
    const { data } = await apiCall('DELETE', '/todos/completed/all');
    
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.deletedCount, 2);
  } finally {
    await stopServer();
  }
});

// ===== SEARCH TESTS =====
test('GET /search?q=query should search todos', async () => {
  resetDB();
  await startServer();
  
  try {
    await apiCall('POST', '/todos', { title: 'Learn Node.js' });
    await apiCall('POST', '/todos', { title: 'Learn React' });
    await apiCall('POST', '/todos', { title: 'Buy Groceries' });
    
    const { status, data } = await apiCall('GET', '/search?q=Learn');
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.count, 2);
  } finally {
    await stopServer();
  }
});

test('GET /search without query should return 400', async () => {
  resetDB();
  await startServer();
  
  try {
    const { status, data } = await apiCall('GET', '/search');
    
    assert.strictEqual(status, 400);
    assert.strictEqual(data.success, false);
  } finally {
    await stopServer();
  }
});

// ===== STATS TESTS =====
test('GET /stats should return statistics', async () => {
  resetDB();
  await startServer();
  
  try {
    const todo1 = await apiCall('POST', '/todos', { title: 'Todo 1' });
    const todo2 = await apiCall('POST', '/todos', { title: 'Todo 2' });
    const todo3 = await apiCall('POST', '/todos', { title: 'Todo 3' });
    
    await apiCall('PATCH', `/todos/${todo1.data.data.id}/status`, { status: 'completed' });
    await apiCall('PATCH', `/todos/${todo2.data.data.id}/status`, { status: 'in-progress' });
    
    const { status, data } = await apiCall('GET', '/stats');
    
    assert.strictEqual(status, 200);
    assert.strictEqual(data.success, true);
    assert.strictEqual(data.data.total, 3);
    assert.strictEqual(data.data.completed, 1);
    assert.strictEqual(data.data.inProgress, 1);
    assert.strictEqual(data.data.todo, 1);
  } finally {
    await stopServer();
  }
});

// ===== RESPONSE FORMAT TESTS =====
test('All responses should follow standard format', async () => {
  resetDB();
  await startServer();
  
  try {
    const { data } = await apiCall('GET', '/todos');
    
    assert.ok('success' in data);
    assert.ok('data' in data || 'error' in data);
  } finally {
    await stopServer();
  }
});

test('Error responses should have success=false', async () => {
  resetDB();
  await startServer();
  
  try {
    const { data } = await apiCall('GET', '/todos/non-existent');
    
    assert.strictEqual(data.success, false);
    assert.ok(data.error);
  } finally {
    await stopServer();
  }
});

// ===== BUG DETECTION TEST =====
test('🐛 BUG: Updating status incorrectly sets closedDate', async () => {
  resetDB();
  await startServer();
  
  try {
    const created = await apiCall('POST', '/todos', { title: 'Test Bug' });
    const todoId = created.data.data.id;
    
    // Update to in-progress
    const updated = await apiCall('PATCH', `/todos/${todoId}/status`, {
      status: 'in-progress',
    });
    
    // BUG: closedDate should be null but it's not
    if (updated.data.data.closedDate) {
      console.log('  ⚠️  BUG FOUND: closedDate is set to ' + updated.data.data.closedDate);
      console.log('  Expected: null, Got: ' + updated.data.data.closedDate);
    }
    
    assert.strictEqual(updated.data.data.closedDate, null);
  } finally {
    await stopServer();
  }
});

console.log('\n✅ API integration tests defined. Run with: npm test\n');
