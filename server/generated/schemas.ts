// Generated from docs/openapi/openapi.yaml by `npm run api:generate`. Do not edit manually.

export const schemas = {
  "ApiError": {
    "type": "object",
    "required": [
      "code",
      "message"
    ],
    "properties": {
      "code": {
        "type": "string",
        "enum": [
          "VALIDATION_ERROR",
          "NOT_FOUND",
          "SLOT_CONFLICT"
        ]
      },
      "message": {
        "type": "string"
      }
    },
    "description": "Every 4xx response uses this shape.\nVALIDATION_ERROR covers schema violations and malformed requests (invalid JSON, unsupported content type)."
  },
  "Booking": {
    "type": "object",
    "required": [
      "id",
      "eventTypeId",
      "eventTitle",
      "startAt",
      "endAt",
      "guestName",
      "guestEmail",
      "createdAt"
    ],
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "eventTypeId": {
        "type": "string",
        "format": "uuid"
      },
      "eventTitle": {
        "type": "string"
      },
      "startAt": {
        "type": "string",
        "format": "date-time"
      },
      "endAt": {
        "type": "string",
        "format": "date-time"
      },
      "guestName": {
        "type": "string"
      },
      "guestEmail": {
        "type": "string"
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "CreateBookingRequest": {
    "type": "object",
    "required": [
      "eventTypeId",
      "startAt",
      "guestName",
      "guestEmail"
    ],
    "properties": {
      "eventTypeId": {
        "type": "string",
        "format": "uuid"
      },
      "startAt": {
        "allOf": [
          {
            "type": "string",
            "format": "date-time"
          }
        ],
        "description": "Must equal the startAt of a slot returned by the slots endpoint; otherwise 409 SLOT_CONFLICT."
      },
      "guestName": {
        "type": "string",
        "minLength": 2,
        "maxLength": 80
      },
      "guestEmail": {
        "type": "string",
        "maxLength": 160,
        "format": "email"
      }
    },
    "description": "String fields are trimmed; length limits apply to the trimmed value."
  },
  "CreateEventTypeRequest": {
    "type": "object",
    "required": [
      "title",
      "description",
      "durationMinutes"
    ],
    "properties": {
      "title": {
        "type": "string",
        "minLength": 2,
        "maxLength": 80
      },
      "description": {
        "type": "string",
        "minLength": 5,
        "maxLength": 500
      },
      "durationMinutes": {
        "type": "number",
        "enum": [
          30,
          60,
          90,
          120
        ],
        "description": "Meeting length in minutes: 30–120, a multiple of 30."
      }
    },
    "description": "String fields are trimmed; length limits apply to the trimmed value."
  },
  "DurationMinutes": {
    "type": "number",
    "enum": [
      30,
      60,
      90,
      120
    ],
    "description": "Meeting length in minutes: 30–120, a multiple of 30."
  },
  "EventType": {
    "type": "object",
    "required": [
      "id",
      "title",
      "description",
      "durationMinutes",
      "createdAt"
    ],
    "properties": {
      "id": {
        "type": "string",
        "format": "uuid"
      },
      "title": {
        "type": "string"
      },
      "description": {
        "type": "string"
      },
      "durationMinutes": {
        "type": "number",
        "enum": [
          30,
          60,
          90,
          120
        ],
        "description": "Meeting length in minutes: 30–120, a multiple of 30."
      },
      "createdAt": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "Slot": {
    "type": "object",
    "required": [
      "startAt",
      "endAt"
    ],
    "properties": {
      "startAt": {
        "type": "string",
        "format": "date-time"
      },
      "endAt": {
        "type": "string",
        "format": "date-time"
      }
    }
  },
  "UtcDateTime": {
    "type": "string",
    "format": "date-time"
  },
  "Uuid": {
    "type": "string",
    "format": "uuid"
  }
} as const

export const requestSchemas = {
  "Bookings_list": {
    "method": "GET",
    "path": "/api/v1/bookings"
  },
  "Bookings_create": {
    "method": "POST",
    "path": "/api/v1/bookings",
    "body": {
      "type": "object",
      "required": [
        "eventTypeId",
        "startAt",
        "guestName",
        "guestEmail"
      ],
      "properties": {
        "eventTypeId": {
          "type": "string",
          "format": "uuid"
        },
        "startAt": {
          "allOf": [
            {
              "type": "string",
              "format": "date-time"
            }
          ],
          "description": "Must equal the startAt of a slot returned by the slots endpoint; otherwise 409 SLOT_CONFLICT."
        },
        "guestName": {
          "type": "string",
          "minLength": 2,
          "maxLength": 80
        },
        "guestEmail": {
          "type": "string",
          "maxLength": 160,
          "format": "email"
        }
      },
      "description": "String fields are trimmed; length limits apply to the trimmed value."
    }
  },
  "EventTypes_list": {
    "method": "GET",
    "path": "/api/v1/event-types"
  },
  "EventTypes_create": {
    "method": "POST",
    "path": "/api/v1/event-types",
    "body": {
      "type": "object",
      "required": [
        "title",
        "description",
        "durationMinutes"
      ],
      "properties": {
        "title": {
          "type": "string",
          "minLength": 2,
          "maxLength": 80
        },
        "description": {
          "type": "string",
          "minLength": 5,
          "maxLength": 500
        },
        "durationMinutes": {
          "type": "number",
          "enum": [
            30,
            60,
            90,
            120
          ],
          "description": "Meeting length in minutes: 30–120, a multiple of 30."
        }
      },
      "description": "String fields are trimmed; length limits apply to the trimmed value."
    }
  },
  "Slots_list": {
    "method": "GET",
    "path": "/api/v1/event-types/{eventTypeId}/slots",
    "params": {
      "type": "object",
      "required": [
        "eventTypeId"
      ],
      "properties": {
        "eventTypeId": {
          "type": "string"
        }
      }
    },
    "querystring": {
      "type": "object",
      "required": [],
      "properties": {
        "days": {
          "type": "integer",
          "format": "int32",
          "minimum": 1,
          "maximum": 14
        }
      }
    }
  },
  "System_health": {
    "method": "GET",
    "path": "/api/v1/health"
  }
} as const
