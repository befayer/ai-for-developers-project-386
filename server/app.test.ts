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

  describe('contract boundaries for POST /api/v1/event-types', () => {
    const create = async (overrides: Record<string, unknown>) => {
      app ??= await buildApp({ databasePath: ':memory:', serveFrontend: false })
      return app.inject({
        method: 'POST',
        url: '/api/v1/event-types',
        payload: { title: 'Разбор проекта', description: 'Обсудим архитектуру и код', durationMinutes: 30, ...overrides },
      })
    }

    it.each([
      ['title of 2 characters', { title: 'ab' }],
      ['title of 80 characters', { title: 'a'.repeat(80) }],
      ['description of 500 characters', { description: 'a'.repeat(500) }],
      ['duration 30', { durationMinutes: 30 }],
      ['duration 60', { durationMinutes: 60 }],
      ['duration 120', { durationMinutes: 120 }],
    ])('accepts %s', async (_, overrides) => {
      expect((await create(overrides)).statusCode).toBe(201)
    })

    it.each([
      ['title of 1 character', { title: 'a' }],
      ['title of 81 characters', { title: 'a'.repeat(81) }],
      ['blank title', { title: '   ' }],
      ['description of 501 characters', { description: 'a'.repeat(501) }],
      ['duration 0', { durationMinutes: 0 }],
      ['duration 45', { durationMinutes: 45 }],
      ['duration 150', { durationMinutes: 150 }],
      ['missing title', { title: undefined }],
    ])('rejects %s with VALIDATION_ERROR', async (_, overrides) => {
      const response = await create(overrides)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ code: 'VALIDATION_ERROR', message: expect.any(String) })
    })
  })

  describe('contract boundaries for POST /api/v1/bookings', () => {
    const book = async (overrides: Record<string, unknown>) => {
      app ??= await buildApp({ databasePath: ':memory:', serveFrontend: false })
      const [eventType] = (await app.inject({ method: 'GET', url: '/api/v1/event-types' })).json()
      const [slot] = (await app.inject({ method: 'GET', url: `/api/v1/event-types/${eventType.id}/slots` })).json()
      return app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        payload: { eventTypeId: eventType.id, startAt: slot.startAt, guestName: 'Иван', guestEmail: 'ivan@example.com', ...overrides },
      })
    }

    it('accepts a guest name of 80 characters', async () => {
      expect((await book({ guestName: 'a'.repeat(80) })).statusCode).toBe(201)
    })

    it.each([
      ['guest name of 81 characters', { guestName: 'a'.repeat(81) }],
      ['invalid email', { guestEmail: 'not-an-email' }],
      ['non-uuid event type id', { eventTypeId: 'abc' }],
      ['non date-time startAt', { startAt: 'tomorrow' }],
    ])('rejects %s with VALIDATION_ERROR', async (_, overrides) => {
      const response = await book(overrides)
      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ code: 'VALIDATION_ERROR', message: expect.any(String) })
    })

    it('returns NOT_FOUND for an unknown event type', async () => {
      const response = await book({ eventTypeId: '00000000-0000-4000-8000-000000000000' })
      expect(response.statusCode).toBe(404)
      expect(response.json()).toEqual(expect.objectContaining({ code: 'NOT_FOUND' }))
    })
  })

  describe('malformed requests use the ApiError shape', () => {
    it.each([
      ['invalid JSON', 'application/json', '{"eventTypeId":'],
      ['empty JSON body', 'application/json', ''],
      ['unsupported content type', 'text/plain', 'hello'],
    ])('answers %s with 400 VALIDATION_ERROR', async (_, contentType, payload) => {
      app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
      const response = await app.inject({
        method: 'POST',
        url: '/api/v1/bookings',
        headers: { 'content-type': contentType },
        payload,
      })
      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual({ code: 'VALIDATION_ERROR', message: expect.any(String) })
    })

    it.each(['0', '15', 'abc'])('rejects days=%s for slots', async (days) => {
      app = await buildApp({ databasePath: ':memory:', serveFrontend: false })
      const [eventType] = (await app.inject({ method: 'GET', url: '/api/v1/event-types' })).json()
      const response = await app.inject({ method: 'GET', url: `/api/v1/event-types/${eventType.id}/slots?days=${days}` })
      expect(response.statusCode).toBe(400)
      expect(response.json()).toEqual(expect.objectContaining({ code: 'VALIDATION_ERROR' }))
    })
  })
})
