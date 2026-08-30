const STORAGE_KEY = "janatics-token"

export const tokenStore = {
  get(): string | null {
    try {
      return localStorage.getItem(STORAGE_KEY)
    } catch {
      return null
    }
  },
  set(token: string): void {
    try {
      localStorage.setItem(STORAGE_KEY, token)
    } catch {
      // ignore storage errors in restricted environments
    }
  },
  clear(): void {
    try {
      localStorage.removeItem(STORAGE_KEY)
    } catch {
      // ignore storage errors in restricted environments
    }
  },
}
