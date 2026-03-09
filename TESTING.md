# 🧪 Todo App - Complete Testing Guide

## Overview

This project includes comprehensive tests using **Node.js built-in Test Runner** (no external dependencies needed).

### Test Files
- **`todoService.test.js`** - Unit tests for business logic (50+ tests)
- **`server.test.js`** - API integration tests (15+ tests)

---

## Running Tests

### All Tests
```bash
npm test
```

### Only Service Tests (Unit Tests)
```bash
npm run test:service
```

### Only API Tests (Integration Tests)
```bash
npm run test:api
```

### With TAP Reporter (Verbose)
```bash
npm run test:all
```

---

## Test Coverage

### Unit Tests (todoService.test.js)

#### ✅ Initialization
- [x] Database initializes properly
- [x] Data persists to file

#### ✅ Create Operations
- [x] Create todo with title only
- [x] Create todo with full details
- [x] Generate unique IDs
- [x] Handle special characters & emoji

#### ✅ Read Operations
- [x] Get all todos
- [x] Get todo by ID
- [x] Return null for non-existent
- [x] Filter by status
- [x] Handle many todos (100+)

#### ✅ Update Operations
- [x] Update title
- [x] Update description
- [x] Update priority
- [x] Update due date
- [x] Update status
- [x] Return null for non-existent
- [x] Multiple rapid updates

#### ✅ Delete Operations
- [x] Delete single todo
- [x] Delete all completed todos
- [x] Bulk deletion

#### ✅ Tag Operations
- [x] Add tag to todo
- [x] Prevent duplicate tags
- [x] Get todos by tag

#### ✅ Search Operations
- [x] Search by title
- [x] Search by description
- [x] Search by tag
- [x] Case-insensitive search
- [x] Empty search results

#### ✅ Statistics
- [x] Calculate total count
- [x] Count by status
- [x] Count high priority
- [x] Detect overdue
- [x] Exclude completed from overdue

#### ✅ Edge Cases
- [x] Empty title
- [x] Very long descriptions (10,000 chars)
- [x] Special characters
- [x] Emoji support
- [x] Concurrent operations
- [x] Data integrity with mixed ops

---

### API Integration Tests (server.test.js)

#### ✅ Health Check
- [x] `/api/health` returns ok
- [x] Includes uptime

#### ✅ Create Todo
- [x] `POST /todos` creates todo
- [x] Returns 201 status
- [x] Requires title
- [x] Returns 400 for empty title

#### ✅ Read Todos
- [x] `GET /todos` returns all
- [x] `GET /todos?status=X` filters
- [x] `GET /todos/:id` returns single
- [x] Returns 404 for non-existent

#### ✅ Update Todo
- [x] `PUT /todos/:id` updates todo
- [x] `PATCH /todos/:id/status` updates status
- [x] Preserves other fields

#### ✅ Delete Todo
- [x] `DELETE /todos/:id` deletes
- [x] `DELETE /todos/completed/all` bulk delete
- [x] Returns 200 on success

#### ✅ Search
- [x] `GET /search?q=query` searches
- [x] Returns results
- [x] Returns 400 without query

#### ✅ Statistics
- [x] `GET /stats` returns stats
- [x] Correct counts
- [x] All fields present

#### ✅ Response Format
- [x] All responses have `success` field
- [x] Success responses have `data`
- [x] Error responses have `error`
- [x] Proper HTTP status codes

#### ✅ Bug Detection
- [x] 🐛 Detects closedDate bug

---

## Bug Testing

### The Bug: Incorrect closedDate

**Location:** `src/backend/todoService.js`, `updateTodo()` function

**What's Tested:**
```javascript
test('🐛 BUG: Should set closedDate only when status is "completed"')
```

**The Issue:**
- Updating ANY status sets `closedDate`
- Should only set when `status === 'completed'`

**Test Output:**
```
⚠️  BUG FOUND: closedDate is set to 2026-03-09T10:30:00.000Z
Expected: null, Got: 2026-03-09T10:30:00.000Z
```

**How to Fix:**
In `todoService.js`, line 18, change:
```javascript
// WRONG:
if (updates.status) {

// CORRECT:
if (updates.status === 'completed' && !todos[index].closedDate) {
```

---

## Test Examples

### Example 1: Running All Tests
```bash
$ npm test

✓ Database should initialize properly (0.5ms)
✓ Should create a new todo with title only (0.3ms)
✓ Should create a todo with full details (0.2ms)
✓ Should generate unique IDs for todos (0.2ms)
...
✓ 🐛 BUG: Should set closedDate only when status is "completed" (0.1ms)

✓ Total tests: 65
✓ Passed: 65
✗ Known bugs: 1
```

### Example 2: Service Tests Only
```bash
$ npm run test:service

✓ Database should initialize properly
✓ Should create a new todo with title only
✓ Should create a todo with full details
✓ Should generate unique IDs for todos
✓ Should get all todos
...

Tests: 50 passed, 50 completed
```

### Example 3: API Tests with Server
```bash
$ npm run test:api

✓ Health endpoint should return ok status
✓ Health endpoint should include uptime
✓ POST /todos should create a new todo
✓ POST /todos should require title
✓ GET /todos should return all todos
...
✓ 🐛 BUG: Updating status incorrectly sets closedDate

Tests: 15 passed, 15 completed
```

---

## Test Categories

### Unit Tests (Fast, No Dependencies)
```bash
npm run test:service
```
- Tests individual functions
- No server needed
- 50+ tests
- Runs in < 1 second

