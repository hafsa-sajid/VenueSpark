import React, { useContext } from 'react'
import { FaArrowLeft, FaCompass } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { GiVillage } from "react-icons/gi";
import { FaTreeCity } from "react-icons/fa6";
import { MdOutlinePool } from "react-icons/md";
import { MdBedroomParent } from "react-icons/md";
import { BiBuildingHouse } from "react-icons/bi";
import { IoBedOutline } from "react-icons/io5";
import { GiWoodCabin } from "react-icons/gi";
import { MdStoreMallDirectory } from "react-icons/md";
import { listingDataContext } from '../Context/ListingContext';

function ListingPage2() {
    let navigate = useNavigate()
    let {category,setCategory} = useContext(listingDataContext)

    const categories = [
      { id: 'villa', label: 'Villa', icon: <GiVillage className='w-10 h-10' /> },
      { id: 'farmHouse', label: 'Farm House', icon: <FaTreeCity className='w-10 h-10' /> },
      { id: 'poolHouse', label: 'Pool House', icon: <MdOutlinePool className='w-10 h-10' /> },
      { id: 'rooms', label: 'Rooms', icon: <MdBedroomParent className='w-10 h-10' /> },
      { id: 'flat', label: 'Flat', icon: <BiBuildingHouse className='w-10 h-10' /> },
      { id: 'pg', label: 'PG', icon: <IoBedOutline className='w-10 h-10' /> },
      { id: 'cabin', label: 'Cabins', icon: <GiWoodCabin className='w-10 h-10' /> },
      { id: 'shops', label: 'Shops', icon: <MdStoreMallDirectory className='w-10 h-10' /> },
    ];

  return (
    <div className='min-h-screen w-full bg-transparent flex items-center justify-center relative py-12 px-4 transition-colors duration-500 overflow-x-hidden'>
        {/* Brand Gradients */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-[#8B5CF6]/5 rounded-full blur-[130px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-[#00B4D8]/5 rounded-full blur-[130px]"></div>
        </div>

        <div 
          className='w-12 h-12 bg-white/10 text-slate-300 cursor-pointer fixed top-6 left-6 rounded-2xl flex items-center justify-center shadow-xl border border-white/20 hover:bg-[#8B5CF6] hover:text-white transition-all z-50 group active:scale-90' 
          onClick={() => navigate("/listingpage1")}
        >
          <FaArrowLeft className='w-5 h-5 group-hover:scale-110 transition-transform' />
        </div>

        <div className='max-w-[850px] w-full glass-card p-8 md:p-16 border border-white/20 flex flex-col gap-12 relative animate-pop-3d'>
          
          <div className='w-full border-b border-white/10 pb-10 flex flex-col md:flex-row md:items-end justify-between gap-6'>
              <div className='space-y-3'>
                <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 rounded-full text-[#8B5CF6]'>
                    <FaCompass size={14}/>
                    <span className='text-[10px] font-black uppercase tracking-[3px]'>Classification</span>
                </div>
                <h1 className='text-4xl md:text-5xl font-black text-white tracking-tighter'>Choose Category</h1>
                <p className='text-slate-300 text-sm font-medium'>Which one best describes your legendary property?</p>
              </div>
              <div className='flex flex-col items-end gap-3'>
                  <div className='flex gap-1.5'>
                      <div className='w-10 h-2 rounded-full bg-[#8B5CF6] opacity-40'></div>
                      <div className='w-10 h-2 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8] shadow-[0_0_15px_rgba(0,180,216,0.4)]'></div>
                      <div className='w-10 h-2 rounded-full bg-white/10'></div>
                  </div>
                  <span className='text-[10px] font-black text-[#00B4D8] uppercase tracking-widest'>Stage 02: Niche Selection</span>
              </div>
          </div>

          <div className='w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-2'>
             {categories.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => setCategory(item.id)}
                  className={`h-40 flex flex-col items-center justify-center cursor-pointer border-2 rounded-[35px] transition-all duration-500 relative overflow-hidden group
                  ${category === item.id 
                    ? "border-[#8B5CF6] bg-[#8B5CF6]/10 shadow-[0_20px_40px_rgba(139,92,246,0.2)] scale-[1.03]" 
                    : "border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/10"}`}
                >
                  <div className={`mb-4 transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 ${category === item.id ? 'text-[#8B5CF6]' : 'text-slate-400'}`}>{item.icon}</div>
                  <h3 className={`font-black text-[10px] uppercase tracking-[2px] text-center px-2 ${category === item.id ? 'text-[#8B5CF6]' : 'text-slate-500'}`}>{item.label}</h3>   
                  
                  {category === item.id && (
                      <div className='absolute top-4 right-4 w-2 h-2 rounded-full bg-[#8B5CF6] shadow-[0_0_10px_#8B5CF6] animate-pulse'></div>
                  )}
                </div>
             ))}
          </div>

          <div className='pt-10 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-8'>
             <div className='flex flex-col gap-1'>
                 <span className='text-[10px] font-black uppercase tracking-widest text-slate-400'>Current Selection</span>
                 <p className='text-lg font-black text-[#8B5CF6] uppercase tracking-[2px]'>{category ? category : 'Required*'}</p>
             </div>
             <button 
                className='w-full sm:w-auto px-16 h-18 py-5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-black text-sm uppercase tracking-[5px] rounded-[30px] shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0.5 transition-all flex items-center justify-center gap-4 group disabled:opacity-50 disabled:pointer-events-none'
                onClick={() => navigate("/listingpage3")} 
                disabled={!category}
             >
                Proceed to Verification
                <FaArrowLeft className='rotate-180 group-hover:translate-x-2 transition-transform'/>
             </button>
          </div>
        </div>
    </div>
  )
}

export default ListingPage2


