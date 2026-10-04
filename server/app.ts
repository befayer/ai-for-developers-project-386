import Fastify, { type FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { z } from 'zod'
import { createDatabase } from './db.js'
import {
  SlotConflictError,
  createBooking,
  createEventType,
  findEventType,
  listBookings,
  listEventTypes,
  listSlots,
} from './repository.js'

type BuildOptions = {
  databasePath?: string
  serveFrontend?: boolean
}

const eventTypeSchema = z.object({
  title: z.string().trim().min(2).max(80),
  description: z.string().trim().min(5).max(500),
  durationMinutes: z.number().int().min(30).max(120).refine((value) => value % 30 === 0),
})

const bookingSchema = z.object({
  eventTypeId: z.string().uuid(),
  startAt: z.string().datetime(),
  guestName: z.string().trim().min(2).max(80),
  guestEmail: z.string().trim().email().max(160),
})

const errorBody = (code: 'VALIDATION_ERROR' | 'NOT_FOUND' | 'SLOT_CONFLICT', message: string) => ({ code, message })

export async function buildApp(options: BuildOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false })
  const database = createDatabase(options.databasePath ?? process.env.DATABASE_PATH ?? './data/calendar.db')

  app.addHook('onClose', async () => database.close())

  app.get('/api/v1/health', async () => ({ status: 'ok' as const }))

  app.get('/api/v1/event-types', async () => listEventTypes(database))

  app.post('/api/v1/event-types', async (request, reply) => {
    const parsed = eventTypeSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send(errorBody('VALIDATION_ERROR', 'Проверьте название, описание и длительность встречи'))
    }
    return reply.code(201).send(createEventType(database, parsed.data))
  })

  app.get<{ Params: { eventTypeId: string }; Querystring: { days?: string } }>(
    '/api/v1/event-types/:eventTypeId/slots',
    async (request, reply) => {
      const eventType = findEventType(database, request.params.eventTypeId)
      if (!eventType) return reply.code(404).send(errorBody('NOT_FOUND', 'Тип встречи не найден'))
      const requestedDays = Number(request.query.days ?? 14)
      const days = Number.isInteger(requestedDays) ? Math.min(Math.max(requestedDays, 1), 14) : 14
      return listSlots(database, eventType, days)
    },
  )

  app.get('/api/v1/bookings', async () => listBookings(database))

  app.post('/api/v1/bookings', async (request, reply) => {
    const parsed = bookingSchema.safeParse(request.body)
    if (!parsed.success) {
      return reply.code(400).send(errorBody('VALIDATION_ERROR', 'Проверьте имя, email и выбранное время'))
    }
    const eventType = findEventType(database, parsed.data.eventTypeId)
    if (!eventType) return reply.code(404).send(errorBody('NOT_FOUND', 'Тип встречи не найден'))

    const available = listSlots(database, eventType, 14).some((slot) => slot.startAt === parsed.data.startAt)
    if (!available) {
      return reply.code(409).send(errorBody('SLOT_CONFLICT', 'Это время уже занято или недоступно. Выберите другой слот.'))
    }

    try {
      return reply.code(201).send(createBooking(database, eventType, parsed.data))
    } catch (error) {
      if (error instanceof SlotConflictError) {
        return reply.code(409).send(errorBody('SLOT_CONFLICT', 'Это время уже занято. Выберите другой слот.'))
      }
      throw error
    }
  })

  const frontendRoot = join(process.cwd(), 'dist')
  if (options.serveFrontend !== false && existsSync(frontendRoot)) {
    await app.register(fastifyStatic, { root: frontendRoot })
    app.setNotFoundHandler((request, reply) => {
      if (request.url.startsWith('/api/')) {
        return reply.code(404).send(errorBody('NOT_FOUND', 'Маршрут API не найден'))
      }
      return reply.sendFile('index.html')
    })
  }

  return app
}