### Integration Tests (Requires Server)
```bash
npm run test:api
```
- Tests full API endpoints
- Spins up server automatically
- 15+ tests
- Runs in 5-10 seconds

### All Tests
```bash
npm test
```
- Runs both unit and integration tests
- Full coverage
- 65+ tests total

---

## What Each Test File Tests

### `todoService.test.js`

**Pure Logic Tests** - No HTTP, no server needed

```
Database Operations
├── Initialize
├── Read todos
└── Write todos

CRUD Operations
├── Create
├── Read (single, all, filtered)
├── Update (all fields)
└── Delete (single, bulk)

Advanced Features
├── Tags (add, get by tag)
├── Search (title, description, tags)
├── Stats (count, overdue, etc)
└── Persistence (file I/O)

Edge Cases
├── Special characters
├── Very long text
├── Emoji
├── Many todos (100+)
└── Concurrent operations
```

### `server.test.js`

**API Endpoint Tests** - Tests HTTP routes

```
Health Check
└── /api/health

CRUD Endpoints
├── POST /api/todos
├── GET /api/todos
├── GET /api/todos/:id
├── PUT /api/todos/:id
├── PATCH /api/todos/:id/status
└── DELETE /api/todos/:id

Advanced Endpoints
├── GET /api/search
├── GET /api/stats
└── DELETE /api/todos/completed/all

Bug Detection
└── 🐛 closedDate bug test
```

---

## Understanding Test Output

### ✓ Passed Test
```
✓ Should create a new todo with title only (0.5ms)
```
- Green checkmark
- Test name
- Execution time

### ✗ Failed Test
```
✗ Should delete a todo (1.2ms)
  AssertionError: expected null to equal "todo-id"
```
- Red X
- Test name
- Assertion error

### Test Skipped
```
- Should test advanced features (skipped)
```
- Dash symbol
- Test name
- Reason

---

## Running Specific Tests

### Test a single function
```bash
# Run only the create tests
node --test src/backend/todoService.test.js --grep "create"
```

### Test a single endpoint
```bash
# Run only POST tests
node --test src/backend/server.test.js --grep "POST"
```

### Test with verbose output
```bash
node --test src/backend/*.test.js --reporter=verbose
```

### Test with spec reporter
```bash
node --test src/backend/*.test.js --reporter=spec
```

---

## Test Development Workflow

### Step 1: Write Code
```javascript
export function createTodo(title) {
  // Implementation
}
```

### Step 2: Write Test
```javascript
test('Should create a todo', () => {
  const todo = createTodo('Test');
  assert.strictEqual(todo.title, 'Test');
});
```

### Step 3: Run Tests
```bash
npm test
```

### Step 4: Verify Results
```
✓ Should create a todo (0.2ms)
```

### Step 5: Refactor (if needed)
```bash
npm test  # Keep verifying
```

---

## Best Practices

### 1. Isolation
Each test is independent with `resetDB()`
```javascript
test('Test name', () => {
  resetDB();  // Start fresh
  // Test code
});
```

### 2. Descriptive Names
Clear, specific test names
```javascript
✓ Should create a todo with title only
✓ Should filter todos by status
✓ Should update priority to high
```

### 3. Single Responsibility
One assertion per test concept
```javascript
test('Should create a todo', () => {
  const todo = todoService.createTodo('Learn Node');
  assert.strictEqual(todo.title, 'Learn Node');
  assert.ok(todo.id);
  assert.strictEqual(todo.status, 'todo');
});
```

### 4. Test Data
Use realistic, meaningful data
```javascript
// Good
const todo = todoService.createTodo('Learn TypeScript');

// Avoid
const todo = todoService.createTodo('x');
```

### 5. Comments for Complex Tests
```javascript
test('Should handle 100 concurrent creates', () => {
  resetDB();
  
  // Create 100 todos rapidly
  for (let i = 0; i < 100; i++) {
    todoService.createTodo(`Todo ${i}`);
  }
  
  // Verify all persisted
  const todos = todoService.getAllTodos();
  assert.strictEqual(todos.length, 100);
});
```

---

## Continuous Integration

### Pre-commit Hook
```bash
#!/bin/bash
npm test
if [ $? -ne 0 ]; then
  echo "Tests failed!"
  exit 1
fi
```

### CI/CD Pipeline
```yaml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
      - run: npm install
      - run: npm test
```

---

## Troubleshooting

### Tests Won't Run
```bash
# Check Node.js version (need 18+)
node --version

# Ensure test files exist
ls src/backend/*.test.js

# Try direct run
node --test src/backend/todoService.test.js
```

### Server Won't Start (API tests)
```bash
# Port 3001 might be in use
lsof -ti:3001 | xargs kill -9

# Try API tests again
npm run test:api
```

### Tests Fail Randomly
```bash
# Some may depend on timing
# Increase timeout or add delays
# Check for concurrent file access
```

---

## Summary

| Test Type | Files | Count | Speed | Requirements |
|-----------|-------|-------|-------|--------------|
| Unit | todoService.test.js | 50+ | < 1s | None |
| Integration | server.test.js | 15+ | 5-10s | Node.js |
| Total | Both | 65+ | ~10s | Node.js 18+ |

**Run Tests:**
```bash
npm test                # All tests
npm run test:service    # Unit only
npm run test:api        # API only
npm run test:all        # Verbose output
```

**Framework:** Node.js built-in Test Runner (no external deps!)

**Coverage:** 65+ tests covering all functionality + bug detection 🐛

Happy Testing! 🧪✨
