import React, { useContext, useState } from 'react'
import { FaArrowLeft, FaCheckCircle, FaMapMarkerAlt, FaTag, FaWallet, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { listingDataContext } from '../Context/ListingContext';

function ListingPage3() {
    let navigate = useNavigate()
     let {title,setTitle,
           description,setDescription,
           frontEndImage1,setFrontEndImage1,
           frontEndImage2,setFrontEndImage2,
           frontEndImage3,setFrontEndImage3,
          backEndImage1,setBackEndImage1,
          backEndImage2,setBackEndImage2,
          backEndImage3,setBackEndImage3,
          rent,setRent,
          city,setCity,
          landmark,setLandMark,
          category,setCategory,handleAddListing,
          adding,setAdding
        } = useContext(listingDataContext)
    
    const [previewImage, setPreviewImage] = useState(null);
    
  return (
    <div className='min-h-screen w-full bg-transparent flex items-center justify-center relative py-12 px-4 transition-colors duration-500 overflow-x-hidden'>
        {/* Brand Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
            <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
        </div>
        
        <div 
          className='w-12 h-12 bg-white/10 text-slate-300 cursor-pointer fixed top-6 left-6 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 hover:bg-[#8B5CF6] hover:text-white transition-all z-50 group active:scale-90' 
          onClick={() => navigate("/listingpage2")}
        >
          <FaArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform' />
        </div>

        <div className='max-w-[1000px] w-full glass-card p-8 md:p-16 border border-white/20 flex flex-col gap-12 relative animate-pop-3d'>
            
            <div className='w-full border-b border-white/10 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
              <div className='space-y-3'>
                <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 rounded-full text-[#8B5CF6]'>
                    <FaCheckCircle size={14}/>
                    <span className='text-[10px] font-black uppercase tracking-[3px]'>Final Verification</span>
                </div>
                <h1 className='text-4xl md:text-5xl font-black text-white tracking-tighter'>Review Listing</h1>
                <p className='text-slate-300 text-sm font-medium'>One last check before your property goes live</p>
              </div>
              <div className='flex flex-col items-end gap-3'>
                  <div className='flex gap-1.5'>
                      <div className='w-10 h-2 rounded-full bg-[#8B5CF6] opacity-40'></div>
                      <div className='w-10 h-2 rounded-full bg-[#8B5CF6] opacity-60'></div>
                      <div className='w-10 h-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8] shadow-[0_0_15px_rgba(0,180,216,0.4)]'></div>
                  </div>
                  <span className='text-[10px] font-black text-[#00B4D8] uppercase tracking-widest'>Stage 03: Launch Ready</span>
              </div>
            </div>

            <div className='w-full space-y-2'>
                <div className='flex items-center gap-2 text-slate-400'>
                    <FaMapMarkerAlt size={14} className='text-[#00B4D8]'/>
                    <span className='text-[10px] font-black uppercase tracking-widest'>Located In</span>
                </div>
                <h1 className='text-3xl md:text-4xl font-black text-white leading-tight tracking-tight'>
                    {landmark ? landmark : 'No Landmark'}, <span className='text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8]'>{city ? city : 'Unknown City'}</span>
                </h1>
            </div>

            {/* Images Grid Layout */}
            <div className='w-full grid grid-cols-1 md:grid-cols-3 gap-6'>
                {/* Main Featured Image */}
                <div 
                    className='md:col-span-2 relative group overflow-hidden rounded-[45px] border-2 border-white/10 shadow-xl cursor-zoom-in'
                    onClick={() => setPreviewImage(frontEndImage1)}
                >
                    <img 
                        src={frontEndImage1} 
                        alt="Primary" 
                        className='w-full aspect-[4/3] md:aspect-auto md:h-[500px] object-cover transition-transform duration-[1.5s] group-hover:scale-110' 
                    />
                    <div className='absolute bottom-8 left-8 px-5 py-2.5 bg-slate-900/80 border border-white/10 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-[3px] text-[#00B4D8] shadow-xl'>Master Shot</div>
                </div>

                {/* Secondary Images Column */}
                <div className='hidden md:flex flex-col gap-6'>
                    <div 
                        className='h-[238px] relative group overflow-hidden rounded-[35px] border-2 border-white/10 shadow-lg cursor-zoom-in'
                        onClick={() => setPreviewImage(frontEndImage2)}
                    >
                        <img 
                            src={frontEndImage2} 
                            alt="Interior 1" 
                            className='w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125' 
                        />
                    </div>
                    <div 
                        className='h-[238px] relative group overflow-hidden rounded-[35px] border-2 border-white/10 shadow-lg cursor-zoom-in'
                        onClick={() => setPreviewImage(frontEndImage3)}
                    >
                        <img 
                            src={frontEndImage3} 
                            alt="Interior 2" 
                            className='w-full h-full object-cover transition-transform duration-[1.5s] group-hover:scale-125' 
                        />
                    </div>
                </div>
            </div>

            {/* Information Card */}
            <div className='w-full grid grid-cols-1 lg:grid-cols-3 gap-10 items-start'>
                <div className='lg:col-span-2 space-y-8'>
                    <div className='flex items-center gap-3'>
                        <div className='px-5 py-2.5 bg-[#8B5CF6]/10 rounded-2xl border border-[#8B5CF6]/20 flex items-center gap-3 shadow-sm'>
                            <FaTag className='text-[#8B5CF6]' size={12}/>
                            <span className='text-[10px] font-black uppercase tracking-[3px] text-[#8B5CF6]'>{category ? category : 'General'}</span>
                        </div>
                    </div>
                    <h2 className='text-4xl font-black text-white tracking-tighter leading-none'>
                        {title ? title : 'Untitled Masterpiece'}
                    </h2>
                    <p className='text-slate-300 text-lg font-medium leading-relaxed max-w-2xl'>
                        {description ? description : 'No description provided.'}
                    </p>
                </div>

                <div className='bg-white/5 p-6 rounded-[35px] border border-white/10 flex flex-col justify-center items-center text-center shadow-xl lg:mt-0 mt-6 min-h-[200px]'>
                    <div className='space-y-2'>
                        <div className='flex items-center justify-center gap-2 text-slate-400 mb-1'>
                            <FaWallet size={12}/>
                            <span className='text-[9px] font-black uppercase tracking-[3px]'>Daily Investment</span>
                        </div>
                        <div className='text-3xl font-black text-white tracking-tighter'>
                            Rs. {rent ? rent : '0'}
                        </div>
                        <p className='text-[9px] font-black text-[#8B5CF6] uppercase tracking-widest'>Secure Payment Guaranteed</p>
                    </div>
                    
                    <button 
                        className='w-full h-14 mt-6 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-black text-[10px] uppercase tracking-[3px] rounded-[20px] shadow-[0_15px_40px_rgba(99,102,241,0.3)] hover:shadow-[0_20px_50px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center disabled:opacity-50 disabled:pointer-events-none' 
                        onClick={handleAddListing} 
                        disabled={adding}
                    >
                        {adding ? "Launching..." : "Launch Listing"}
                    </button>
                </div>
            </div>

            <p className='text-center text-[10px] font-black uppercase tracking-[6px] text-slate-300 mt-6'>
                VenueSpark Official Registration
            </p>

        </div>

    {/* Fullscreen Image Preview Modal */}
    {previewImage && (
        <div 
            className='fixed inset-0 z-[1000] bg-slate-900/95 backdrop-blur-2xl flex items-center justify-center p-4 md:p-16 animate-in fade-in duration-300'
            onClick={() => setPreviewImage(null)}
        >
            <button 
                className='absolute top-8 right-8 w-14 h-14 bg-white/10 hover:bg-white/20 text-white rounded-2xl flex items-center justify-center transition-all hover:rotate-90 duration-500 border border-white/10'
                onClick={() => setPreviewImage(null)}
            >
                <FaTimes size={24}/>
            </button>
            <img 
                src={previewImage} 
                alt="Fullscreen Preview" 
                className='max-w-full max-h-full object-contain rounded-3xl shadow-[0_50px_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 duration-500' 
            />
        </div>
    )}
    </div>
  )
}

export default ListingPage3