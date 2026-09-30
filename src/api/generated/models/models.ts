/**
 * A sequence of textual characters.
 */
export type String = string;
export interface EventType {
  id: string;
  title: string;
  description: string;
  durationMinutes: number;
  createdAt: string;
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
export type UtcDateTime = string;
export interface CreateEventTypeRequest {
  title: string;
  description: string;
  durationMinutes: number;
}
export interface ApiError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "SLOT_CONFLICT";
  message: string;
}
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
export interface CreateBookingRequest {
  eventTypeId: string;
  startAt: string;
  guestName: string;
  guestEmail: string;
}
