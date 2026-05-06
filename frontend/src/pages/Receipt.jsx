import React, { useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FaPrint, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

function Receipt() {
    const location = useLocation();
    const navigate = useNavigate();
    const receiptRef = useRef();
    const { booking } = location.state || {};

    if (!booking) return <div className="p-10">No receipt data found.</div>;

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="min-h-screen bg-transparent py-10 px-4 flex flex-col items-center">
            <div className="w-full max-w-[600px] flex justify-between mb-6 no-print">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 font-bold hover:text-white transition-all">
                    <FaArrowLeft /> Back
                </button>
                <button onClick={handlePrint} className="bg-[#8B5CF6] text-white px-6 py-2 rounded-full font-bold flex items-center gap-2 shadow-lg">
                    <FaPrint /> Print Receipt
                </button>
            </div>

            <div ref={receiptRef} className="w-full max-w-[600px] glass-card p-0 overflow-hidden border border-white/20 print-override">
                <div className="bg-white/10 p-8 text-white text-center relative border-b border-white/10">
                    <div className="absolute top-4 right-8 text-[#00B4D8] flex items-center gap-2 text-xs font-bold uppercase">
                        <FaCheckCircle /> Paid
                    </div>
                    <h1 className="text-3xl font-black tracking-tighter">VenuSpark</h1>
                    <p className="text-slate-400 text-xs mt-1 uppercase tracking-[4px]">Booking Receipt</p>
                </div>

                <div className="p-8 space-y-8">
                    <div className="grid grid-cols-2 gap-6">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Booking ID</p>
                            <p className="font-bold text-sm text-white">#{booking._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Date</p>
                            <p className="font-bold text-sm text-white">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    <div className="h-[1px] bg-white/10 w-full"></div>

                    <div className="space-y-4">
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Property</span>
                            <span className="font-bold text-white">{booking.listing?.title || "Property Reserved"}</span>
                        </div>
                        {/* Added User Email */}
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Guest Email</span>
                            <span className="font-bold text-white">{booking.user?.email || "N/A"}</span>
                        </div>
                        {/* Added Owner Email */}
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Owner Email</span>
                            <span className="font-bold text-white">{booking.host?.email || booking.listing?.owner?.email || "N/A"}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Check-In</span>
                            <span className="font-bold text-white">{booking.checkIn}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Check-Out</span>
                            <span className="font-bold text-white">{booking.checkOut}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Payment Method</span>
                            <span className="font-bold text-white">{booking.paymentMethod}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-slate-400 text-sm">Transaction ID</span>
                            <span className="font-mono font-bold text-[#00B4D8]">{booking.transactionId}</span>
                        </div>
                    </div>

                    <div className="bg-white/5 p-6 rounded-2xl flex justify-between items-center border border-white/10">
                        <div>
                            <p className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Total Amount Paid</p>
                            <p className="text-sm text-slate-500 italic">Inclusive of all taxes</p>
                        </div>
                        <p className="text-3xl font-black text-white">Rs.{booking.price}</p>
                    </div>

                    <div className="text-center pt-4">
                        <p className="text-xs text-slate-400 font-medium">Thank you for choosing VenuSpark!</p>
                        <p className="text-[9px] text-slate-500 mt-1 italic">This is a computer generated receipt for FYP project purposes.</p>
                    </div>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{ __html: `
                @media print {
                    .no-print { display: none !important; }
                    body { background: white !important; }
                    .print-override { 
                        background: white !important; 
                        color: black !important;
                        box-shadow: none !important;
                        border: 1px solid #e5e7eb !important;
                    }
                    .print-override * {
                        color: black !important;
                        border-color: #e5e7eb !important;
                    }
                    .shadow-2xl { box-shadow: none !important; }
                }
            `}} />
        </div>
    );
}

export default Receipt;