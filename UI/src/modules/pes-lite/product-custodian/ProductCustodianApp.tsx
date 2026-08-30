import { lazy, Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { PesProvider } from "./context/PesProvider"
import { Loader } from "@/shared/components/Loader"
import { Toaster } from "sonner"

const AppLayout = lazy(() =>
  import("./layout/AppLayout").then((m) => ({ default: m.AppLayout }))
)
const DashboardPage = lazy(() =>
  import("./pages/DashboardPage").then((m) => ({ default: m.DashboardPage }))
)

export function ProductCustodianApp() {
  return (
    <>
      <PesProvider>
        <Toaster position="top-right" richColors />
        <Suspense fallback={<Loader />}>
          <Routes>
            <Route element={<AppLayout />}>
              <Route index element={<DashboardPage />} />
            </Route>
          </Routes>
        </Suspense>
      </PesProvider>
    </>
  )
}

export default ProductCustodianApp
