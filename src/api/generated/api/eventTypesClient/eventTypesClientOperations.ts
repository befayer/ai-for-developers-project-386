import { parse } from "uri-template";
import type { EventTypesClientContext } from "./eventTypesClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";
import {
  jsonApiErrorToApplicationTransform,
  jsonArrayEventTypeToApplicationTransform,
  jsonCreateEventTypeRequestToTransportTransform,
  jsonEventTypeToApplicationTransform,
} from "../../models/internal/serializers.js";
import type {
  ApiError,
  CreateEventTypeRequest,
  EventType,
} from "../../models/models.js";

export interface ListOptions extends OperationOptions {}
export async function list(
  client: EventTypesClientContext,
  options?: ListOptions,
): Promise<Array<EventType>> {
  const path = parse("/api/v1/event-types").expand({});
  const httpRequestOptions = {
    headers: {},
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonArrayEventTypeToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
export interface CreateOptions extends OperationOptions {}
export async function create(
  client: EventTypesClientContext,
  request: CreateEventTypeRequest,
  options?: CreateOptions,
): Promise<EventType | ApiError> {
  const path = parse("/api/v1/event-types").expand({});
  const httpRequestOptions = {
    headers: {},body: jsonCreateEventTypeRequestToTransportTransform(request),
  };
  const response = await client.pathUnchecked(path).post(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 201 && response.headers["content-type"]?.includes("application/json")) {
    return jsonEventTypeToApplicationTransform(response.body)!;
  }
  if (+response.status === 400 && response.headers["content-type"]?.includes("application/json")) {
    return jsonApiErrorToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
