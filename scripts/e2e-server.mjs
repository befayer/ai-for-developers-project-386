import { rm } from 'node:fs/promises'

// Every e2e run starts from the seeded event types without bookings.
const databasePath = process.env.DATABASE_PATH ?? './data/e2e.db'
await Promise.all(['', '-wal', '-shm'].map((suffix) => rm(`${databasePath}${suffix}`, { force: true })))
await import('../dist-server/index.js')
