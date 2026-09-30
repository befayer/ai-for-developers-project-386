import { randomUUID } from 'node:crypto'
import type { CalendarDatabase } from './db.js'
import type { components } from './generated/api-types.js'

export type EventType = components['schemas']['EventType']
export type Booking = components['schemas']['Booking']
export type Slot = components['schemas']['Slot']

type EventTypeRow = {
  id: string
  title: string
  description: string
  duration_minutes: number
  created_at: string
}

type BookingRow = {
  id: string
  event_type_id: string
  event_title: string
  start_at: string
  end_at: string
  guest_name: string
  guest_email: string
  created_at: string
}

export function listEventTypes(database: CalendarDatabase): EventType[] {
  const rows = database.prepare(`
    SELECT id, title, description, duration_minutes, created_at
    FROM event_types ORDER BY created_at, title
  `).all() as EventTypeRow[]
  return rows.map(mapEventType)
}

export function findEventType(database: CalendarDatabase, id: string): EventType | null {
  const row = database.prepare(`
    SELECT id, title, description, duration_minutes, created_at
    FROM event_types WHERE id = ?
  `).get(id) as EventTypeRow | undefined
  return row ? mapEventType(row) : null
}

export function createEventType(
  database: CalendarDatabase,
  input: Pick<EventType, 'title' | 'description' | 'durationMinutes'>,
): EventType {
  const result: EventType = {
    id: randomUUID(),
    title: input.title,
    description: input.description,
    durationMinutes: input.durationMinutes,
    createdAt: new Date().toISOString(),
  }
  database.prepare(`
    INSERT INTO event_types (id, title, description, duration_minutes, created_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(result.id, result.title, result.description, result.durationMinutes, result.createdAt)
  return result
}

export function listBookings(database: CalendarDatabase): Booking[] {
  const rows = database.prepare(`
    SELECT b.id, b.event_type_id, e.title AS event_title, b.start_at, b.end_at,
           b.guest_name, b.guest_email, b.created_at
    FROM bookings b
    JOIN event_types e ON e.id = b.event_type_id
    WHERE b.start_at >= ?
    ORDER BY b.start_at
  `).all(new Date().toISOString()) as BookingRow[]
  return rows.map(mapBooking)
}

export function listSlots(database: CalendarDatabase, eventType: EventType, days: number): Slot[] {
  const now = new Date()
  const end = new Date(now)
  end.setUTCDate(end.getUTCDate() + days)

  const occupied = database.prepare(`
    SELECT start_at, end_at FROM bookings WHERE end_at > ? AND start_at < ?
  `).all(now.toISOString(), end.toISOString()) as Array<{ start_at: string; end_at: string }>

  const slots: Slot[] = []
  for (let dayOffset = 0; dayOffset < days; dayOffset += 1) {
    const day = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + dayOffset))
    const weekday = day.getUTCDay()
    if (weekday === 0 || weekday === 6) continue

    for (let minute = 9 * 60; minute + eventType.durationMinutes <= 18 * 60; minute += 30) {
      const start = new Date(day)
      start.setUTCMinutes(minute)
      const finish = new Date(start.getTime() + eventType.durationMinutes * 60_000)
      if (start <= now) continue

      const overlaps = occupied.some(({ start_at, end_at }) =>
        start < new Date(end_at) && finish > new Date(start_at),
      )
      if (!overlaps) slots.push({ startAt: start.toISOString(), endAt: finish.toISOString() })
    }
  }
  return slots
}

export class SlotConflictError extends Error {}

export function createBooking(
  database: CalendarDatabase,
  eventType: EventType,
  input: { startAt: string; guestName: string; guestEmail: string },
): Booking {
  const transaction = database.transaction(() => {
    const start = new Date(input.startAt)
    const end = new Date(start.getTime() + eventType.durationMinutes * 60_000)
    const conflict = database.prepare(`
      SELECT id FROM bookings WHERE start_at < ? AND end_at > ? LIMIT 1
    `).get(end.toISOString(), start.toISOString())
    if (conflict) throw new SlotConflictError('Выбранное время уже занято')

    const booking: Booking = {
      id: randomUUID(),
      eventTypeId: eventType.id,
      eventTitle: eventType.title,
      startAt: start.toISOString(),
      endAt: end.toISOString(),
      guestName: input.guestName,
      guestEmail: input.guestEmail,
      createdAt: new Date().toISOString(),
    }
    try {
      database.prepare(`
        INSERT INTO bookings (
          id, event_type_id, start_at, end_at, guest_name, guest_email, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(
        booking.id,
        booking.eventTypeId,
        booking.startAt,
        booking.endAt,
        booking.guestName,
        booking.guestEmail,
        booking.createdAt,
      )
    } catch (error) {
      if (error instanceof Error && error.message.includes('UNIQUE constraint failed')) {
        throw new SlotConflictError('Выбранное время уже занято')
      }
      throw error
    }
    return booking
  })
  return transaction.immediate()
}

function mapEventType(row: EventTypeRow): EventType {
  return {
    id: row.id,
    title: row.title,
    description: row.description,
    durationMinutes: row.duration_minutes,
    createdAt: row.created_at,
  }
}

function mapBooking(row: BookingRow): Booking {
  return {
    id: row.id,
    eventTypeId: row.event_type_id,
    eventTitle: row.event_title,
    startAt: row.start_at,
    endAt: row.end_at,
    guestName: row.guest_name,
    guestEmail: row.guest_email,
    createdAt: row.created_at,
  }
}

