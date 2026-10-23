import Fastify, { type FastifyError, type FastifyInstance } from 'fastify'
import fastifyStatic from '@fastify/static'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { createDatabase } from './db.js'
import type { components } from './generated/api-types.js'
import { requestSchemas } from './generated/schemas.js'
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

type ApiError = components['schemas']['ApiError']
type CreateEventTypeRequest = components['schemas']['CreateEventTypeRequest']
type CreateBookingRequest = components['schemas']['CreateBookingRequest']

const errorBody = (code: ApiError['code'], message: string): ApiError => ({ code, message })

const validationMessages: Record<string, string> = {
  '/api/v1/event-types': 'Проверьте название (2–80 символов), описание (5–500 символов) и длительность (30, 60, 90 или 120 минут)',
  '/api/v1/bookings': 'Проверьте имя (2–80 символов), email и выбранное время',
}

const int32 = { type: 'number' as const, validate: (value: number) => Number.isInteger(value) && Math.abs(value) < 2 ** 31 }

export async function buildApp(options: BuildOptions = {}): Promise<FastifyInstance> {
  const app = Fastify({ logger: false, ajv: { customOptions: { formats: { int32 } } } })
  const database = createDatabase(options.databasePath ?? process.env.DATABASE_PATH ?? './data/calendar.db')

  app.addHook('onClose', async () => database.close())

  // Fastify reports schema violations and body parsing failures (invalid JSON, wrong content type,
  // too large payload) with its own codes; the contract promises ApiError with status 400.
  app.setErrorHandler((error: FastifyError, request, reply) => {
    const status = error.statusCode ?? 500
    if (error.validation || (status >= 400 && status < 500)) {
      const message = validationMessages[request.routeOptions.url ?? ''] ?? 'Некорректный запрос'
      return reply.code(400).send(errorBody('VALIDATION_ERROR', message))
    }
    request.log.error(error)
    return reply.code(500).send({ message: 'Внутренняя ошибка сервера' })
  })

  app.get('/api/v1/health', async () => ({ status: 'ok' as const }))

  app.get('/api/v1/event-types', async () => listEventTypes(database))

  app.post<{ Body: CreateEventTypeRequest }>(
    '/api/v1/event-types',
    { schema: { body: requestSchemas.EventTypes_create.body } },
    async (request, reply) => {
      const input = { ...request.body, title: request.body.title.trim(), description: request.body.description.trim() }
      if (input.title.length < 2 || input.description.length < 5) {
        return reply.code(400).send(errorBody('VALIDATION_ERROR', validationMessages['/api/v1/event-types']))
      }
      return reply.code(201).send(createEventType(database, input))
    },
  )

  app.get<{ Params: { eventTypeId: string }; Querystring: { days?: number } }>(
    '/api/v1/event-types/:eventTypeId/slots',
    { schema: { params: requestSchemas.Slots_list.params, querystring: requestSchemas.Slots_list.querystring } },
    async (request, reply) => {
      const eventType = findEventType(database, request.params.eventTypeId)
      if (!eventType) return reply.code(404).send(errorBody('NOT_FOUND', 'Тип встречи не найден'))
      return listSlots(database, eventType, request.query.days ?? 14)
    },
  )

  app.get('/api/v1/bookings', async () => listBookings(database))

  app.post<{ Body: CreateBookingRequest }>(
    '/api/v1/bookings',
    { schema: { body: requestSchemas.Bookings_create.body } },
    async (request, reply) => {
      const input = { ...request.body, guestName: request.body.guestName.trim(), guestEmail: request.body.guestEmail.trim() }
      if (input.guestName.length < 2) {
        return reply.code(400).send(errorBody('VALIDATION_ERROR', validationMessages['/api/v1/bookings']))
      }
      const eventType = findEventType(database, input.eventTypeId)
      if (!eventType) return reply.code(404).send(errorBody('NOT_FOUND', 'Тип встречи не найден'))

      const startAt = new Date(input.startAt).toISOString()
      const available = listSlots(database, eventType, 14).some((slot) => slot.startAt === startAt)
      if (!available) {
        return reply.code(409).send(errorBody('SLOT_CONFLICT', 'Это время уже занято или недоступно. Выберите другой слот.'))
      }

      try {
        return reply.code(201).send(createBooking(database, eventType, { ...input, startAt }))
      } catch (error) {
        if (error instanceof SlotConflictError) {
          return reply.code(409).send(errorBody('SLOT_CONFLICT', 'Это время уже занято. Выберите другой слот.'))
        }
        throw error
      }
    },
  )

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

