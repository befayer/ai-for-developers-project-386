import { parse } from "uri-template";
import type { SlotsClientContext } from "./slotsClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";
import {
  jsonApiErrorToApplicationTransform,
  jsonArraySlotToApplicationTransform,
} from "../../models/internal/serializers.js";
import type { ApiError, Slot } from "../../models/models.js";

export interface ListOptions extends OperationOptions {
  days?: number
}
export async function list(
  client: SlotsClientContext,
  eventTypeId: string,
  options?: ListOptions,
): Promise<Array<Slot> | ApiError> {
  const path = parse("/api/v1/event-types/{eventTypeId}/slots{?days}").expand({
    eventTypeId: eventTypeId,
    ...(options?.days && {days: options.days})
  });
  const httpRequestOptions = {
    headers: {},
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return jsonArraySlotToApplicationTransform(response.body)!;
  }
  if (+response.status === 404 && response.headers["content-type"]?.includes("application/json")) {
    return jsonApiErrorToApplicationTransform(response.body)!;
  }
  throw createRestError(response);
}
;
