# 📝 Todo App - Full Stack

A modern, feature-rich Todo application with a clean backend API and beautiful frontend interface. Store todos locally with full CRUD operations.

## Features

✅ **Complete Todo Management**
- Create, read, update, delete todos
- Support for title, description, status, priority, due date
- Tags system for organizing todos
- Search functionality
- Filter by status

✅ **Status Tracking**
- To Do
- In Progress
- Completed (with closed date tracking)

✅ **Priority Levels**
- Low
- Medium
- High

✅ **Rich UI**
- Modern, responsive design
- Modal for detailed todo editing
- Real-time status updates
- Stats dashboard
- Overdue detection

✅ **Backend Features**
- RESTful API with all endpoints
- Health check endpoint
- Local JSON file storage
- No authentication required
- CORS enabled
- Error handling

## Project Structure

```
├── src/
│   ├── backend/
│   │   ├── server.js          # Express server & routes
│   │   ├── todoService.js     # Business logic
│   │   └── db.js              # Database operations (HAS INTENTIONAL BUG)
│   └── frontend/
│       ├── index.html         # Main page
│       ├── styles.css         # Styling
│       └── script.js          # Frontend logic
├── data/
│   └── todos.json             # Local storage file
└── package.json
```

## Installation

```bash
npm install
```

## Running the App

### Backend Server (Port 3001)
```bash
npm start
```

Or with watch mode (auto-restart):
```bash
npm run dev
```

### Frontend (Port 8000)
In another terminal:
```bash
npm run client
```

Then open: `http://localhost:8000`

## API Endpoints

### Health Check
- `GET /api/health` - Server status

### Todos CRUD
- `GET /api/todos` - Get all todos (with optional `?status=` filter)
- `GET /api/todos/:id` - Get single todo
- `POST /api/todos` - Create todo
- `PUT /api/todos/:id` - Update todo
- `DELETE /api/todos/:id` - Delete todo

### Status Operations
- `PATCH /api/todos/:id/status` - Update only status

### Filtering & Search
- `GET /api/todos/status/:status` - Get todos by status
- `GET /api/todos/tag/:tag` - Get todos by tag
- `GET /api/search?q=query` - Search todos

### Statistics
- `GET /api/stats` - Get todo stats
- `DELETE /api/todos/completed/all` - Clear completed todos

## API Examples

### Create a todo
```bash
curl -X POST http://localhost:3001/api/todos \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Learn Node.js",
    "description": "Complete the Node.js tutorial",
    "dueDate": "2026-03-15"
  }'
```

### Update todo status
```bash
curl -X PATCH http://localhost:3001/api/todos/{id}/status \
  -H "Content-Type: application/json" \
  -d '{"status": "in-progress"}'
```

### Get stats
```bash
curl http://localhost:3001/api/stats
```

### Search
```bash
curl "http://localhost:3001/api/search?q=learn"
```

## Todo Object Structure

```json
{
  "id": "uuid",
  "title": "string",
  "description": "string",
  "status": "todo|in-progress|completed",
  "priority": "low|medium|high",
  "dueDate": "ISO date or null",
  "closedDate": "ISO date or null",
  "tags": ["string"],
  "createdAt": "ISO date",
  "updatedAt": "ISO date"
}
```

## Known Bug 🐛

There's an intentional bug in `src/backend/db.js` in the `initializeDB()` function. The function doesn't properly write the initial database file. This is intentional for learning purposes.

**Challenge:** Find and fix the bug in the initialization function!

**Hint:** The writeFileSync call is commented out. Uncomment it and see what happens.

## Features to Try

1. **Create todos** with all fields
2. **Mark as complete** using the checkbox
3. **View stats** - Click the stats button
4. **Search** - Use the search bar
5. **Filter** - Click filter buttons (All, To Do, In Progress, Completed)
6. **Edit** - Click a todo to open the detail modal
7. **Add tags** - Add tags in the modal
8. **Set priority** - High priority todos stand out
9. **Track deadlines** - Overdue todos are highlighted
10. **Bulk clear** - Remove all completed todos at once

## Technical Stack

**Backend:**
- Node.js (ES Modules)
- Express.js
- CORS enabled
- File-based storage (JSON)

**Frontend:**
- Vanilla HTML/CSS/JavaScript
- Responsive design
- Fetch API for HTTP requests
- Modal dialogs

**Storage:**
- Local JSON file (`data/todos.json`)
- No database required
- Persistent storage

## Performance

- Lightweight (no heavy dependencies)
- Fast local storage
- Instant UI updates
- Responsive design
- Mobile-friendly

## Future Enhancements

- [ ] Database (SQLite/MongoDB)
- [ ] User authentication
- [ ] Recurring todos
- [ ] Collaborative features
- [ ] Dark mode
- [ ] Todo categories
- [ ] Export to CSV/PDF
- [ ] Cloud sync
- [ ] Mobile app

## License

MIT
