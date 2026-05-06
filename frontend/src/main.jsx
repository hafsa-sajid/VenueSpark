import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import AuthContext from './Context/AuthContext.jsx'
import UserContext from './Context/UserContext.jsx'
import ListingContext from './Context/ListingContext.jsx'
import BookingContext from './Context/BookingContext.jsx'
import { SocketContextProvider } from './Context/SocketContext.jsx'
import { ThemeProvider } from './Context/ThemeContext.jsx'

createRoot(document.getElementById('root')).render(
   <BrowserRouter>
   <ThemeProvider>
 <AuthContext>
  <ListingContext>
  <UserContext>
    <BookingContext>
      <SocketContextProvider>
        <App />
      </SocketContextProvider>
    </BookingContext> 
  </UserContext>
  </ListingContext>
   </AuthContext>
   </ThemeProvider>
   </BrowserRouter>
)
