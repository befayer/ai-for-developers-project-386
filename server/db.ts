import Database from 'better-sqlite3'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'
import { randomUUID } from 'node:crypto'

export type CalendarDatabase = Database.Database

export function createDatabase(path: string): CalendarDatabase {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })

  const database = new Database(path)
  database.pragma('foreign_keys = ON')
  database.pragma('journal_mode = WAL')
  database.exec(`
    CREATE TABLE IF NOT EXISTS event_types (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      duration_minutes INTEGER NOT NULL CHECK (duration_minutes BETWEEN 30 AND 120),
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS bookings (
      id TEXT PRIMARY KEY,
      event_type_id TEXT NOT NULL REFERENCES event_types(id),
      start_at TEXT NOT NULL,
      end_at TEXT NOT NULL,
      guest_name TEXT NOT NULL,
      guest_email TEXT NOT NULL,
      created_at TEXT NOT NULL,
      UNIQUE(start_at)
    );

    CREATE INDEX IF NOT EXISTS bookings_time_range_idx ON bookings(start_at, end_at);
  `)

  const count = database.prepare('SELECT COUNT(*) AS count FROM event_types').get() as { count: number }
  if (count.count === 0) seedEventTypes(database)
  return database
}

function seedEventTypes(database: CalendarDatabase) {
  const insert = database.prepare(`
    INSERT INTO event_types (id, title, description, duration_minutes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `)
  const now = new Date().toISOString()
  insert.run(randomUUID(), 'Знакомство', 'Короткий звонок, чтобы познакомиться и обсудить ваш запрос.', 30, now)
  insert.run(randomUUID(), 'Подробная консультация', 'Часовая встреча для детального разбора задачи и следующих шагов.', 60, now)
}

