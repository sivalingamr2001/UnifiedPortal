import { AuthProvider } from "@/app/context/AuthContext"
import { ThemeProvider } from "@/app/context/ThemeContext"
import { BrowserRouter } from "react-router-dom"
import { AppRoutes } from "@/app/router/routes"

function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename="/unified-portal/">
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App
