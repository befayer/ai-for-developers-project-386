import { parse } from "uri-template";
import type { BookingsClientContext } from "./bookingsClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";
import {
  jsonApiErrorToApplicationTransform,
  jsonArrayBookingToApplicationTransform,
  jsonBookingToApplicationTransform,
  jsonCreateBookingRequestToTransportTransform,
} from "../../models/internal/serializers.js";
import type {
  ApiError,
  Booking,
  CreateBookingRequest,
} from "../../models/models.js";

export interface ListOptions extends OperationOptions {}
export async function list(
  client: BookingsClientContext,
  options?: ListOptions,
): Promise<Array<Booking>> {
  const path = parse("/api/v1/bookings").expand({});
  const httpRequestOptions = {
    headers: {},
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonArrayBookingToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface CreateOptions extends OperationOptions {}
export async function create(
  client: BookingsClientContext,
  request: CreateBookingRequest,
  options?: CreateOptions,
): Promise<Booking | ApiError> {
  const path = parse("/api/v1/bookings").expand({});
  const httpRequestOptions = {
    headers: {},body: jsonCreateBookingRequestToTransportTransform(request),
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 201 && response.headers["content-type"]?.includes("application/json")) {
    return jsonBookingToApplicationTransform(response.body)!;
  }
  if (+response.status === 400 && response.headers["content-type"]?.includes("application/json")) {
    return jsonApiErrorToApplicationTransform(response.body)!;
  }
  if (+response.status === 404 && response.headers["content-type"]?.includes("application/json")) {
    return jsonApiErrorToApplicationTransform(response.body)!;
  }
  if (+response.status === 409 && response.headers["content-type"]?.includes("application/json")) {
    return jsonApiErrorToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
