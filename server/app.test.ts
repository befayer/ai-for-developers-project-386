import { afterEach, describe, expect, it } from 'vitest'
import type { FastifyInstance } from 'fastify'
import { buildApp } from './app.js'

let app: FastifyInstance | undefined

afterEach(async () => {
  await app?.close()
  app = undefined
})

describe('Call Calendar API', () => {
  it('passes the smoke check and returns seeded event types', async () => {
    app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
    const health = await app.inject({ method: 'GET', url: '/api/v1/health' })
    expect(health.statusCode).toBe(200)
    expect(health.json()).toEqual({ status: 'ok' })

    const types = await app.inject({ method: 'GET', url: '/api/v1/event-types' })
    expect(types.statusCode).toBe(200)
    expect(types.json()).toHaveLength(2)
  })

  it('books a slot and exposes it on the owner page API', async () => {
    app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
    const [eventType] = (await app.inject({ method: 'GET', url: '/api/v1/event-types' })).json()
    const [slot] = (await app.inject({
      method: 'GET',
      url: `/api/v1/event-types/${eventType.id}/slots`,
    })).json()

    const created = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings',
      payload: { eventTypeId: eventType.id, startAt: slot.startAt, guestName: 'Иван', guestEmail: 'ivan@example.com' },
    })
    expect(created.statusCode).toBe(201)

    const bookings = await app.inject({ method: 'GET', url: '/api/v1/bookings' })
    expect(bookings.statusCode).toBe(200)
    expect(bookings.json()).toEqual([
      expect.objectContaining({ guestName: 'Иван', eventTypeId: eventType.id, startAt: slot.startAt }),
    ])
  })

  it('rejects the same time through another event type on the server', async () => {
    app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
    const eventTypes = (await app.inject({ method: 'GET', url: '/api/v1/event-types' })).json()
    const [slot] = (await app.inject({
      method: 'GET',
      url: `/api/v1/event-types/${eventTypes[0].id}/slots`,
    })).json()

    const first = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings',
      payload: { eventTypeId: eventTypes[0].id, startAt: slot.startAt, guestName: 'Иван', guestEmail: 'ivan@example.com' },
    })
    const conflict = await app.inject({
      method: 'POST',
      url: '/api/v1/bookings',
      payload: { eventTypeId: eventTypes[1].id, startAt: slot.startAt, guestName: 'Анна', guestEmail: 'anna@example.com' },
    })

    expect(first.statusCode).toBe(201)
    expect(conflict.statusCode).toBe(409)
    expect(conflict.json()).toEqual(expect.objectContaining({ code: 'SLOT_CONFLICT' }))
  })

  it('lets the owner create a new event type', async () => {
    app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
    const response = await app.inject({
      method: 'POST',
      url: '/api/v1/event-types',
      payload: { title: 'Разбор проекта', description: 'Обсудим архитектуру и код', durationMinutes: 90 },
    })
    expect(response.statusCode).toBe(201)
    expect(response.json()).toEqual(expect.objectContaining({ title: 'Разбор проекта', durationMinutes: 90 }))
  })
})
