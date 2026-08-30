export type QueryExecutionRequest = {
  QueryNumber: number
  InputParameters?: Record<string, unknown>
}

export type QueryExecutionResponse = {
  QueryNumber: number
  Description?: string | null
  Data?: unknown[]
  data?: unknown[]
}
