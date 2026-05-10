import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeft, FaUser, FaWallet, FaCheckCircle, FaClock, FaHashtag, FaCreditCard } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../Context/UserContext';
import { authDataContext } from '../Context/AuthContext'; 
import { listingDataContext } from '../Context/ListingContext';
import Card from '../Component/Card';
import axios from 'axios';
import { toast } from 'react-hot-toast';

function MyListing() {
    let navigate = useNavigate()
    let { userData, getCurrentUser } = useContext(userDataContext)
    let { serverUrl } = useContext(authDataContext) 
    let { getListing, listingData } = useContext(listingDataContext)
    
    const [isLoading, setIsLoading] = useState(true);
    const [hostBookings, setHostBookings] = useState([]);

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (getCurrentUser) {
                    await getCurrentUser();
                    await fetchHostBookings(); 
                    setIsLoading(false); // 🔥 Show UI immediately
                    
                    // Mark refund_request notifications as read for the owner (in background)
                    const token = localStorage.getItem("token");
                    if (token) {
                        axios.put(`${serverUrl}/api/user/mark-read-notifications`, { type: 'refund_request' }, {
                            headers: { Authorization: `Bearer ${token}` }
                        }).then(() => {
                            getCurrentUser(); // Refresh count after marking read
                        }).catch(err => console.error(err));
                    }
                } else {
                    setIsLoading(false);
                }
            } catch (error) { 
                console.error(error); 
                setIsLoading(false);
            }
        };
        loadData();
    }, []);

    const fetchHostBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${serverUrl}/api/booking/host-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHostBookings(res.data || []);
        } catch { console.log("Fetch Error"); }
    };

    const handleCancelByHost = async (bookingId) => {
        toast((t) => (
            <div className="flex flex-col gap-3 p-1">
                <p className="text-sm font-bold text-slate-800 text-center">Terminate this booking?</p>
                <div className="flex gap-2 justify-center">
                    <button onClick={async () => {
                        toast.dismiss(t.id);
                        try {
                            const token = localStorage.getItem("token");
                            
                            // Optimistic UI Update - Remove immediately
                            setHostBookings(prev => prev.filter(b => b._id !== bookingId));
                            toast.success("Cancelled Successfully");
                            
                            await axios.put(`${serverUrl}/api/booking/cancel/${bookingId}`, {}, {
                                headers: { Authorization: `Bearer ${token}` }
                            });
                            
                            // Background refreshes
                            fetchHostBookings();
                            if (getListing) getListing(); // Refresh home page listings
                            if (getCurrentUser) getCurrentUser(); // Refresh owner's properties data
                        } catch { 
                            toast.error("Error Processing Request");
                            fetchHostBookings(); // Revert on fail
                        }
                    }} className="bg-red-500 text-white px-5 py-2 rounded-lg text-xs font-bold">Yes, Cancel</button>
                    <button onClick={() => toast.dismiss(t.id)} className="bg-slate-100 px-5 py-2 rounded-lg text-xs font-bold">No</button>
                </div>
            </div>
        ), { duration: 5000 });
    };

    if (isLoading) {
        return (
            <div className="w-full h-screen flex flex-col items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                <p className="mt-4 text-slate-500 font-medium tracking-tight">Updating Host Panel...</p>
            </div>
        )
    }

    return (
        <div className='w-full min-h-screen bg-transparent pb-20'>
            <nav className='w-full bg-white/5 backdrop-blur-md border-b border-white/10 p-4 px-8 flex justify-between items-center sticky top-0 z-50'>
                <button className='flex items-center gap-2 font-bold text-xs text-white hover:text-[#00B4D8] transition-all' onClick={() => navigate("/")}>
                    <FaArrowLeft /> DASHBOARD
                </button>
                <span className='text-[11px] font-black uppercase text-[#00B4D8] bg-[#00B4D8]/10 px-4 py-1.5 rounded-full border border-[#00B4D8]/20'>
                    VenuSpark Management
                </span>
            </nav>

            <div className='max-w-[1200px] mx-auto px-6 mt-10'>
                <div className='mb-12 border-l-4 border-[#00B4D8] pl-6'>
                    <h2 className='text-3xl font-black text-white'>Host Panel</h2>
                    <p className='text-slate-300 text-sm'>Manage your venue bookings and track property availability.</p>
                </div>

                <section className='mb-16'>
                    <div className='flex items-center gap-3 mb-6'>
                        <h3 className='font-bold text-slate-300 uppercase tracking-widest text-sm'>Active Bookings</h3>
                        <span className='bg-[#8B5CF6] text-white text-[10px] px-2 py-0.5 rounded'>{hostBookings.length}</span>
                    </div>

                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
                        {hostBookings.map((book) => {
                            // 1. Status Check Logic (Database consistency)
                            const isPaid = book.paymentStatus === 'completed' || book.isPaid === true;
                            
                            // 2. Receiver Name Logic
                            const receiverName = book.paymentMethod === 'Manual' ? 'Hafsa Sajid' : 'Stripe Gateway';

                            return (
                                <div key={book._id} className='glass-card p-0 overflow-hidden hover:shadow-[0_10px_30px_rgba(139,92,246,0.2)] transition-all duration-300'>
                                    <div className='p-6'>
                                        <div className='flex justify-between items-start mb-4'>
                                            <h4 className='font-bold text-lg text-white leading-snug truncate max-w-[70%]'>{book.listing?.title}</h4>
                                            <span className={`text-[9px] font-bold px-2 py-1 rounded-md uppercase border ${isPaid ? 'bg-green-500/20 text-green-400 border-green-500/30' : 'bg-amber-500/20 text-amber-400 border-amber-500/30'}`}>
                                                {isPaid ? 'Paid' : 'Pending'}
                                            </span>
                                        </div>

                                        <div className='space-y-3 mb-6'>
                                            <div className='flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/10'>
                                                <div className='w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white shadow-sm'>
                                                    <FaUser size={12}/>
                                                </div>
                                                <div className='overflow-hidden text-ellipsis'>
                                                    <p className='text-[12px] font-bold text-white truncate'>{book.user?.name}</p>
                                                    <p className='text-[10px] text-slate-400 truncate'>{book.user?.email}</p>
                                                </div>
                                            </div>

                                            <div className='bg-white/5 p-3 rounded-xl border border-dashed border-white/20 space-y-2.5'>
                                                {/* Verification Row */}
                                                <div className='flex justify-between items-center'>
                                                    <span className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                                                        {isPaid ? <FaCheckCircle className="text-green-500"/> : <FaClock className="text-amber-500"/>} Status
                                                    </span>
                                                    <span className='text-[10px] font-bold text-white'>{isPaid ? 'Verified' : 'Awaiting'}</span>
                                                </div>

                                                {/* Method Row */}
                                                <div className='flex justify-between items-center'>
                                                    <span className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                                                        <FaCreditCard className="text-[#00B4D8]"/> Method
                                                    </span>
                                                    <span className='text-[10px] font-bold text-white bg-white/10 px-2 py-0.5 rounded border border-white/10 shadow-sm'>
                                                        {book.paymentMethod || 'Manual'}
                                                    </span>
                                                </div>

                                                {/* Receiver Row (Hafsa Sajid or Stripe) */}
                                                <div className='flex justify-between items-center'>
                                                    <span className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                                                        <FaUser className="text-[#00B4D8]"/> Received By
                                                    </span>
                                                    <span className='text-[10px] font-bold text-white'>{receiverName}</span>
                                                </div>

                                                {book.transactionId && (
                                                    <div className='flex justify-between items-center border-t border-white/10 pt-2'>
                                                        <span className='flex items-center gap-1.5 text-[10px] font-bold text-slate-400 uppercase'>
                                                            <FaHashtag /> Ref ID
                                                        </span>
                                                        <span className='text-[10px] font-mono text-slate-500 tracking-tighter'>{book.transactionId}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <div className='flex justify-between items-center px-2 pt-1'>
                                                <div className='flex items-center gap-2 text-slate-400 text-[11px] font-bold'>
                                                    <FaWallet className='text-[#00B4D8]' /> Net Income:
                                                </div>
                                                <span className='font-black text-white text-lg'>Rs. {book.price}</span>
                                            </div>

                                            {/* --- Refund Request Alert Block --- */}
                                            {book.refundStatus === 'Pending' && (
                                                <div className='bg-red-500/10 p-3 rounded-xl mt-3 border border-red-500/20 outline-dashed outline-1 outline-red-500/30 outline-offset-2'>
                                                    <h5 className='text-[10px] font-black text-red-400 uppercase tracking-widest mb-2 flex items-center gap-1.5'>
                                                        <FaClock size={12} /> Refund Request Pending
                                                    </h5>
                                                    <div className='flex flex-col gap-1 text-[10px] font-bold text-slate-300 space-y-0.5 border-t border-red-500/20 pt-2'>
                                                        <div className='flex justify-between'><span>Refund Amt:</span> <span className='text-red-400 font-black'>Rs. {book.price}</span></div>
                                                        <div className='flex justify-between'><span>Method:</span> <span className='text-white'>{book.refundDetails?.method}</span></div>
                                                        <div className='flex justify-between'><span>Acc No:</span> <span className='text-white font-mono tracking-tighter'>{book.refundDetails?.accountNo}</span></div>
                                                        <div className='flex justify-between'><span>Title:</span> <span className='text-white'>{book.refundDetails?.accountName}</span></div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => handleCancelByHost(book._id)}
                                            className='w-full py-3 rounded-xl bg-red-500/10 text-red-400 text-[10px] font-black uppercase tracking-widest border border-red-500/20 hover:bg-red-500/30 hover:text-red-300 transition-all duration-300'
                                        >
                                            {book.refundStatus === 'Pending' ? 'Approve Refund & Terminate' : 'Terminate Booking'}
                                        </button>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>

                <section>
                    <h3 className='font-bold text-slate-300 uppercase tracking-widest text-sm mb-6'>Your Properties</h3>
                    <div className='flex flex-wrap gap-8 justify-center md:justify-start'>
                        {listingData?.filter(item => (item.host === userData?._id || item.host?._id === userData?._id)).map((list) => (
                            <Card 
                              key={list._id} 
                              title={list.title} 
                              landMark={list.landmark} 
                              city={list.city} 
                              image1={list.images?.[0]} 
                              rent={list.rent} 
                              id={list._id} 
                              isBooked={list.isBooked} 
                              ratings={list.ratings} 
                            />
                        ))}
                    </div>
                </section>
            </div>
        </div>
    )
}

export default MyListing;