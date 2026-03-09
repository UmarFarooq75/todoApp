import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = fileURLToPath(new URL('.', import.meta.url));
const DATA_FILE = join(__dirname, '../../data/todos.json');

function ensureDataFile() {
  try {
    if (!existsSync(DATA_FILE)) {
      mkdirSync(join(__dirname, '../../data'), { recursive: true });
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

export { readTodos, writeTodos, ensureDataFile };
