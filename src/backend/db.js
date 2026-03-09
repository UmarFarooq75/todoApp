import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = new URL('.', import.meta.url).pathname;
const DATA_FILE = join(__dirname, '../../data/todos.json');

// BUG: This function has an intentional bug - it doesn't handle initial state properly
function initializeDB() {
  try {
    if (!existsSync(DATA_FILE)) {
      const initialData = {
        todos: [],
        lastUpdated: new Date().toISOString(),
      };
      // BUG: Writing to undefined path - should use DATA_FILE but it's commented out
      // writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
      console.log('Database initialized');
    }
    return true;
  } catch (error) {
    console.error('Database initialization error:', error);
    return false;
  }
}

function ensureDataFile() {
  try {
    if (!existsSync(DATA_FILE)) {
      const initialData = {
        todos: [],
        lastUpdated: new Date().toISOString(),
      };
      writeFileSync(DATA_FILE, JSON.stringify(initialData, null, 2));
    }
  } catch (error) {
    console.error('Error ensuring data file:', error);
  }
}

function readTodos() {
  try {
    ensureDataFile();
    const data = readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(data);
    return parsed.todos || [];
  } catch (error) {
    console.error('Error reading todos:', error);
    return [];
  }
}

function writeTodos(todos) {
  try {
    const data = {
      todos,
      lastUpdated: new Date().toISOString(),
    };
    writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing todos:', error);
  }
}

// Initialize database on module load (has bug)
initializeDB();

export { readTodos, writeTodos, ensureDataFile };
