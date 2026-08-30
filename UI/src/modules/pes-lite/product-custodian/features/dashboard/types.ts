export interface Item {
  code: string
  description: string
  type: "AMS1" | "AMS2"
  cap: number
  soQty: number
  binQty: number | null
  aboveCap: number
  currMonth: number | null
  nextMonth: number | null
  pending: number
  trend: [number, number, number]
  trendLabel: string
  trendDir: "up" | "down" | "flat"
  constrained: boolean
}

export type FilterType = "ALL" | "AMS1" | "AMS2"
export type FilterConstraint = "ALL" | "CONSTRAINT" | "UNCONSTRAINT"
