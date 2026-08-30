import { AuthProvider } from "@/app/context/AuthContext"
import { ThemeProvider } from "@/app/context/ThemeContext"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "@/app/router/routes"
import { ConfirmProvider } from "@/shared/ConfirmDialog"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/unified-portal/">
        <ConfirmProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ConfirmProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
