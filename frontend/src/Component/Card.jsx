import React, { useContext, useEffect, useState } from 'react'
import { userDataContext } from '../Context/UserContext'
import { listingDataContext } from '../Context/ListingContext'
import { authDataContext } from '../Context/AuthContext'
import { useNavigate } from 'react-router-dom'
import { bookingDataContext } from '../Context/BookingContext'
import { FaStar, FaMapMarkerAlt, FaClock } from "react-icons/fa"; 
import { GiConfirmed } from "react-icons/gi";
import { RxCross1 } from "react-icons/rx";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { MdLogout } from 'react-icons/md';

function Card({ title, landMark, image1, rent, city, id, ratings, isBooked, bookingId, bookingCreatedAt, fullBooking }) {
  let navigate = useNavigate()
  let { userData, getCurrentUser } = useContext(userDataContext)
  let { handleViewCard, getListing } = useContext(listingDataContext)
  let { serverUrl } = useContext(authDataContext)
  let { resetBookingState } = useContext(bookingDataContext)

  const isCurrentlyBooked = isBooked === true;
  const [timeLeft, setTimeLeft] = useState(null);
  const [canCancel, setCanCancel] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  
  // Refund PopUp states
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundMethod, setRefundMethod] = useState("Easypaisa");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState("");

  useEffect(() => {
    if (bookingCreatedAt) {
        const calculateTimeLeft = () => {
            let bookingTime = new Date(bookingCreatedAt).getTime();
            let sixHoursLater = bookingTime + (6 * 60 * 60 * 1000);
            let now = new Date().getTime();
            let difference = sixHoursLater - now;

            if (difference > 0) {
                let h = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let m = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
                let s = Math.floor((difference % (1000 * 60)) / 1000);
                setTimeLeft(`${h}h ${m}m ${s}s`);
                setCanCancel(true);
            } else {
                setTimeLeft(null);
                setCanCancel(false);
            }
        };

        calculateTimeLeft();
        const interval = setInterval(calculateTimeLeft, 1000);
        return () => clearInterval(interval);
    }
  }, [bookingCreatedAt]);

  const handleClick = (e) => {
    // Prevent triggering card click if clicking a button
    if (e.target.closest('button')) return;
    if (isCurrentlyBooked) return;
    if (userData) {
      handleViewCard(id)
    } else {
      navigate("/login")
    }
  }

  const handleCancelBooking = async (e) => {
      e.preventDefault();
      
      if (!accountNo || !accountName) {
          toast.error("Please fill all refund details.");
          return;
      }

      setIsCancelling(true);
      try {
          const token = localStorage.getItem("token");
          await axios.put(`${serverUrl}/api/booking/cancel/${bookingId}`, {
              refundDetails: {
                  method: refundMethod,
                  accountNo: accountNo,
                  accountName: accountName
              }
          }, {
              headers: { Authorization: `Bearer ${token}` }
          });
          toast.success("Cancellation Approved! Refund Requested.");
          setShowRefundForm(false);
          // Run background refreshes without awaiting to keep UI fast
          if (getCurrentUser) getCurrentUser(); 
          if (getListing) getListing(); 
          
          // Clear states after successful cancellation
          setAccountNo("");
          setAccountName("");
          if (resetBookingState) resetBookingState();
      } catch (err) {
          const errMsg = err.response?.data?.message || "Error cancelling booking";
          toast.error(errMsg);
      } finally {
          setIsCancelling(false);
      }
  };

  const fallbackImage = "https://placehold.jp/24/8b5cf6/ffffff/400x300.png?text=VenuSpark";
  const isMyBooking = bookingCreatedAt != null;

  return (
    <>
    <div className="glass-card-container w-[330px] mx-auto group">
      {/* Pink glow behind some cards for variety based on id string length or just statically */}
      {id && id.length % 2 === 0 && <div className="glass-card-glow-pink"></div>}
      
      <div 
        className={`glass-card flex flex-col h-full
        ${!isCurrentlyBooked ? 'hover:-translate-y-2 cursor-pointer' : ''}`} 
        onClick={handleClick}
      >
      {/* Image Area */}
      <div className='relative w-full h-[190px] bg-transparent p-[10px]'>
        <div className='w-full h-full rounded-[16px] overflow-hidden relative'>
            <img 
            src={image1 || fallbackImage} 
            className='w-full h-full object-cover'
            alt={title}
            />
            {isCurrentlyBooked && !isMyBooking && (
            <div className='absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-[2px]'>
                <div className='bg-red-500/90 text-white px-4 py-[6px] rounded-full flex items-center gap-2 shadow-lg border border-red-400'>
                <GiConfirmed />
                <span className='font-bold text-[11px] uppercase tracking-wide'>Already Booked</span>
                </div>
            </div>
            )}
        </div>

        <div className='absolute top-4 right-4 bg-slate-900/80 backdrop-blur-md px-[10px] py-[6px] rounded-xl shadow-lg border border-white/10 flex items-center gap-[6px]'>
          <FaStar className='text-[#FFB800] text-[12px]' />
          <span className='font-bold text-[12px] text-white'>{ratings || "0.0"}</span>
        </div>
      </div>

      {/* Details Area */}
      <div className='px-6 py-5 flex flex-col gap-2 relative bg-transparent'>
        <div>
          <div className='flex items-center justify-between mb-[6px]'>
             <div className='flex items-center gap-[6px] text-[#00B4D8]'>
                <FaMapMarkerAlt size={12} />
                <span className='text-[11px] font-extrabold uppercase tracking-widest text-[#00B4D8]/80'>{city}</span>
             </div>
             
             {canCancel && isMyBooking && (
                 <div className='flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-500/30 backdrop-blur-sm'>
                    <FaClock className='text-amber-400 text-[10px]' /> 
                    <span className='text-amber-400 font-bold text-[10px] tracking-wider'>{timeLeft}</span>
                 </div>
             )}
          </div>
          
          <h3 className='font-bold text-[19px] text-white leading-tight truncate drop-shadow-sm'>{landMark}</h3>
          <p className='text-[14px] text-slate-300 truncate mt-[4px]'>{title}</p>
        </div>
        
        <div className='mt-[8px] pt-4 border-t border-white/10 flex items-center justify-between'>
          <div className='flex flex-col'>
            <span className='text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-[2px]'>Price Per Day</span>
            <span className='font-black text-[22px] text-white drop-shadow-md'>Rs. {rent}</span>
          </div>

          {!isCurrentlyBooked && (
            <div className='bg-white/10 text-white border border-white/20 px-5 py-2.5 rounded-xl text-[12px] font-bold tracking-wide shadow-lg backdrop-blur-md hover:bg-white/20 transition-all'>
              Details
            </div>
          )}
          
          {isMyBooking && (
             <div className='flex items-center gap-2'>
                {canCancel && fullBooking?.status !== 'Cancel_Requested' && (
                   <button 
                      className='px-3 py-1.5 bg-red-500/20 text-red-400 hover:bg-red-500 hover:text-white transition-all text-[11px] font-black uppercase rounded-lg border border-red-500/30'
                      onClick={(e) => { e.stopPropagation(); setShowRefundForm(true); }}
                   >
                      Cancel
                   </button>
                )}
                {fullBooking?.status === 'Cancel_Requested' && (
                   <button 
                      className='px-3 py-1.5 bg-amber-500/20 text-amber-400 text-[11px] font-black uppercase rounded-lg border border-amber-500/30 cursor-not-allowed'
                      disabled
                   >
                      Pending
                   </button>
                )}
                <button 
                   className='px-3 py-1.5 bg-purple-500/20 text-purple-300 hover:bg-purple-500 hover:text-white transition-all text-[11px] font-black uppercase rounded-lg border border-purple-500/30'
                   onClick={(e) => { 
                      e.stopPropagation(); 
                      if (fullBooking) {
                         navigate('/receipt', { state: { booking: fullBooking } });
                      } else {
                         toast.error("Receipt data not found");
                      }
                   }}
                >
                   Receipt
                </button>
             </div>
          )}
        </div>
      </div>
      </div>
    </div>

    {/* REFUND MODAL */}
    {showRefundForm && (
        <div className='fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/70 backdrop-blur-md p-4'>
            <div className='bg-white dark:bg-[#0F172A] w-full max-w-[450px] p-10 rounded-[40px] shadow-[0_25px_70px_rgba(0,0,0,0.5)] border-2 border-white/20 dark:border-white/10 relative animate-in zoom-in duration-300'>
                <button 
                  className='absolute top-8 right-8 w-11 h-11 bg-slate-100 dark:bg-white/10 flex items-center justify-center rounded-2xl hover:bg-red-500 hover:text-white transition-all group border border-white/20' 
                  onClick={() => setShowRefundForm(false)}
                >
                    <RxCross1 size={18} className="text-slate-600 dark:text-white group-hover:text-white" />
                </button>
                
                <div className='flex items-center gap-4 text-red-500 mb-8'>
                    <div className='w-14 h-14 bg-red-500/20 rounded-2xl flex items-center justify-center shadow-lg border border-red-500/20'><MdLogout size={28} /></div>
                    <div className='flex flex-col'>
                        <h2 className='text-3xl font-black text-slate-900 dark:text-white tracking-tighter leading-none'>Refund Details</h2>
                        <span className='text-[10px] font-black uppercase tracking-[3px] text-red-500 mt-1 opacity-80'>Cancellation Flow</span>
                    </div>
                </div>
                
                <div className='bg-slate-50 dark:bg-white/5 p-5 rounded-[24px] border-2 border-slate-100 dark:border-white/10 mb-8'>
                    <p className='text-[13px] font-black text-slate-600 dark:text-slate-300 leading-relaxed uppercase tracking-widest text-center'>
                        Please provide your account details to process the cancellation refund.
                    </p>
                </div>
                
                <form onSubmit={handleCancelBooking} className='flex flex-col gap-6'>
                    <div className='flex flex-col gap-2'>
                        <label className='text-[11px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-[3px] ml-2'>Select Method</label>
                        <select 
                            className='w-full h-16 px-6 rounded-2xl border-2 border-slate-200 dark:border-white/20 bg-slate-100/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-white outline-none focus:border-red-500 transition-all cursor-pointer'
                            value={refundMethod} onChange={(e)=>setRefundMethod(e.target.value)}
                        >
                            <option value="Easypaisa">Easypaisa</option>
                            <option value="Jazzcash">Jazzcash</option>
                            <option value="Bank Transfer">Bank Transfer</option>
                            <option value="Wallet">System Wallet</option>
                        </select>
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[11px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-[3px] ml-2'>Account Number / Phone</label>
                        <input 
                           type="text" required 
                           placeholder="e.g 03001234567"
                           value={accountNo} onChange={(e)=>setAccountNo(e.target.value)}
                           className='w-full h-16 px-6 rounded-2xl border-2 border-slate-200 dark:border-white/20 bg-slate-100/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-white outline-none focus:border-red-500 transition-all placeholder-slate-400'
                        />
                    </div>

                    <div className='flex flex-col gap-2'>
                        <label className='text-[11px] font-black text-slate-600 dark:text-slate-200 uppercase tracking-[3px] ml-2'>Account Holder Name</label>
                        <input 
                           type="text" required 
                           placeholder="John Doe"
                           value={accountName} onChange={(e)=>setAccountName(e.target.value)}
                           className='w-full h-16 px-6 rounded-2xl border-2 border-slate-200 dark:border-white/20 bg-slate-100/50 dark:bg-slate-800/50 font-black text-slate-800 dark:text-white outline-none focus:border-red-500 transition-all placeholder-slate-400'
                        />
                    </div>

                    <div className='pt-4'>
                        <button 
                          type="submit" disabled={isCancelling}
                          className='w-full h-16 bg-red-600 text-white font-black text-[16px] uppercase tracking-[5px] rounded-3xl shadow-[0_15px_40px_rgba(239,68,68,0.4)] border-b-[6px] border-red-800 active:border-b-[0] active:translate-y-[6px] transition-all disabled:opacity-50 hover:bg-red-500 hover:scale-[1.02] active:scale-95'
                        >
                            {isCancelling ? 'Processing...' : 'Request Refund'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )}
    </>
  )
}

export default Card;