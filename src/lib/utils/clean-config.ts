export type JsonValue = string | number | boolean | null | JsonObject | JsonValue[] | undefined
type JsonObject = { [key: string]: JsonValue }

function cleanValue(value: JsonValue): JsonValue {
  if (value == null) return undefined;
  if (Array.isArray(value)) {
    return value.map(cleanValue).filter(v => v != null);
  }
  if (typeof value === 'object') {
    return cleanConfig(value as JsonObject);
  }
  return value;
}

export function cleanConfig(config: JsonObject | undefined): JsonObject {
  if (!config) return {};

  return Object.fromEntries(
    Object.entries(config)
      .filter(([, v]) => v != null)
      .map(([k, v]) => [k, cleanValue(v)])
  );
}


// example
/*
Full Payload: {
  "name": "test23.reverse.com",
  "type": "reverse_proxy",
  "reverseProxyConfig": {
    "handler": "reverse_proxy",
    "load_balancing": {
      "retries": 4,
      "selection_policy": {
        "policy": "round_robin"
      },
      "try_duration": 2
    },
    "upstreams": [
      {
        "dial": "127.0.0.1:3000",
        "max_requests": 2
      }
    ],
    "headers": {
      "request": {
        "add": [
          {
            "header": "123",
            "values": [
              "12"
            ]
          }
        ],
        "set": [],
        "delete": [],
        "replace": []
      }
    }
  }
}
*/