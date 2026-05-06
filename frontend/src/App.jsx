import React, { useContext, useEffect } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Home from './pages/Home'
import Login from './pages/Login'
import SignUp from './pages/SignUp'
import VerifyOTP from './pages/VerifyOTP'
import ForgotPassword from './pages/ForgotPassword'
import VerifyResetOTP from './pages/VerifyResetOTP'
import ResetPassword from './pages/ResetPassword'
import ListingPage1 from './pages/ListingPage1'
import ListingPage2 from './pages/ListingPage2'
import ListingPage3 from './pages/ListingPage3'
import MyListing from './pages/MyListing'
import ViewCard from './pages/ViewCard'
import MyBooking from './pages/MyBooking'
import Booked from './pages/Booked'
import Checkout from './pages/Checkout'
import Receipt from './pages/Receipt' 
import AdminDashboard from './pages/AdminDashboard'
import MyComplaints from './pages/MyComplaints'
import AboutUs from './pages/AboutUs'
import { userDataContext } from './Context/UserContext'
import { SocketContext } from './Context/SocketContext'
import { Toaster, toast } from 'react-hot-toast'

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';

// Aapki Publishable Key
const stripePromise = loadStripe('pk_test_51TBV24EwWiGRcf4n22EpSzyiBeAzG4bDgxRSnr11kqVTBhAzSngVldfftQ1Makf3Y4XsctI0sHY1igVnTFv1PjDV00xSz57Qwh');

const App = () => {
  const { userData } = useContext(userDataContext)
  const { socket } = useContext(SocketContext)

  useEffect(() => {
    if (socket) {
      socket.on("newNotification", (notification) => {
        toast.success(notification.message, {
          icon: '🔔',
          style: {
            borderRadius: '10px',
            background: '#8B5CF6',
            color: '#fff',
          },
        });
      });
      return () => socket.off("newNotification");
    }
  }, [socket]);

  return (
    <>
      <Toaster 
        position="top-right" 
        reverseOrder={false}
      />
      
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/signup' element={<SignUp />} />
        
        {/* NEW AUTHENTICATION ROUTES */}
        <Route path='/verify-otp' element={<VerifyOTP />} />
        <Route path='/forgot-password' element={<ForgotPassword />} />
        <Route path='/verify-reset-otp' element={<VerifyResetOTP />} />
        <Route path='/reset-password' element={<ResetPassword />} />

        <Route path='/listingpage1' element={userData != null ? <ListingPage1 /> : <Navigate to="/login" />} />
        <Route path='/listingpage2' element={userData != null ? <ListingPage2 /> : <Navigate to="/login" />} />
        <Route path='/listingpage3' element={userData != null ? <ListingPage3 /> : <Navigate to="/login" />} />
        <Route path='/mylisting' element={userData != null ? <MyListing /> : <Navigate to="/login" />} />
        <Route path='/viewcard' element={userData != null ? <ViewCard /> : <Navigate to="/login" />} />
        <Route path='/mybooking' element={userData != null ? <MyBooking /> : <Navigate to="/login" />} />
        <Route path='/booked' element={userData != null ? <Booked /> : <Navigate to="/login" />} />
        
        {/* Checkout ko Elements se wrap kiya gaya hai */}
        <Route path='/checkout' element={
          userData != null ? (
            <Elements stripe={stripePromise}>
              <Checkout />
            </Elements>
          ) : <Navigate to="/login" />
        } />
        
        <Route path='/receipt' element={userData != null ? <Receipt /> : <Navigate to="/login" />} />
        <Route path='/admin/dashboard' element={userData != null ? <AdminDashboard /> : <Navigate to="/login" />} />
        <Route path='/my-complaints' element={userData != null ? <MyComplaints /> : <Navigate to="/login" />} />
        <Route path='/about-us' element={<AboutUs />} />
      </Routes>
    </>
  )
}

export default App