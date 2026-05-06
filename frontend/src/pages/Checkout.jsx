import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { bookingDataContext } from '../Context/BookingContext';
import { listingDataContext } from '../Context/ListingContext';
import { userDataContext } from '../Context/UserContext';
import { FaMobileAlt, FaCreditCard, FaArrowLeft, FaCheckCircle, FaShieldAlt, FaReceipt } from 'react-icons/fa';
import { toast } from 'react-hot-toast';

// Stripe Hooks
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

function Checkout() {
    const navigate = useNavigate();
    const stripe = useStripe();
    const elements = useElements();

    const { total, checkIn, checkOut, handleBooking, resetBookingState } = useContext(bookingDataContext);
    const { cardDetails } = useContext(listingDataContext);
    const { userData: user } = useContext(userDataContext);

    const [paymentMethod, setPaymentMethod] = useState('Manual'); 
    const [tid, setTid] = useState('');
    const [paymentProof, setPaymentProof] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleConfirmBooking = async () => {
        if (paymentMethod === 'Manual') {
            if (tid.length < 8) return toast.error("Please enter a valid Transaction ID (TID)!");
            if (!paymentProof) return toast.error("Please upload a screenshot of your payment proof!");
        }

        setLoading(true);
        
        let finalTid = tid;

        // Stripe Logic
        if (paymentMethod === 'Stripe') {
            if (!stripe || !elements) {
                setLoading(false);
                return;
            }

            const cardElement = elements.getElement(CardElement);
            const { error, paymentMethod: stripePM } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setLoading(false);
                return toast.error(error.message);
            }
            finalTid = stripePM.id; // Stripe Transaction ID
        }

        try {
            const response = await handleBooking(
                cardDetails._id, 
                total, 
                user._id, 
                paymentMethod, 
                finalTid,
                paymentProof // Passing the file
            );

            if (response) {
                toast.success("Payment Successful! 🎉");
                if (resetBookingState) resetBookingState();
                navigate("/booked", { state: { bookingDetails: response } });
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Payment processing failed.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-transparent flex flex-col items-center py-20 px-4 transition-colors duration-500 overflow-x-hidden">
            {/* Brand Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
            </div>

            <div className='w-full max-w-[1000px] relative z-10'>
                <button 
                    onClick={() => navigate(-1)} 
                    className='group flex items-center gap-4 text-slate-300 mb-12 hover:text-white transition-all font-black text-xs uppercase tracking-[4px] active:scale-95'
                >
                    <div className='w-10 h-10 bg-white/10 rounded-[14px] flex items-center justify-center shadow-lg border border-white/20 group-hover:bg-[#00B4D8] group-hover:border-[#00B4D8] transition-all'>
                        <FaArrowLeft size={14}/>
                    </div>
                    Back to Details
                </button>

                <div className='flex flex-col lg:flex-row gap-12'>
                    <div className='flex-1 space-y-12'>
                        <div>
                            <div className='flex items-center gap-3 text-[#8B5CF6] mb-4'>
                                <FaShieldAlt size={22}/>
                                <span className='text-[11px] font-black uppercase tracking-[5px]'>Secure Portal</span>
                            </div>
                            <h1 className='text-5xl font-black text-slate-900 dark:text-white tracking-tighter leading-none'>Checkout</h1>
                            <p className='text-slate-600 dark:text-slate-300 font-medium mt-4 text-lg'>Finalize your booking with our encrypted gateway</p>
                        </div>

                        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                            <div 
                                onClick={() => setPaymentMethod('Manual')}
                                className={`p-10 rounded-[45px] border-2 cursor-pointer transition-all duration-500 relative group flex flex-col gap-8 ${paymentMethod === 'Manual' ? 'border-[#00B4D8] bg-[#00B4D8]/10 shadow-[0_20px_50px_rgba(0,180,216,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/30 hover:scale-[1.02]'}`}
                            >
                                <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all duration-500 ${paymentMethod === 'Manual' ? 'bg-[#00B4D8] text-white shadow-xl rotate-6' : 'bg-white/10 text-slate-300 group-hover:text-[#00B4D8]'}`}>
                                    <FaMobileAlt size={32} />
                                </div>
                                <div>
                                    <p className={`font-black text-xl ${paymentMethod === 'Manual' ? 'text-[#00B4D8]' : 'text-slate-800 dark:text-white'}`}>Instant Transfer</p>
                                    <p className='text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2'>JazzCash / EasyPaisa</p>
                                </div>
                                {paymentMethod === 'Manual' && <FaCheckCircle className='absolute top-10 right-10 text-[#00B4D8]' size={28} />}
                            </div>

                            <div 
                                onClick={() => setPaymentMethod('Stripe')}
                                className={`p-10 rounded-[45px] border-2 cursor-pointer transition-all duration-500 relative group flex flex-col gap-8 ${paymentMethod === 'Stripe' ? 'border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-[0_20px_50px_rgba(139,92,246,0.2)]' : 'border-white/10 bg-white/5 hover:border-white/30 hover:scale-[1.02]'}`}
                            >
                                <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center transition-all duration-500 ${paymentMethod === 'Stripe' ? 'bg-[#8B5CF6] text-white shadow-xl rotate-6' : 'bg-white/10 text-slate-300 group-hover:text-[#8B5CF6]'}`}>
                                    <FaCreditCard size={32} />
                                </div>
                                <div>
                                    <p className={`font-black text-xl ${paymentMethod === 'Stripe' ? 'text-[#8B5CF6]' : 'text-slate-800 dark:text-white'}`}>Bank Card</p>
                                    <p className='text-[10px] text-slate-500 dark:text-slate-400 font-black uppercase tracking-widest mt-2'>Visa / MasterCard / Stripe</p>
                                </div>
                                {paymentMethod === 'Stripe' && <FaCheckCircle className='absolute top-10 right-10 text-[#8B5CF6]' size={28} />}
                            </div>
                        </div>
                    </div>

                    <div className='w-full lg:w-[450px] glass-card border border-white/20 rounded-[45px] p-8 md:p-10 shadow-[0_30px_80px_rgba(0,0,0,0.4)] flex flex-col gap-6 h-fit animate-pop-3d'>
                        <div className='flex items-center gap-3 text-slate-300 mb-2'>
                            <FaReceipt size={18} className='text-[#8B5CF6]'/>
                            <span className='text-[11px] font-black uppercase tracking-[4px]'>Order Detail</span>
                        </div>
                        
                        {paymentMethod === 'Manual' ? (
                            <div className='space-y-5'>
                                <div className='bg-[#00B4D8]/5 p-6 rounded-[30px] border-2 border-[#00B4D8]/10 text-center space-y-2'>
                                    <p className='text-[10px] font-black uppercase tracking-[3px] text-slate-400'>Direct Number</p>
                                    <p className='text-3xl font-black text-[#00B4D8] tracking-tighter'>0305 8243273</p>
                                    <p className='text-[11px] font-bold text-slate-500 uppercase tracking-widest'>Owner: Hafsa Sajid</p>
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-slate-400 tracking-[4px] ml-4'>Transaction ID</label>
                                    <input 
                                        type="text" 
                                        placeholder="E.G. 0987654321" 
                                        className='w-full h-14 bg-white/5 border border-white/20 rounded-[20px] outline-none px-6 text-sm font-black text-white placeholder-slate-500 focus:border-[#00B4D8] transition-all'
                                        value={tid}
                                        onChange={(e) => setTid(e.target.value)}
                                        autoComplete="off"
                                    />
                                </div>

                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-slate-400 tracking-[4px] ml-4'>Screenshot Proof</label>
                                    <div className='relative group h-16 bg-white/5 border border-dashed border-white/20 rounded-[20px] flex items-center justify-center cursor-pointer hover:border-[#00B4D8] transition-all overflow-hidden'>
                                        <span className='text-xs text-slate-300 font-black uppercase tracking-[2px] px-6 text-center truncate'>
                                            {paymentProof ? paymentProof.name : "Select Image"}
                                        </span>
                                        <input 
                                            type="file" 
                                            className='absolute inset-0 opacity-0 cursor-pointer'
                                            accept="image/*"
                                            onChange={(e) => setPaymentProof(e.target.files[0])}
                                        />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className='space-y-5'>
                                <div className='p-6 rounded-[30px] bg-white/5 border border-white/10 space-y-4'>
                                    <p className='text-xs text-[#8B5CF6] font-black uppercase tracking-widest text-center italic'>Stripe SandBox Mode</p>
                                    <div className='bg-white/10 p-4 rounded-xl border border-white/20 shadow-inner'>
                                        <CardElement 
                                            options={{
                                                style: {
                                                    base: {
                                                        fontSize: '15px',
                                                        color: '#ffffff',
                                                        '::placeholder': { color: '#94a3b8' },
                                                        fontFamily: 'Outfit, sans-serif',
                                                    },
                                                    invalid: { color: '#ef4444' },
                                                },
                                            }} 
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div className='mt-2 pt-6 border-t border-white/10 flex flex-col gap-6'>
                            <div className='flex justify-between items-center'>
                                <span className='text-[11px] font-black uppercase tracking-[4px] text-slate-400'>Amount Total</span>
                                <span className='text-3xl font-black text-white tracking-tighter'>Rs.{total}</span>
                            </div>

                            <button 
                                onClick={handleConfirmBooking}
                                disabled={loading}
                                className={`w-full h-16 rounded-[25px] font-black text-sm uppercase tracking-[5px] text-white transition-all shadow-xl active:translate-y-1 border-b-[4px] ${paymentMethod === 'Manual' ? 'bg-[#00B4D8] border-[#0077B6] shadow-[#00B4D8]/40' : 'bg-[#8B5CF6] border-[#6D28D9] shadow-[#8B5CF6]/40'} disabled:opacity-50`}
                            >
                                {loading ? "Authorizing..." : "Pay & Book Now"}
                            </button>
                        </div>

                        <p className='text-[9px] font-bold text-slate-400 text-center uppercase tracking-[4px]'>
                            100% Encrypted & Safe
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Checkout;