import { tokenStore } from "@/shared/lib/tokenStore"

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

export class ApiError extends Error {
  status: number

  constructor(message: string, status: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const REQUEST_TIMEOUT_MS = 20_000

let onUnauthorized: (() => void) | null = null
export function setUnauthorizedHandler(handler: () => void): void {
  onUnauthorized = handler
}

async function request<TResponse>(
  path: string,
  options: RequestInit = {}
): Promise<TResponse> {
  const token = tokenStore.get()
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS)

  let response: Response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      signal: controller.signal,
      credentials: "omit",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
      },
    })
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      throw new ApiError("The request timed out. Please try again.", 0)
    }
    throw new ApiError("Could not reach the server. Check your connection.", 0)
  } finally {
    clearTimeout(timeoutId)
  }

  if (response.status === 401) {
    tokenStore.clear()
    onUnauthorized?.()
    throw new ApiError("Your session has ended. Please sign in again.", 401)
  }

  if (!response.ok) {
    let message = `Request failed (${response.status})`
    try {
      const body = await response.json()
      if (typeof body?.message === "string") message = body.message
    } catch {
      // no JSON body
    }
    throw new ApiError(message, response.status)
  }

  if (response.status === 204) {
    return undefined as TResponse
  }

  return (await response.json()) as TResponse
}

function toUpperSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, "$1_$2")
    .toUpperCase();
}

function mapKeysToUpperSnakeCase(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== "object") return obj;
  if (Array.isArray(obj)) return obj.map(mapKeysToUpperSnakeCase);

  const result: Record<string, any> = {};
  for (const key of Object.keys(obj)) {
    result[toUpperSnakeCase(key)] = obj[key];
  }
  return result;
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, { method: "GET" }),
  post: <T>(path: string, body?: any) => {
    let payload = body;
    if (path === "/transaction/execute" && body) {
      payload = { ...body };
      if (body.mainProps) {
        payload.mainProps = mapKeysToUpperSnakeCase(body.mainProps);
      }
      if (body.childProps && Array.isArray(body.childProps)) {
        payload.childProps = body.childProps.map(mapKeysToUpperSnakeCase);
      }
    }
    return request<T>(path, {
      method: "POST",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },
  put: <T>(path: string, body?: any) => {
    let payload = body;
    if (path === "/transaction/execute" && body) {
      payload = { ...body };
      if (body.mainProps) {
        payload.mainProps = mapKeysToUpperSnakeCase(body.mainProps);
      }
      if (body.childProps && Array.isArray(body.childProps)) {
        payload.childProps = body.childProps.map(mapKeysToUpperSnakeCase);
      }
    }
    return request<T>(path, {
      method: "PUT",
      body: payload ? JSON.stringify(payload) : undefined,
    });
  },
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
}
