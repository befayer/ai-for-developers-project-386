import { buildApp } from './app.js'

const port = Number(process.env.PORT ?? 3000)
const app = await buildApp()

try {
  await app.listen({ port, host: '0.0.0.0' })
  console.log(`Call Calendar is listening on port ${port}`)
} catch (error) {
  console.error(error)
  process.exit(1)
}

const shutdown = async () => {
  await app.close()
  process.exit(0)
}

process.on('SIGINT', shutdown)
process.on('SIGTERM', shutdown)
