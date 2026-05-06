import React from 'react'
import { useContext } from 'react';
import { FaArrowLeft, FaHome, FaInfoCircle, FaImage, FaWallet, FaMapMarkerAlt } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { listingDataContext } from '../Context/ListingContext';
import AddressAutocomplete from '../components/AddressAutocomplete';

function ListingPage1() {
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
      latitude, setLatitude,
      longitude, setLongitude} = useContext(listingDataContext)

      const handleImage1 = (e)=>{
        let file = e.target.files[0]
        if(file) {
            setBackEndImage1(file)
            setFrontEndImage1(URL.createObjectURL(file))
        }
      }
      const handleImage2 = (e)=>{
        let file = e.target.files[0]
        if(file) {
            setBackEndImage2(file)
            setFrontEndImage2(URL.createObjectURL(file))
        }
      }
      const handleImage3 = (e)=>{
        let file = e.target.files[0]
        if(file) {
            setBackEndImage3(file)
            setFrontEndImage3(URL.createObjectURL(file))
        }
      }
      
  return (
    <div className='min-h-screen w-full bg-transparent flex items-center justify-center relative py-12 px-4 transition-colors duration-500 overflow-x-hidden'>
      {/* Dynamic Brand Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-15%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
          <div className="absolute top-[20%] right-[-5%] w-[30%] h-[30%] bg-[#8B5CF6]/5 rounded-full blur-[100px]"></div>
      </div>

      <div 
        className='w-12 h-12 bg-white/10 text-slate-300 cursor-pointer fixed top-6 left-6 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 hover:bg-[#8B5CF6] hover:text-white transition-all z-50 group active:scale-90' 
        onClick={() => navigate("/")}
      >
        <FaArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform' />
      </div>

       <form className='max-w-[850px] w-full glass-card p-8 md:p-16 border border-white/20 flex flex-col gap-12 relative animate-pop-3d' onSubmit={(e)=>{e.preventDefault(); navigate("/listingpage2");}}>
        
        <div className='w-full flex flex-col md:flex-row md:items-end justify-between gap-6 pb-10 border-b border-white/10'>
            <div className='space-y-3'>
              <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 rounded-full text-[#8B5CF6]'>
                  <FaHome size={14}/>
                  <span className='text-[10px] font-black uppercase tracking-[3px]'>Listing Console</span>
              </div>
              <h1 className='text-4xl md:text-5xl font-black text-white tracking-tighter'>Setup Your Home</h1>
              <p className='text-slate-300 text-sm font-medium'>Capture the essence of your legendary space</p>
            </div>
            
            <div className='flex flex-col items-end gap-3'>
                <div className='flex gap-1.5'>
                    <div className='w-10 h-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#A78BFA] shadow-[0_0_15px_rgba(139,92,246,0.4)]'></div>
                    <div className='w-10 h-2 rounded-full bg-white/10'></div>
                    <div className='w-10 h-2 rounded-full bg-white/10'></div>
                </div>
                <span className='text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest'>Stage 01: The Basics</span>
            </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            {/* Title Section */}
            <div className='w-full space-y-4'>
                <label htmlFor="title" className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1 flex items-center gap-2'>
                    <FaInfoCircle className='text-[#8B5CF6]'/> Property Title
                </label>
                <div className='relative group'>
                    <input 
                        type="text" 
                        id='title' 
                        className='w-full h-16 bg-white/5 border border-white/20 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-500 font-bold' 
                        required 
                        onChange={(e)=>setTitle(e.target.value.toUpperCase())} 
                        value={title} 
                        placeholder='E.G. THE GLASS MANSION' 
                    />
                </div>
            </div>

            {/* Rent Section */}
            <div className='w-full space-y-4'>
                <label htmlFor="rent" className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1 flex items-center gap-2'>
                    <FaWallet className='text-[#00B4D8]'/> Daily Rent (Rs)
                </label>
                <input 
                    type="number" 
                    id='rent' 
                    className='w-full h-16 bg-white/5 border border-white/20 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#00B4D8] focus:bg-white/10 transition-all text-white placeholder-slate-500 font-bold' 
                    required 
                    onChange={(e)=>setRent(e.target.value)} 
                    value={rent} 
                    placeholder='Rate per night' 
                />
            </div>
        </div>
                    
        {/* Description Section */}
        <div className='w-full space-y-4'>
            <label htmlFor="des" className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1'>Deep Dive Description</label>
            <textarea 
                id="des" 
                className='w-full h-40 pt-6 bg-white/5 border border-white/20 rounded-[30px] text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-500 resize-none font-medium' 
                required 
                onChange={(e)=>setDescription(e.target.value)} 
                value={description} 
                placeholder='Tell the world why your place is legendary...'
            />
        </div>

        {/* Image Upload Section */}
        <div className='w-full space-y-6'>
            <label className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1 flex items-center gap-2'>
                <FaImage className='text-[#8B5CF6]'/> High-Res Visuals (3 Required)
            </label>
            <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
                {[
                    { handler: handleImage1, preview: frontEndImage1, label: 'Hero Shot' },
                    { handler: handleImage2, preview: frontEndImage2, label: 'Living Space' },
                    { handler: handleImage3, preview: frontEndImage3, label: 'Amenities' }
                ].map((img, idx) => (
                    <div key={idx} className={`relative group h-40 bg-white/5 border border-dashed ${img.preview ? 'border-[#8B5CF6]' : 'border-white/20'} rounded-[35px] flex flex-col items-center justify-center overflow-hidden transition-all hover:border-[#8B5CF6] hover:scale-[1.02] cursor-pointer`}>
                        {img.preview ? (
                            <img src={img.preview} alt="Preview" className='w-full h-full object-cover transition-transform duration-700 group-hover:scale-110' />
                        ) : (
                            <div className='text-center space-y-2'>
                                <div className='w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center mx-auto text-slate-400 group-hover:text-[#8B5CF6] transition-colors'>
                                    <FaImage size={24}/>
                                </div>
                                <span className='text-[9px] font-black uppercase tracking-widest text-slate-400'>{img.label}</span>
                            </div>
                        )}
                        <input 
                            type="file" 
                            className='absolute inset-0 opacity-0 cursor-pointer z-20' 
                            required={!img.preview} 
                            onChange={img.handler} 
                            accept="image/*" 
                        />
                        <div className='absolute inset-0 bg-slate-900/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-4 z-10 pointer-events-none'>
                             <span className='text-[10px] font-black uppercase tracking-[2px]'>{img.preview ? 'Update' : 'Upload'}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
        
        {/* Location Section */}
        <div className='grid grid-cols-1 md:grid-cols-2 gap-10'>
            <div className='w-full space-y-4'>
                <label htmlFor="city" className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1'>City & Country</label>
                <input 
                    type="text" 
                    id='city' 
                    className='w-full h-16 bg-white/5 border border-white/20 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-500 font-bold' 
                    required 
                    onChange={(e)=>setCity(e.target.value)} 
                    value={city} 
                    placeholder='E.G. ISLAMABAD, PAKISTAN'
                />
            </div>
            <div className='w-full space-y-4'>
                <label htmlFor="landmark" className='text-[11px] font-black uppercase tracking-[2px] text-slate-400 ml-1 flex items-center gap-2'>
                    <FaMapMarkerAlt className='text-[#8B5CF6]'/> Precise Address / Landmark
                </label>
                <AddressAutocomplete 
                  value={landmark} 
                  onChange={setLandMark} 
                  onSelect={(details) => {
                    setLandMark(details.address);
                    setLatitude(details.lat);
                    setLongitude(details.lon);
                  }} 
                  className='w-full h-16 bg-white/5 border border-white/20 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-500 font-bold'
                />
            </div>
        </div>

        <div className='pt-10'>
            <button className='w-full h-18 py-6 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-black text-sm uppercase tracking-[5px] rounded-[30px] shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-3 group'>
                Proceed to Classification
                <FaArrowLeft className='rotate-180 group-hover:translate-x-2 transition-transform'/>
            </button>
        </div>

        </form> 
    </div>
  )
}

export default ListingPage1