import {
  type BookingsClientContext,
  type BookingsClientOptions,
  createBookingsClientContext,
} from "./api/bookingsClient/bookingsClientContext.js";
import {
  create as create_2,
  type CreateOptions as CreateOptions_2,
  list as list_3,
  type ListOptions as ListOptions_3,
} from "./api/bookingsClient/bookingsClientOperations.js";
import {
  type CallCalendarClientContext,
  type CallCalendarClientOptions,
  createCallCalendarClientContext,
} from "./api/callCalendarClientContext.js";
import {
  createEventTypesClientContext,
  type EventTypesClientContext,
  type EventTypesClientOptions,
} from "./api/eventTypesClient/eventTypesClientContext.js";
import {
  create,
  type CreateOptions,
  list,
  type ListOptions,
} from "./api/eventTypesClient/eventTypesClientOperations.js";
import {
  createSlotsClientContext,
  type SlotsClientContext,
  type SlotsClientOptions,
} from "./api/slotsClient/slotsClientContext.js";
import {
  list as list_2,
  type ListOptions as ListOptions_2,
} from "./api/slotsClient/slotsClientOperations.js";
import {
  createSystemClientContext,
  type SystemClientContext,
  type SystemClientOptions,
} from "./api/systemClient/systemClientContext.js";
import {
  health,
  type HealthOptions,
} from "./api/systemClient/systemClientOperations.js";
import type {
  CreateBookingRequest,
  CreateEventTypeRequest,
} from "./models/models.js";

export class CallCalendarClient {
  #context: CallCalendarClientContext
  eventTypesClient: EventTypesClient;
  slotsClient: SlotsClient;
  bookingsClient: BookingsClient;
  systemClient: SystemClient
  constructor(options?: CallCalendarClientOptions) {
    this.#context = createCallCalendarClientContext(options);
    this.eventTypesClient = new EventTypesClient(options);;this
      .slotsClient = new SlotsClient(options);;this
      .bookingsClient = new BookingsClient(options);;this
      .systemClient = new SystemClient(options);
  }
}
export class SystemClient {
  #context: SystemClientContext
  constructor(options?: SystemClientOptions) {
    this.#context = createSystemClientContext(options);

  }
  async health(options?: HealthOptions) {
    return health(this.#context, options);
  }
}
export class BookingsClient {
  #context: BookingsClientContext
  constructor(options?: BookingsClientOptions) {
    this.#context = createBookingsClientContext(options);

  }
  async list(options?: ListOptions_3) {
    return list_3(this.#context, options);
  };
  async create(request: CreateBookingRequest, options?: CreateOptions_2) {
    return create_2(this.#context, request, options);
  }
}
export class SlotsClient {
  #context: SlotsClientContext
  constructor(options?: SlotsClientOptions) {
    this.#context = createSlotsClientContext(options);

  }
  async list(eventTypeId: string, options?: ListOptions_2) {
    return list_2(this.#context, eventTypeId, options);
  }
}
export class EventTypesClient {
  #context: EventTypesClientContext
  constructor(options?: EventTypesClientOptions) {
    this.#context = createEventTypesClientContext(options);

  }
  async list(options?: ListOptions) {
    return list(this.#context, options);
  };
  async create(request: CreateEventTypeRequest, options?: CreateOptions) {
    return create(this.#context, request, options);
  }
}
