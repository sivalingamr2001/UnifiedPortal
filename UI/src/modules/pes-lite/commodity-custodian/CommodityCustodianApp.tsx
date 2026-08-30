import { Loader } from "@/shared/components/Loader"
import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { Toaster } from "sonner"
import { CommodityProvider } from "./context/CommodityProvider"

const AppLayout = lazy(() =>
  import("./layout/AppLayout").then((m) => ({ default: m.AppLayout }))
)
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
)

export function CommodityCustodianApp() {
  return (
    <CommodityProvider>
      <Toaster position="top-right" richColors />
      <Suspense fallback={<Loader />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<DashboardPage />} />
          </Route>
        </Routes>
      </Suspense>
    </CommodityProvider>
  )
}

export default CommodityCustodianApp
