import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.resolve(__dirname, '../dev.db');
const db = new Database(dbPath);

// Initialize tables automatically
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    phone TEXT UNIQUE NOT NULL,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS loans (
    id TEXT PRIMARY KEY,
    userId TEXT NOT NULL,
    friendName TEXT NOT NULL,
    amount REAL NOT NULL,
    dueDate TEXT NOT NULL,
    isRepaid INTEGER DEFAULT 0,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userId) REFERENCES users(id)
  );
`);

export default db;