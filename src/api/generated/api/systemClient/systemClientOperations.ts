import { parse } from "uri-template";
import type { SystemClientContext } from "./systemClientContext.js";
import { createRestError } from "../../helpers/error.js";
import type { OperationOptions } from "../../helpers/interfaces.js";

export interface HealthOptions extends OperationOptions {}
export async function health(
  client: SystemClientContext,
  options?: HealthOptions,
): Promise<{
  status: "ok";
}> {
  const path = parse("/api/v1/health").expand({});
  const httpRequestOptions = {
    headers: {},
  };
  const response = await client.pathUnchecked(path).get(httpRequestOptions);


  if (typeof options?.operationOptions?.onResponse === "function") {
    options?.operationOptions?.onResponse(response);
  }
  if (+response.status === 200 && response.headers["content-type"]?.includes("application/json")) {
    return {
      status: response.body.status
    }!;
  }
  throw createRestError(response);
}
;
