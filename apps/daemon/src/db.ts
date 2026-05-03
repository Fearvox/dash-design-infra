import { Database } from 'bun:sqlite';
import { existsSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

export interface Project {
  id: string;
  name: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectFile {
  id: string;
  project_id: string;
  path: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface Conversation {
  id: string;
  project_id: string;
  role: 'user' | 'agent';
  content: string;
  agent_name: string | null;
  created_at: string;
}

let db: Database;

const SCHEMA = `
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS project_files (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  path TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS conversations (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK(role IN ('user','agent')),
  content TEXT NOT NULL,
  agent_name TEXT,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_project_files_project ON project_files(project_id);
CREATE INDEX IF NOT EXISTS idx_conversations_project ON conversations(project_id);
`;

export function initDB(dataDir = '.od'): Database {
  if (!existsSync(dataDir)) mkdirSync(dataDir, { recursive: true });

  db = new Database(join(dataDir, 'app.sqlite'));
  db.exec('PRAGMA journal_mode=WAL; PRAGMA foreign_keys=ON;');
  db.exec(SCHEMA);
  return db;
}

export function getDB(): Database {
  if (!db) throw new Error('Database not initialized. Call initDB() first.');
  return db;
}

// ── Projects

export function listProjects(): Project[] {
  return getDB().query('SELECT * FROM projects ORDER BY updated_at DESC').all() as Project[];
}

export function getProject(id: string): Project | null {
  return getDB().query('SELECT * FROM projects WHERE id = ?').get(id) as Project | null;
}

export function createProject(name: string): Project {
  const id = crypto.randomUUID();
  getDB().run('INSERT INTO projects (id, name) VALUES (?, ?)', [id, name]);
  return getProject(id)!;
}

export function updateProject(id: string, name: string): Project | null {
  getDB().run("UPDATE projects SET name = ?, updated_at = datetime('now') WHERE id = ?", [name, id]);
  return getProject(id);
}

export function deleteProject(id: string): void {
  getDB().run('DELETE FROM projects WHERE id = ?', [id]);
}

// ── Files

export function listProjectFiles(projectId: string): ProjectFile[] {
  return getDB()
    .query('SELECT * FROM project_files WHERE project_id = ? ORDER BY path')
    .all(projectId) as ProjectFile[];
}

export function getProjectFile(projectId: string, filePath: string): ProjectFile | null {
  return getDB()
    .query('SELECT * FROM project_files WHERE project_id = ? AND path = ?')
    .get(projectId, filePath) as ProjectFile | null;
}

export function upsertProjectFile(projectId: string, filePath: string, content: string): ProjectFile {
  const existing = getProjectFile(projectId, filePath);
  if (existing) {
    getDB().run(
      "UPDATE project_files SET content = ?, updated_at = datetime('now') WHERE id = ?",
      [content, existing.id]
    );
    return getProjectFile(projectId, filePath)!;
  }
  const id = crypto.randomUUID();
  getDB().run(
    'INSERT INTO project_files (id, project_id, path, content) VALUES (?, ?, ?, ?)',
    [id, projectId, filePath, content]
  );
  return getProjectFile(projectId, filePath)!;
}

export function deleteProjectFile(projectId: string, filePath: string): void {
  getDB().run('DELETE FROM project_files WHERE project_id = ? AND path = ?', [projectId, filePath]);
}

// ── Conversations

export function listConversations(projectId: string, limit = 50): Conversation[] {
  return getDB()
    .query('SELECT * FROM conversations WHERE project_id = ? ORDER BY created_at ASC LIMIT ?')
    .all(projectId, limit) as Conversation[];
}

export function addConversation(
  projectId: string,
  role: 'user' | 'agent',
  content: string,
  agentName?: string
): Conversation {
  const id = crypto.randomUUID();
  getDB().run(
    'INSERT INTO conversations (id, project_id, role, content, agent_name) VALUES (?, ?, ?, ?, ?)',
    [id, projectId, role, content, agentName ?? null]
  );
  return getDB()
    .query('SELECT * FROM conversations WHERE id = ?')
    .get(id) as Conversation;
}
