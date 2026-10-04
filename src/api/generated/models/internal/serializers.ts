import type {
  ApiError,
  Booking,
  CreateBookingRequest,
  CreateEventTypeRequest,
  EventType,
  Slot,
} from "../models.js";

export function decodeBase64(value: string): Uint8Array | undefined {
  if(!value) {
    return value as any;
  }
  // Normalize Base64URL to Base64
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/')
    .padEnd(value.length + (4 - (value.length % 4)) % 4, '=');

  return new Uint8Array(Buffer.from(base64, 'base64'));
}export function encodeUint8Array(
  value: Uint8Array | undefined | null,
  encoding: BufferEncoding,
): string | undefined {
  if (!value) {
    return value as any;
  }
  return Buffer.from(value).toString(encoding);
}export function dateDeserializer(date?: string | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date);
}export function dateRfc7231Deserializer(date?: string | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date);
}export function dateRfc3339Serializer(date?: Date | null): string {
  if (!date) {
    return date as any
  }

  return date.toISOString();
}export function dateRfc7231Serializer(date?: Date | null): string {
  if (!date) {
    return date as any;
  }

  return date.toUTCString();
}export function dateUnixTimestampSerializer(date?: Date | null): number {
  if (!date) {
    return date as any;
  }

  return Math.floor(date.getTime() / 1000);
}export function dateUnixTimestampDeserializer(date?: number | null): Date {
  if (!date) {
    return date as any;
  }

  return new Date(date * 1000);
}export function createPayloadToTransport(payload: CreateBookingRequest) {
  return jsonCreateBookingRequestToTransportTransform(payload)!;
}export function createPayloadToTransport_2(payload: CreateEventTypeRequest) {
  return jsonCreateEventTypeRequestToTransportTransform(payload)!;
}export function jsonArrayEventTypeToTransportTransform(
  items_?: Array<EventType> | null,
): any {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonEventTypeToTransportTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonArrayEventTypeToApplicationTransform(
  items_?: any,
): Array<EventType> {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonEventTypeToApplicationTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonEventTypeToTransportTransform(
  input_?: EventType | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,title: input_.title,description: input_.description,durationMinutes: input_.durationMinutes,createdAt: input_.createdAt
  }!;
}export function jsonEventTypeToApplicationTransform(input_?: any): EventType {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,title: input_.title,description: input_.description,durationMinutes: input_.durationMinutes,createdAt: input_.createdAt
  }!;
}export function jsonCreateEventTypeRequestToTransportTransform(
  input_?: CreateEventTypeRequest | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    title: input_.title,description: input_.description,durationMinutes: input_.durationMinutes
  }!;
}export function jsonCreateEventTypeRequestToApplicationTransform(
  input_?: any,
): CreateEventTypeRequest {
  if(!input_) {
    return input_ as any;
  }
    return {
    title: input_.title,description: input_.description,durationMinutes: input_.durationMinutes
  }!;
}export function jsonApiErrorToTransportTransform(
  input_?: ApiError | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    code: input_.code,message: input_.message
  }!;
}export function jsonApiErrorToApplicationTransform(input_?: any): ApiError {
  if(!input_) {
    return input_ as any;
  }
    return {
    code: input_.code,message: input_.message
  }!;
}export function jsonArraySlotToTransportTransform(
  items_?: Array<Slot> | null,
): any {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonSlotToTransportTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonArraySlotToApplicationTransform(
  items_?: any,
): Array<Slot> {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonSlotToApplicationTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonSlotToTransportTransform(input_?: Slot | null): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    startAt: input_.startAt,endAt: input_.endAt
  }!;
}export function jsonSlotToApplicationTransform(input_?: any): Slot {
  if(!input_) {
    return input_ as any;
  }
    return {
    startAt: input_.startAt,endAt: input_.endAt
  }!;
}export function jsonArrayBookingToTransportTransform(
  items_?: Array<Booking> | null,
): any {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonBookingToTransportTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonArrayBookingToApplicationTransform(
  items_?: any,
): Array<Booking> {
  if(!items_) {
    return items_ as any;
  }
  const _transformedArray = [];

  for (const item of items_ ?? []) {
    const transformedItem = jsonBookingToApplicationTransform(item as any);
    _transformedArray.push(transformedItem);
  }

  return _transformedArray as any;
}export function jsonBookingToTransportTransform(input_?: Booking | null): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,eventTypeId: input_.eventTypeId,eventTitle: input_.eventTitle,startAt: input_.startAt,endAt: input_.endAt,guestName: input_.guestName,guestEmail: input_.guestEmail,createdAt: input_.createdAt
  }!;
}export function jsonBookingToApplicationTransform(input_?: any): Booking {
  if(!input_) {
    return input_ as any;
  }
    return {
    id: input_.id,eventTypeId: input_.eventTypeId,eventTitle: input_.eventTitle,startAt: input_.startAt,endAt: input_.endAt,guestName: input_.guestName,guestEmail: input_.guestEmail,createdAt: input_.createdAt
  }!;
}export function jsonCreateBookingRequestToTransportTransform(
  input_?: CreateBookingRequest | null,
): any {
  if(!input_) {
    return input_ as any;
  }
    return {
    eventTypeId: input_.eventTypeId,startAt: input_.startAt,guestName: input_.guestName,guestEmail: input_.guestEmail
  }!;
}export function jsonCreateBookingRequestToApplicationTransform(
  input_?: any,
): CreateBookingRequest {
  if(!input_) {
    return input_ as any;
  }
    return {
    eventTypeId: input_.eventTypeId,startAt: input_.startAt,guestName: input_.guestName,guestEmail: input_.guestEmail
  }!;
}
