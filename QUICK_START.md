# Todo App - Quick Start

## 🚀 Quick Setup (2 minutes)

### 1. Install dependencies
```bash
npm install
```

### 2. Terminal 1 - Start Backend
```bash
npm start
```
You should see:
```
╔══════════════════════════════════════╗
║     📝 TODO APP API STARTED          ║
╠══════════════════════════════════════╣
║ Server: http://localhost:3001        ║
║ API:    http://localhost:3001/api   ║
║ Health: http://localhost:3001/api/health ║
╚══════════════════════════════════════╝
```

### 3. Terminal 2 - Start Frontend
```bash
npm run client
```

### 4. Open in Browser
Visit: http://localhost:8000

## ✨ Try These Features

1. **Add a Todo**
   - Type title: "Learn Node.js"
   - Add description
   - Set due date
   - Click "Add Todo"

2. **View Stats** 
   - Click 📊 button in header
   - See counts and overdue items

3. **Search**
   - Type in search box
   - Instant results

4. **Filter**
   - Click buttons: All, To Do, In Progress, Completed

5. **Edit Todo**
   - Click on any todo
   - Modal opens with full details
   - Change status, priority, tags
   - Click "Save Changes"

6. **Mark Complete**
   - Check the checkbox ✓
   - Todo is marked as completed
   - Closed date is recorded

## 🐛 Find the Bug

In `src/backend/db.js`, there's an intentional bug in the initialization function.

**Hint:** Look at the `initializeDB()` function - something is commented out that shouldn't be!

Can you fix it? 😄

## 📊 API Examples

### Get all todos
```bash
curl http://localhost:3001/api/todos
```

### Create a todo
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{"title":"Buy milk"}'
```

### Search
```bash
curl "http://localhost:3001/api/search?q=buy"
```

### Health check
```bash
curl http://localhost:3001/api/health
```

## 📝 Features

- ✅ Full CRUD operations
- ✅ Status tracking (To Do, In Progress, Completed)
- ✅ Priority levels (Low, Medium, High)
- ✅ Due dates with overdue detection
- ✅ Tags system
- ✅ Search functionality
- ✅ Statistics dashboard
- ✅ Local JSON storage
- ✅ Beautiful responsive UI
- ✅ RESTful API

## 🛠️ Development

### Available Scripts

```bash
npm start              # Start backend server
npm run dev            # Start with watch mode (auto-restart)
npm run client         # Start frontend dev server
npm test               # Run tests (when added)
```

## 📂 Project Structure

```
├── src/
│   ├── backend/
│   │   ├── server.js          # Express app & routes
│   │   ├── todoService.js     # Business logic
│   │   └── db.js              # Database & file I/O
│   └── frontend/
│       ├── index.html         # UI
│       ├── styles.css         # Styling
│       └── script.js          # Client logic
├── data/
│   └── todos.json             # Local data storage
└── package.json
```

## 🎯 Next Steps

1. Try creating some todos
2. Find and fix the bug
3. Add more features:
   - Recurring todos
   - Categories
   - Export to CSV
   - Notifications

## ❓ Need Help?

- Check the API docs in README.md
- Look at the console for errors
- Inspect the network tab in DevTools
- Review the code comments

Happy todo-ing! 📝✨
