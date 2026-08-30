import { useState } from "react"

export function useLoader(initialState = false) {
  const [loading, setLoading] = useState(initialState)

  const withLoader = async <T>(promise: Promise<T> | (() => Promise<T>)): Promise<T> => {
    setLoading(true)
    try {
      if (typeof promise === "function") {
        return await promise()
      }
      return await promise
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    setLoading,
    withLoader,
  }
}
