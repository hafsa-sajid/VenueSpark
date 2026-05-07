import React, { useContext, useEffect, useState } from 'react'
import { FaArrowLeft, FaArrowRight, FaStar, FaShieldAlt, FaCamera, FaWallet } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { listingDataContext } from '../Context/ListingContext';
import { userDataContext } from '../Context/UserContext';
import { RxCross1 } from "react-icons/rx";
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { bookingDataContext } from '../Context/BookingContext';
import { authDataContext } from '../Context/AuthContext';
import CommentSection from '../components/CommentSection';
import Nav from '../Component/Nav';

function ViewCard() {
    let navigate = useNavigate()
    
    let { cardDetails, setCardDetails, getListing, updating, setUpdating, setDeleting } = useContext(listingDataContext)
    let { userData } = useContext(userDataContext)
    let { serverUrl } = useContext(authDataContext)
    
    let [updatePopUp, setUpdatePopUp] = useState(false)
    let [bookingPopUp, setBookingPopUp] = useState(false)
    let [minDate, setMinDate] = useState("")
    const [selectedImg, setSelectedImg] = useState(null);

    let {
        checkIn, setCheckIn,
        checkOut, setCheckOut,
        total, setTotal,
        night, setNight
    } = useContext(bookingDataContext)
   
    // --- UPDATED PRICING LOGIC (7% Charges + 7% Tax) ---
    useEffect(() => {
        if (checkIn && checkOut && cardDetails) {
            let inDate = new Date(checkIn)
            let OutDate = new Date(checkOut)
            let n = Math.ceil((OutDate - inDate) / (24 * 60 * 60 * 1000))
            let calculatedNights = n > 0 ? n : 0;
            setNight(calculatedNights)
            
            let baseRent = (cardDetails?.rent * calculatedNights) || 0
            
            // Logic: 7% VenuSpark fee and 7% Service/Legal Tax
            let venusSparkCharge = Math.round(baseRent * 0.07)
            let tax = Math.round(baseRent * 0.07)

            if (calculatedNights > 0) {
                setTotal(baseRent + venusSparkCharge + tax)
            } else {
                setTotal(0)
            }
        }
    }, [checkIn, checkOut, cardDetails, setNight, setTotal])

    // Form Local States
    let [title, setTitle] = useState("");
    let [description, setDescription] = useState("");
    let [rent, setRent] = useState("");
    let [city, setCity] = useState("");
    let [landmark, setLandMark] = useState(""); 
    let [category, setCategory] = useState(""); 
    const [previewImages, setPreviewImages] = useState([null, null, null]);

    useEffect(() => {
        if (cardDetails) {
            setTitle(cardDetails.title || "");
            setDescription(cardDetails.description || "");
            setRent(cardDetails.rent || "");
            setCity(cardDetails.city || "");
            setLandMark(cardDetails.landmark || "");
            setCategory(cardDetails.category || "");
            setPreviewImages([
                cardDetails.images?.[0] || null,
                cardDetails.images?.[1] || null,
                cardDetails.images?.[2] || null
            ]);
        }
    }, [cardDetails]);

    let [backEndImage1, setBackEndImage1] = useState(null);
    let [backEndImage2, setBackEndImage2] = useState(null);
    let [backEndImage3, setBackEndImage3] = useState(null);
    
    const token = localStorage.getItem('token'); 
    
    useEffect(() => {
        let today = new Date().toISOString().split('T')[0]
        setMinDate(today)
    }, [])

    const handleImageChange = (e, index) => {
        const file = e.target.files[0];
        if (file) {
            if (index === 0) setBackEndImage1(file);
            if (index === 1) setBackEndImage2(file);
            if (index === 2) setBackEndImage3(file);

            const reader = new FileReader();
            reader.onloadend = () => {
                const newPreviews = [...previewImages];
                newPreviews[index] = reader.result;
                setPreviewImages(newPreviews);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleUpdateListing = async (e) => {
        if (e) e.preventDefault();
        setUpdating(true); 
        try {
            let formData = new FormData();
            formData.append("title", title);
            formData.append("description", description);
            formData.append("rent", rent);
            formData.append("city", city);
            formData.append("landmark", landmark); 
            formData.append("category", category);
            if (backEndImage1) formData.append("image1", backEndImage1);
            if (backEndImage2) formData.append("image2", backEndImage2);
            if (backEndImage3) formData.append("image3", backEndImage3);
            
            const response = await axios.post(`${serverUrl}/api/listing/update/${cardDetails._id}`, formData, {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            if(response.data.updatedListing) {
                setCardDetails(response.data.updatedListing);
            } else {
                await getListing();
            }

            toast.success("Updated Successfully!");
            setUpdatePopUp(false);
        } catch {
            toast.error("Update failed.");
        } finally { 
            setUpdating(false); 
        }
    };

    const onConfirmBooking = () => {
        if (!userData) { toast.error("Please login to book!"); return; }
        if (!checkIn || !checkOut) { toast.error("Select dates!"); return; }
        if (night <= 0) { toast.error("Invalid dates!"); return; }
        navigate("/checkout"); 
    };

    const handleDeleteListing = async () => {
        const confirmDelete = window.confirm("Are you sure?");
        if (!confirmDelete) return;
        setDeleting(true)
        try {
            await axios.delete(`${serverUrl}/api/listing/delete/${cardDetails._id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            toast.success("Listing Deleted!");
            navigate("/")
        } catch {
            toast.error("Failed to delete.");
        } finally {
            setDeleting(false);
        }
    }

    const handlePrevImage = (e) => {
        e.stopPropagation();
        if (!cardDetails?.images || cardDetails.images.length === 0) return;
        const validImages = cardDetails.images.filter(img => img);
        const currentIndex = validImages.indexOf(selectedImg);
        if (currentIndex > 0) {
            setSelectedImg(validImages[currentIndex - 1]);
        } else {
            setSelectedImg(validImages[validImages.length - 1]);
        }
    };

    const handleNextImage = (e) => {
        e.stopPropagation();
        if (!cardDetails?.images || cardDetails.images.length === 0) return;
        const validImages = cardDetails.images.filter(img => img);
        const currentIndex = validImages.indexOf(selectedImg);
        if (currentIndex < validImages.length - 1) {
            setSelectedImg(validImages[currentIndex + 1]);
        } else {
            setSelectedImg(validImages[0]);
        }
    };

    if (!cardDetails) return (
        <div className='h-screen flex flex-col items-center justify-center bg-transparent gap-4'>
            <div className='w-12 h-12 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin'></div>
        </div>
    );

    return (
        <div className="min-h-screen font-sans relative pb-20">
            {/* Dynamic Brand Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
            </div>

            {/* Lightbox */}
            {selectedImg && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4 cursor-zoom-out" onClick={() => setSelectedImg(null)}>
                    <button className="absolute top-8 right-8 text-white hover:rotate-90 transition-transform"><RxCross1 size={30} /></button>
                    
                    <button className="absolute left-4 md:left-12 text-white hover:scale-110 transition-transform bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md" onClick={handlePrevImage}><FaArrowLeft size={24} /></button>

                    <img src={selectedImg} className="max-w-[80%] max-h-[90%] object-contain rounded-2xl shadow-2xl" alt="Preview" onClick={(e) => e.stopPropagation()} />
                    
                    <button className="absolute right-4 md:right-12 text-white hover:scale-110 transition-transform bg-white/10 hover:bg-white/20 p-4 rounded-full backdrop-blur-md" onClick={handleNextImage}><FaArrowRight size={24} /></button>
                </div>
            )}

            <div className='w-full flex items-center flex-col relative py-8'>
                <div className='w-[90%] md:w-[85%] flex items-center mb-6 mt-20'>
                    <button className='w-11 h-11 bg-white/5 border border-white/10 rounded-2xl flex items-center justify-center text-slate-300 shadow-sm transition-all hover:bg-white/10 hover:text-white active:scale-90' onClick={() => navigate("/")}><FaArrowLeft size={16} /></button>
                </div>

                <div className='w-[90%] md:w-[85%] mb-8'>
                    <h1 className='text-3xl md:text-5xl font-black text-white tracking-tight leading-tight'>
                        {cardDetails.landmark}, <span className='text-[#8B5CF6]'>{cardDetails.city}</span>
                    </h1>
                </div>

                {/* Gallery */}
                <div className='glass-card-container w-[90%] md:w-[85%] h-auto grid grid-cols-1 md:grid-cols-4 md:grid-rows-2 gap-4'>
                    <div className='glass-card p-2 md:col-span-2 md:row-span-2 h-[350px] md:h-[550px] overflow-hidden cursor-pointer group' onClick={() => setSelectedImg(cardDetails.images?.[0])}>
                        <img src={cardDetails.images?.[0]} alt="Main" className='w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-' />
                    </div>
                    <div className='glass-card p-2 hidden md:block md:col-span-2 h-[265px] overflow-hidden cursor-pointer group' onClick={() => setSelectedImg(cardDetails.images?.[1])}>
                        <img src={cardDetails.images?.[1]} alt="Side 1" className='w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-' />
                    </div>
                    <div className='glass-card p-2 hidden md:block md:col-span-2 h-[265px] overflow-hidden cursor-pointer group' onClick={() => setSelectedImg(cardDetails.images?.[2])}>
                        <img src={cardDetails.images?.[2]} alt="Side 2" className='w-full h-full object-cover rounded-[24px] transition-transform duration-700 group-' />
                    </div>
                </div>

                {/* Content */}
                <div className='w-[90%] md:w-[85%] flex flex-col lg:flex-row justify-between mt-12 gap-12'>
                    <div className='flex-1'>
                        <div className='flex items-center gap-4 mb-6'>
                            <div className='bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 px-5 py-1.5 rounded-full backdrop-blur-sm'>
                                <span className='text-[10px] font-black uppercase tracking-[2px] text-white'>{cardDetails.category}</span>
                            </div>
                            <div className='flex items-center gap-1.5 font-black text-white bg-white/5 border border-white/10 backdrop-blur-sm px-4 py-1.5 rounded-full shadow-sm'>
                                <FaStar className='text-yellow-500' size={16}/> {cardDetails.ratings || "5.0"}
                            </div>
                        </div>
                        <h2 className='text-3xl font-black text-white mb-6 tracking-tight'>{cardDetails.title}</h2>
                        <div className='h-1.5 w-16 bg-[#8B5CF6] rounded-full mb-8'></div>
                        <p className='text-slate-300 text-[14px] leading-relaxed whitespace-pre-line font-medium'>{cardDetails.description || "Premium stay experience curated by VenuSpark."}</p>
                        
                        {/* Owner Details Section */}
                        {cardDetails.host && cardDetails.host.name && (
                            <div className='glass-card-container mt-12'>
                                <div className='glass-card p-6 flex items-center justify-start gap-5'>
                                    <div className='w-16 h-16 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-full flex items-center justify-center text-white text-2xl font-black shadow-md border-2 border-white/20'>
                                        {cardDetails.host.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className='flex flex-col'>
                                        <span className='text-[12px] font-bold text-[#00B4D8] tracking-widest uppercase mb-1'>Listing Owner</span>
                                        <span className='text-[20px] font-black text-white leading-none'>{cardDetails.host.name}</span>
                                        <span className='text-[14px] font-medium text-slate-400 mt-1 flex items-center gap-2'>
                                            <FaShieldAlt className='text-green-500'/> Verified Host
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                        
                    </div>

                    <div className='w-full lg:w-[400px]'>
                        <div className='glass-card-container sticky top-28'>
                            <div className='glass-card p-10'>
                                <div className='flex justify-between items-center mb-10'>
                                    <div className='flex flex-col'>
                                        <span className='text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1'>Per Night</span>
                                        <span className='text-4xl font-black text-white drop-shadow-md'>Rs.{cardDetails.rent}</span>
                                    </div>
                                    <div className='w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-[#00B4D8] border border-white/10'>
                                        <FaWallet size={20}/>
                                    </div>
                                </div>
                                
                                {(cardDetails.host === userData?._id || cardDetails.host?._id === userData?._id) ? (
                                    <button className='w-full py-5 bg-white/10 text-white rounded-[24px] border border-white/20 hover:bg-white/20 transition-all font-black text-lg hover:shadow-xl backdrop-blur-md' onClick={()=>setUpdatePopUp(true)}>Manage Property</button>
                                ) : (
                                    <button className='w-full py-5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-[24px] font-black text-xl border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] shadow-[0px_6px_20px_rgba(139,92,246,0.3)] transition-all' onClick={()=>setBookingPopUp(true)}>Book Venue</button>
                                )}
                                
                                <div className='flex items-center justify-center gap-3 mt-8 text-slate-400'>
                                    <FaShieldAlt size={14} className='text-[#00B4D8]'/>
                                    <p className='text-[10px] font-black uppercase tracking-[2px]'>Secure Booking Guaranteed</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>


                {/* Comments System */}
                <div className='w-[90%] md:w-[85%] mx-auto pb-10'>
                    <CommentSection listingId={cardDetails._id} />
                </div>
            </div>

            {/* --- Update Popup --- */}
            {updatePopUp && (
                <div className='w-full h-screen flex items-center justify-center bg-slate-900/90 fixed top-0 left-0 z-[100] backdrop-blur-xl p-4 overflow-y-auto'>
                    <div className='glass-card max-w-[750px] w-full shadow-2xl relative my-auto animate-in fade-in zoom-in duration-300'>
                        <div className='p-10 border-b border-white/10 flex justify-between items-center'>
                            <div>
                                <h2 className='text-3xl font-black text-white'>Edit Details</h2>
                                <p className='text-xs text-[#00B4D8] font-black uppercase tracking-widest mt-1'>Keep your listing fresh and updated</p>
                            </div>
                            <button className='w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 transition-colors' onClick={() => setUpdatePopUp(false)}><RxCross1 size={22} /></button>
                        </div>

                        <form onSubmit={handleUpdateListing} className='p-10 space-y-8'>
                            <div className='grid grid-cols-3 gap-6'>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} className='group relative h-36 bg-white/5 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden hover:border-[#8B5CF6] transition-all'>
                                        {previewImages[i] ? <img src={previewImages[i]} className='w-full h-full object-cover' alt="preview" /> : <div className='flex flex-col items-center justify-center h-full text-slate-400 gap-2'><FaCamera size={24} /><span className='text-[9px] font-black uppercase'>Upload</span></div>}
                                        <label className='absolute inset-0 bg-slate-900/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer text-white text-[10px] font-black uppercase'>
                                            Update <input type="file" className='hidden' onChange={(e) => handleImageChange(e, i)} accept="image/*" />
                                        </label>
                                    </div>
                                ))}
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Listing Title</label>
                                    <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all' autoComplete="off" />
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Daily Rate (Rs)</label>
                                    <input type="number" value={rent} onChange={(e) => setRent(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all' autoComplete="off" />
                                </div>
                            </div>

                            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Property Category</label>
                                    <input type="text" value={category} onChange={(e) => setCategory(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all' autoComplete="off" />
                                </div>
                                <div className='space-y-2'>
                                    <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Location City</label>
                                    <input type="text" value={city} onChange={(e) => setCity(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all' autoComplete="off" />
                                </div>
                            </div>

                            <div className='space-y-2'>
                                <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Specific Landmark</label>
                                <input type="text" value={landmark} onChange={(e) => setLandMark(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all' autoComplete="off" />
                            </div>

                            <div className='space-y-2'>
                                <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Property Description</label>
                                <textarea value={description} onChange={(e) => setDescription(e.target.value)} className='w-full border-2 border-white/10 bg-white/5 rounded-2xl p-4 h-32 font-medium outline-none focus:bg-white/10 focus:border-[#8B5CF6] text-white transition-all resize-none' />
                            </div>

                            <div className='flex flex-col md:flex-row gap-4 pt-6 w-full'>
                                <button type="submit" disabled={updating} className='flex-[2] py-4 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white rounded-[20px] font-black text-lg shadow-[0px_6px_20px_rgba(139,92,246,0.3)] border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] disabled:opacity-60 disabled:cursor-not-allowed transition-all'>
                                    {updating ? "Saving..." : "Apply Updates"}
                                </button>
                                <button type="button" onClick={handleDeleteListing} className='flex-[1] py-4 bg-white/10 text-red-400 rounded-[20px] font-black border border-red-500/30 hover:bg-red-500/20 transition-all'>
                                    Remove
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Booking PopUp */}
            {bookingPopUp && (
                <div className='w-full h-screen flex items-center justify-center bg-slate-900/90 fixed top-0 left-0 z-[100] backdrop-blur-xl p-4'>
                    <div className='glass-card max-w-[1000px] w-full flex flex-col md:flex-row shadow-2xl overflow-hidden relative animate-in slide-in-from-bottom-8 duration-500'>
                        <button className='absolute top-8 left-8 w-12 h-12 bg-white/10 border border-white/10 text-white shadow-xl rounded-2xl flex items-center justify-center z-10 hover:bg-white/20 transition-colors' onClick={() => setBookingPopUp(false)}><RxCross1 size={20} /></button>
                        
                        <div className='flex flex-col md:flex-row w-full'>
                            <div className='flex-1 p-10 md:p-16'>
                                <h2 className='text-4xl font-black text-white mb-2'>Reserve Place</h2>
                                <p className='text-slate-400 font-bold text-sm mb-12 uppercase tracking-widest'>Select your preferred dates</p>
                                
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-8 mb-12'>
                                    <div className='space-y-3'>
                                        <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Check-In</label>
                                        <input type="date" min={minDate} className='w-full h-16 rounded-[20px] border-2 border-white/10 bg-white/5 text-white px-6 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] transition-all' onChange={(e)=>setCheckIn(e.target.value)} value={checkIn} autoComplete="off" />
                                    </div>
                                    <div className='space-y-3'>
                                        <label className='text-[10px] font-black uppercase text-[#00B4D8] tracking-widest ml-1'>Check-Out</label>
                                        <input type="date" min={minDate} className='w-full h-16 rounded-[20px] border-2 border-white/10 bg-white/5 text-white px-6 font-bold outline-none focus:bg-white/10 focus:border-[#8B5CF6] transition-all' onChange={(e)=>setCheckOut(e.target.value)} value={checkOut} autoComplete="off" />
                                    </div>
                                </div>
                                <button className='w-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white py-6 rounded-[28px] border-b-[4px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[4px] transition-all font-black text-xl hover:shadow-[0_10px_30px_rgba(139,92,246,0.4)]' onClick={onConfirmBooking}>Proceed to Payment</button>
                            </div>

                            <div className='w-full md:w-[400px] bg-slate-900/60 p-12 flex flex-col text-white border-l border-white/5'>
                                <div className='flex gap-5 items-center mb-12 bg-white/5 p-5 rounded-[30px] border border-white/10'>
                                    <div className='w-20 h-20 rounded-2xl overflow-hidden shadow-2xl'><img className='w-full h-full object-cover' src={cardDetails.images?.[0]} alt="Property" /></div>
                                    <div>
                                        <h2 className='font-black text-sm uppercase text-white leading-tight mb-1'>{cardDetails.title}</h2>
                                        <p className='text-[#8B5CF6] text-[9px] font-black uppercase tracking-[2px]'>{cardDetails.category}</p>
                                    </div>
                                </div>
                                
                                <div className='space-y-5'>
                                    <div className='flex justify-between items-center text-slate-400'>
                                        <span className='text-xs font-bold uppercase tracking-widest'>{night} Nights Stay</span>
                                        <span className='font-black text-white'>Rs.{cardDetails.rent * (night || 0)}</span>
                                    </div>
                                    <div className='flex justify-between items-center text-slate-400'>
                                        <span className='text-xs font-bold uppercase tracking-widest'>VenuSpark Fee (7%)</span>
                                        <span className='font-black text-white'>Rs.{Math.round((cardDetails.rent * (night || 0)) * 0.07)}</span>
                                    </div>
                                    <div className='flex justify-between items-center text-slate-400'>
                                        <span className='text-xs font-bold uppercase tracking-widest'>Legal Taxes (7%)</span>
                                        <span className='font-black text-white'>Rs.{Math.round((cardDetails.rent * (night || 0)) * 0.07)}</span>
                                    </div>
                                    
                                    <div className='h-[1px] bg-white/10 my-8 shadow-[0_0_20px_rgba(255,255,255,0.05)]'></div>
                                    
                                    <div className='flex justify-between items-end'>
                                        <div className='flex flex-col'>
                                            <span className='text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest mb-1'>Total Amount</span>
                                            <span className='text-4xl font-black text-white'>Rs.{total}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className='mt-auto pt-10 flex items-center gap-3 opacity-40'>
                                    <FaShieldAlt size={16}/>
                                    <p className='text-[8px] font-black uppercase tracking-[3px]'>End-to-End Encrypted</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default ViewCard;