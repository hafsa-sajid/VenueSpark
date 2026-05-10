import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../Context/UserContext';
import { authDataContext } from '../Context/AuthContext'; 
import Card from '../Component/Card';
import axios from 'axios';

function MyBooking() {
    let navigate = useNavigate()
    let { userData, getCurrentUser } = useContext(userDataContext)
    let { serverUrl } = useContext(authDataContext) 
    const [isLoading, setIsLoading] = useState(true);
    const [userBookings, setUserBookings] = useState([]);

    const fetchUserBookings = async () => {
        try {
            const token = localStorage.getItem("token");
            const res = await axios.get(`${serverUrl}/api/booking/user-bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setUserBookings(res.data || []);
        } catch (err) { console.error("Fetch User Bookings Error:", err); }
    };

    useEffect(() => {
        const loadData = async () => {
            setIsLoading(true);
            try {
                if (getCurrentUser) {
                    await getCurrentUser();
                    await fetchUserBookings();
                    setIsLoading(false); // 🔥 Show UI immediately after getting bookings
                    
                    // Mark cancellation_complete notifications as read for the user (in background)
                    const token = localStorage.getItem("token");
                    if (token) {
                        axios.put(`${serverUrl}/api/user/mark-read-notifications`, { type: 'cancellation_complete' }, {
                            headers: { Authorization: `Bearer ${token}` }
                        }).then(() => {
                            getCurrentUser(); // Refresh count after marking read
                        }).catch(err => console.error("Notification update error", err));
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

    const getSafeUrl = (imgName) => {
        if (!imgName) return null; 
        if (imgName.startsWith('http')) return imgName;
        const base = serverUrl ? serverUrl.replace(/\/$/, "") : "http://localhost:8000";
        const fileName = imgName.split('\\').pop().split('/').pop();
        return `${base}/uploads/${fileName}`;
    };

    return (
        <div className='w-[100vw] min-h-[100vh] flex items-center justify-start flex-col gap-[20px] relative bg-transparent px-[20px] pb-10'>
            <div className='w-[50px] h-[50px] bg-white/5 border border-white/10 cursor-pointer absolute top-[20px] left-[20px] rounded-[50%] flex items-center justify-center hover:bg-white/20 transition-all' onClick={() => navigate("/")}>
                <FaArrowLeft className='w-[20px] h-[20px] text-white ' />
            </div>

            <div className='glass-card-container w-[90%] md:w-[60%] max-w-[600px] mt-[80px]'>
                <div className='glass-card p-5 flex items-center justify-center text-3xl md:text-4xl text-white font-black text-center'>
                    MY BOOKINGS
                </div>
            </div>

            <div className='w-[100%] flex items-center justify-center gap-[25px] flex-wrap mt-[10px] p-4'>
                {isLoading ? (
                    <div className="flex flex-col items-center gap-4 mt-20">
                        <div className="w-12 h-12 border-4 border-[#00B4D8] border-t-transparent rounded-full animate-spin"></div>
                        <p className="text-slate-300 animate-pulse">Loading your bookings...</p>
                    </div>
                ) 
                : userBookings && userBookings.length > 0 ? (
                    userBookings.map((book, num) => {
                        const item = book.listing; // Actual property details
                        if(!item) return null;

                        return (
                            <Card
                                key={book._id || num}
                                title={item.title}
                                landMark={item.landmark} 
                                city={item.city}
                                image1={getSafeUrl(item.images?.[0])}
                                image2={getSafeUrl(item.images?.[1])}
                                image3={getSafeUrl(item.images?.[2])}
                                rent={item.rent}
                                id={item._id}
                                isBooked={true}
                                ratings={item.ratings} 
                                host={item.host}
                                bookingId={book._id} // FIX: Cancel button ke liye ID pass kar di
                                bookingCreatedAt={book.createdAt} // For 6-hours timer
                                fullBooking={book} // Pass the complete booking object for receipt
                            />
                        )
                    })
                ) : (
                    <div className="glass-card-container">
                        <div className="glass-card flex flex-col items-center gap-4 text-center p-10 mt-20">
                            <p className="text-white font-semibold text-xl">No bookings found.</p>
                            <button 
                                onClick={async () => {
                                    setIsLoading(true);
                                    await fetchUserBookings();
                                    setIsLoading(false);
                                }} 
                                className="bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8] text-white px-8 py-3 rounded-full shadow-md hover:opacity-90 transition-all font-semibold"
                            >
                                Refresh Data
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyBooking;