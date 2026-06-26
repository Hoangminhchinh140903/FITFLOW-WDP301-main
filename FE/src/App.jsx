import { useLocation } from 'react-router-dom'
import AppRoutes from './routes'
import { BuyCartProvider } from './contexts/BuyCartContext'
import { FavoritesProvider } from './contexts/FavoritesContext'
import { RentalCartProvider } from './contexts/RentalCartContext'
import { useAuth } from './contexts/AuthContext'
import { normalizeRole } from './utils/auth'

function App() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const role = normalizeRole(user?.role)
  const isManagementPath = pathname.startsWith('/owner') || pathname.startsWith('/staff')

  return (
    <>
      <RentalCartProvider>
        <BuyCartProvider>
          <FavoritesProvider>
            <AppRoutes />
          </FavoritesProvider>
        </BuyCartProvider>
      </RentalCartProvider>
    </>
  )
}

export default App
