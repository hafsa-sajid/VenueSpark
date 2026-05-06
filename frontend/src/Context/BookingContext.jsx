import axios from 'axios'
import React, { createContext, useContext, useState } from 'react'
import { authDataContext } from './AuthContext'
import { userDataContext } from './UserContext'
import { listingDataContext } from './ListingContext'

export const bookingDataContext = createContext()

function BookingContext({ children }) {
  let [checkIn, setCheckIn] = useState("")
  let [checkOut, setCheckOut] = useState("")
  let [total, setTotal] = useState(0)
  let [night, setNight] = useState(0)

  let { serverUrl } = useContext(authDataContext)
  let { userData, getCurrentUser } = useContext(userDataContext)
  let { getListing } = useContext(listingDataContext)

  let [bookingData, setBookingData] = useState(null) 
  let [booking, setbooking] = useState(false)

  const resetBookingState = () => {
    setCheckIn("");
    setCheckOut("");
    setTotal(0);
    setNight(0);
  };

  const token = localStorage.getItem('token');

  // FIX: handleBooking mein paymentMethod aur transactionId add kar di hain
  // Updated to support FormData for payment proof upload
  const handleBooking = async (listingId, totalPrice, userId, paymentMethod, transactionId = "", paymentProofFile = null) => {
    setbooking(true)
    try {
      let formData = new FormData();
      formData.append("totalRent", totalPrice);
      formData.append("userId", userId);
      formData.append("checkIn", checkIn);
      formData.append("checkOut", checkOut);
      formData.append("paymentMethod", paymentMethod);
      formData.append("transactionId", transactionId);
      
      if (paymentProofFile) {
        formData.append("paymentProof", paymentProofFile);
      }

      const res = await axios.post(`${serverUrl}/api/booking/create/${listingId}`, formData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data) {
        setBookingData(res.data);
      }

      if (getListing) {
        await getListing();
      }

      setbooking(false)
      return res.data;
    } catch (error) {
      console.error("Context Booking Error:", error.response?.data || error.message);
      setbooking(false)
      throw error;
    }
  }

  const cancelBooking = async (id) => {
    try {
      const res = await axios.delete(`${serverUrl}/api/booking/cancel/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (getListing) await getListing();
      if (getCurrentUser) await getCurrentUser();
      return res.data;
    } catch (error) {
      console.error("Cancel Booking Error:", error.response?.data || error.message);
    }
  };

  let value = {
    checkIn, setCheckIn,
    checkOut, setCheckOut,
    total, setTotal,
    night, setNight,
    bookingData, setBookingData,
    handleBooking, cancelBooking,
    resetBookingState,
    booking, setbooking,
  }

  return (
    <bookingDataContext.Provider value={value}>
      {children}
    </bookingDataContext.Provider>
  )
}

export default BookingContext