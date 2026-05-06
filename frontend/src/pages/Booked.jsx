import React, { useContext, useState } from 'react'
import { GiConfirmed } from "react-icons/gi";
import { FaStar, FaReceipt } from "react-icons/fa"; 
import { bookingDataContext } from '../Context/BookingContext';
import { Navigate, useNavigate } from 'react-router-dom';
import Star from '../Component/Star';
import { userDataContext } from '../Context/UserContext'; 
import { authDataContext } from '../Context/AuthContext';
import axios from 'axios';
import { listingDataContext } from '../Context/ListingContext';

function Booked() {
    let { bookingData } = useContext(bookingDataContext)
    let [star, setStar] = useState(null)
    const navigate = useNavigate();
    const { serverUrl } = useContext(authDataContext) 
    
    let { getCurrentUser } = useContext(userDataContext)
    let { getListing } = useContext(listingDataContext)

    if (!bookingData) return <Navigate to="/" />

    // Data extraction with fallbacks
    const userEmail = bookingData.user?.email || "N/A";
    const ownerEmail = bookingData.host?.email || bookingData.listing?.owner?.email || "N/A";

    const handleRating = async (listingId) => {
        const finalId = listingId?._id || listingId;
        if (!finalId || typeof finalId !== 'string') return;

        try {
            const token = localStorage.getItem('token');
            await axios.post(`${serverUrl}/api/listing/ratings/${finalId}`, {
                ratings: star
            }, {
                headers: { Authorization: `Bearer ${token}` },
                withCredentials: true 
            });
            await getListing();
            await getCurrentUser();
            navigate("/");
        } catch (error) {
            console.log("Rating error:", error.response?.data || error.message);
        }
    }

    return (
        <div className='w-full min-h-screen flex items-center justify-center bg-transparent p-4 lg:p-8'>
            <div className='flex flex-col lg:flex-row items-stretch justify-center gap-10 w-full max-w-[1200px]'>
                
                {/* --- LEFT CARD: BOOKING DETAILS --- */}
                <div className='flex-1 glass-card p-8 flex flex-col gap-6'>
                    <div className='flex flex-col items-center gap-4 text-center'>
                        <div className='w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(34,197,94,0.3)] border border-green-500/30'>
                            <GiConfirmed className='text-green-400 text-5xl animate-pulse' />
                        </div>
                        <h2 className='text-3xl font-bold text-slate-900 dark:text-white tracking-tight'>Booking Confirmed!</h2>
                        <p className='text-slate-600 dark:text-slate-300 font-medium'>Your stay at VenueSpark has been reserved.</p>
                    </div>

                    <div className='bg-white/5 p-6 rounded-xl border border-white/10 space-y-4 shadow-sm'>
                        <div className='flex justify-between items-center border-b border-white/10 pb-3 text-sm'>
                            <span className='text-slate-400 font-medium'>Booking Id:</span>
                            <span className='font-mono font-bold text-[#00B4D8] bg-[#00B4D8]/10 px-2 py-1 rounded'>{bookingData._id}</span>
                        </div>
                        <div className='flex justify-between items-center border-b border-white/10 pb-3 text-sm'>
                            <span className='text-slate-400 font-medium'>Transaction ID:</span>
                            <span className='font-semibold text-white'>{bookingData.transactionId || "N/A"}</span>
                        </div>
                        <div className='flex justify-between items-center border-b border-white/10 pb-3 text-sm'>
                            <span className='text-slate-400 font-medium'>Payment Mode:</span>
                            <span className='font-semibold text-white'>{bookingData.paymentMethod}</span>
                        </div>
                        <div className='flex justify-between items-center border-b border-white/10 pb-3 text-sm'>
                            <span className='text-slate-400 font-medium'>Your Email:</span>
                            <span className='font-semibold text-white'>{userEmail}</span>
                        </div>
                        <div className='flex justify-between items-center border-b border-white/10 pb-3 text-sm'>
                            <span className='text-slate-400 font-medium'>Owner Email:</span>
                            <span className='font-semibold text-white'>{ownerEmail}</span>
                        </div>
                        <div className='pt-3 flex justify-between items-center'>
                            <span className='text-xl font-bold text-white'>Total Paid:</span>
                            <span className='text-3xl font-black text-green-400'>Rs.{bookingData.price}</span>
                        </div>
                    </div>

                    <div className='flex gap-3'>
                        <button 
                            onClick={() => navigate('/receipt', { state: { booking: bookingData } })}
                            className='flex-1 py-4 bg-white/10 text-white border border-white/20 font-bold rounded-xl hover:bg-white/20 transition-all flex items-center justify-center gap-2 shadow-lg '
                        >
                            <FaReceipt /> View Receipt
                        </button>
                        <button 
                            onClick={() => navigate('/')}
                            className='flex-1 py-4 bg-[#8B5CF6] text-white border border-[#8B5CF6]/30 font-bold rounded-xl hover:opacity-90 transition-all shadow-lg '
                        >
                            Back to Home
                        </button>
                    </div>
                </div>

                {/* --- RIGHT CARD: RATING --- */}
                <div className='flex-1 glass-card p-8 flex flex-col gap-6'>
                    <div className='flex flex-col items-center gap-4 text-center'>
                        <div className='w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center shadow-[0_0_15px_rgba(234,179,8,0.3)] border border-yellow-500/30'>
                            <FaStar className='text-yellow-500 text-5xl animate-pulse' />
                        </div>
                        <h2 className='text-2xl font-bold text-slate-900 dark:text-white tracking-tight'>Rate Your Experience</h2>
                        <p className='text-slate-600 dark:text-slate-300 font-medium'>Tell us what you loved about your experience!</p>
                    </div>

                    <div className='flex-1 flex flex-col items-center justify-center bg-white/5 rounded-xl border border-white/10 p-8 shadow-sm'>
                        <span className='text-sm font-black text-[#00B4D8] uppercase tracking-wider mb-4'>Select Rating</span>
                        <div className='scale-110 transform'>
                            <Star onRate={(val) => setStar(val)} />
                        </div>
                        {star && <p className='mt-4 text-white font-bold'>You selected {star} Stars</p>}
                    </div>

                    <button 
                        className='w-full py-4 bg-[#8B5CF6] text-white font-bold rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg ' 
                        onClick={() => handleRating(bookingData.listing)}
                        disabled={!star}
                    >
                        Submit Feedback
                    </button>
                </div>
            </div>
        </div>
    )
}

export default Booked;