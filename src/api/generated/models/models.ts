/**
 * A sequence of textual characters.
 */
export type String = string;
export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: DurationMinutes;
  createdAt: string;
}
export type Uuid = string;
/**
 * Meeting length in minutes: 30–120, a multiple of 30.
 */
export type DurationMinutes = 30 | 60 | 90 | 120;
export type UtcDateTime = string;
/**
 * String fields are trimmed; length limits apply to the trimmed value.
 */
export interface CreateEventTypeRequest {
  title: string;
  description: string;
  durationMinutes: DurationMinutes;
}
/**
 * Every 4xx response uses this shape.
 * VALIDATION_ERROR covers schema violations and malformed requests (invalid JSON, unsupported content type).
 */
export interface ApiError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "SLOT_CONFLICT";
  message: string;
}
/**
 * A 32-bit integer. (`-2,147,483,648` to `2,147,483,647`)
 */
export type Int32 = number;
/**
 * A 64-bit integer. (`-9,223,372,036,854,775,808` to `9,223,372,036,854,775,807`)
 */
export type Int64 = bigint;
/**
 * A whole number. This represent any `integer` value possible.
 * It is commonly represented as `BigInteger` in some languages.
 */
export type Integer = number;
/**
 * A numeric type
 */
export type Numeric = number;
export interface Slot {
  startAt: string;
  endAt: string;
}
export interface Booking {
  id: string;
  eventTypeId: string;
  eventTitle: string;
  startAt: string;
  endAt: string;
  guestName: string;
  guestEmail: string;
  createdAt: string;
}
/**
 * String fields are trimmed; length limits apply to the trimmed value.
 */
export interface CreateBookingRequest {
  eventTypeId: string;
  /**
   * Must equal the startAt of a slot returned by the slots endpoint; otherwise 409 SLOT_CONFLICT.
   */
  startAt: string;
  guestName: string;
  guestEmail: string;
}
