import "@typespec/http";
import "@typespec/openapi3";

using TypeSpec.Http;

@service(#{ title: "Call Calendar API" })
@server("http://localhost:3000", "Local development")
namespace CallCalendar;

@format("date-time")
scalar UtcDateTime extends string;

model EventType {
  id: string;
  title: string;
  description: string;
  @minValue(30)
  durationMinutes: int32;
  createdAt: UtcDateTime;
}

model CreateEventTypeRequest {
  @minLength(2)
  title: string;
  @minLength(5)
  description: string;
  @minValue(30)
  @maxValue(120)
  durationMinutes: int32;
}

model Slot {
  startAt: UtcDateTime;
  endAt: UtcDateTime;
}

model Booking {
  id: string;
  eventTypeId: string;
  eventTitle: string;
  startAt: UtcDateTime;
  endAt: UtcDateTime;
  guestName: string;
  guestEmail: string;
  createdAt: UtcDateTime;
}

model CreateBookingRequest {
  eventTypeId: string;
  startAt: UtcDateTime;
  @minLength(2)
  guestName: string;
  @format("email")
  guestEmail: string;
}

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
  @get list(@path eventTypeId: string, @query days?: int32): Slot[] | NotFoundResponse;
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

