interface ApiResponse<T> {
  success: boolean
  data: T
  error: string | null
  timestamp: string
}

// In-memory cache for GET requests to prevent duplicate in-flight calls
var pendingMap = new Map<string, Promise<any>>()

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error("TIMEOUT")), ms))
  ])
}

function dedupKey(url: string, options?: RequestInit): string {
  if (options?.method && options.method !== "GET") return ""
  return "GET:" + url
}

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  var dk = dedupKey(url, options)
  if (dk && pendingMap.has(dk)) return pendingMap.get(dk)!

  var isMutate = options?.method && ["POST","PATCH","PUT","DELETE"].includes(options.method as string)
  var maxRetries = isMutate ? 0 : 1
  var lastErr: any

  for (var attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      var controller = new AbortController()
      var timeoutId = setTimeout(() => controller.abort(), 10000)
      var mergedOpts: RequestInit = { ...options, signal: controller.signal }

      var res = await withTimeout(fetch(url, mergedOpts), 10000)
      clearTimeout(timeoutId)

      if (!res.ok) throw new Error(res.status === 429 ? "RATE_LIMITED" : "HTTP " + res.status)
      var json: any = await res.json()
      if (json.success === false) throw new Error(json.error || "API Error")

      var result = (json.data !== undefined) ? json.data : json

      if (dk) pendingMap.set(dk, Promise.resolve(result))
      return result
    } catch(e: any) {
      lastErr = e
      if (attempt < maxRetries && e.message === "RATE_LIMITED") await new Promise(r => setTimeout(r, 1000))
      else if (attempt < maxRetries) await new Promise(r => setTimeout(r, 500))
    }
  }

  if (dk) pendingMap.delete(dk)
  throw new Error(lastErr?.message || "Request failed")
}

// Periodic cleanup to prevent memory leak
if (typeof window !== "undefined") {
  setInterval(function() {
    if (pendingMap.size > 100) pendingMap.clear()
  }, 60000)
}

export var api = {
  get: <T>(path: string, options?: RequestInit) => request<T>("/api" + path, options),
  post: <T>(path: string, body?: any, options?: RequestInit) => request<T>("/api" + path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
    ...options,
  }),
}
