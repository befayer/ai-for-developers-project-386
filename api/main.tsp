import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "Call Calendar API" })
@server("http://localhost:3000", "Local development")
namespace CallCalendar;

@format("date-time")
scalar UtcDateTime extends string;

@format("uuid")
scalar Uuid extends string;

@doc("Meeting length in minutes: 30–120, a multiple of 30.")
union DurationMinutes {
  30,
  60,
  90,
  120,
}

model EventType {
  id: Uuid;
  title: string;
  description: string;
  durationMinutes: DurationMinutes;
  createdAt: UtcDateTime;
}

@doc("String fields are trimmed; length limits apply to the trimmed value.")
model CreateEventTypeRequest {
  @minLength(2)
  @maxLength(80)
  title: string;

  @minLength(5)
  @maxLength(500)
  description: string;

  durationMinutes: DurationMinutes;
}

model Slot {
  startAt: UtcDateTime;
  endAt: UtcDateTime;
}

model Booking {
  id: Uuid;
  eventTypeId: Uuid;
  eventTitle: string;
  startAt: UtcDateTime;
  endAt: UtcDateTime;
  guestName: string;
  guestEmail: string;
  createdAt: UtcDateTime;
}

@doc("String fields are trimmed; length limits apply to the trimmed value.")
model CreateBookingRequest {
  eventTypeId: Uuid;

  @doc("Must equal the startAt of a slot returned by the slots endpoint; otherwise 409 SLOT_CONFLICT.")
  startAt: UtcDateTime;

  @minLength(2)
  @maxLength(80)
  guestName: string;

  @format("email")
  @maxLength(160)
  guestEmail: string;
}

@doc("""
  Every 4xx response uses this shape.
  VALIDATION_ERROR covers schema violations and malformed requests (invalid JSON, unsupported content type).
  """)
model ApiError {
  code: "VALIDATION_ERROR" | "NOT_FOUND" | "SLOT_CONFLICT";
  message: string;
}

model BadRequestResponse {
  @statusCode statusCode: 400;
  @body body: ApiError;
}

model NotFoundResponse {
  @statusCode statusCode: 404;
  @body body: ApiError;
}

model ConflictResponse {
  @statusCode statusCode: 409;
  @body body: ApiError;
}

model CreatedEventTypeResponse {
  @statusCode statusCode: 201;
  @body body: EventType;
}

model CreatedBookingResponse {
  @statusCode statusCode: 201;
  @body body: Booking;
}

@route("/api/v1/event-types")
@tag("Event types")
interface EventTypes {
  @get list(): EventType[];
  @post create(@body request: CreateEventTypeRequest): CreatedEventTypeResponse | BadRequestResponse;
}

@route("/api/v1/event-types/{eventTypeId}/slots")
@tag("Slots")
interface Slots {
  @get list(
    @path eventTypeId: string,
    @doc("Booking window in days starting today; defaults to 14.")
    @query
    @minValue(1)
    @maxValue(14)
    days?: int32,
  ): Slot[] | BadRequestResponse | NotFoundResponse;
}

@route("/api/v1/bookings")
@tag("Bookings")
interface Bookings {
  @get list(): Booking[];
  @post create(@body request: CreateBookingRequest): CreatedBookingResponse | BadRequestResponse | NotFoundResponse | ConflictResponse;
}

@route("/api/v1/health")
@tag("System")
interface System {
  @get health(): { status: "ok" };
}

