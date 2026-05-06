import React, { useContext, useEffect, useState } from 'react'
import Nav from '../Component/Nav'
import { listingDataContext } from '../Context/ListingContext'
import { userDataContext } from '../Context/UserContext'
import { useTheme } from '../Context/ThemeContext'
import Card from '../Component/Card'

function Home() {
  const { theme } = useTheme();
  let { newListData, getListing } = useContext(listingDataContext);

  useEffect(() => {
    if (getListing) {
      getListing();
    }
  }, []);

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'bg-[#0A0F1D]' : 'bg-slate-50'} transition-colors duration-500`}>
      <Nav />
      <div className='w-[100vw] min-h-[77vh] flex items-center justify-center gap-[28px] pl-[10px] flex-wrap pt-[300px] md:pt-[240px] pb-12 px-[20px]'>
        {newListData && newListData.map((list, num) => (
            <Card 
              key={list._id || num} 
              title={list.title} 
              landMark={list.landmark} 
              city={list.city} 
              image1={list.images?.[0] || null} 
              rent={list.rent} 
              id={list._id}
              ratings={list.ratings} 
              isBooked={list.isBooked}
              host={list.host}
              bookingId={list.booking?._id || list.bookingId || null} 
            />
        ))}
        
        {newListData && newListData.length === 0 && (
          <div className={`flex flex-col items-center justify-center mt-20 px-12 py-16 rounded-[40px] border-2 transition-all duration-500 scale-105 shadow-2xl
            ${theme === 'dark' 
              ? 'bg-[#111827] border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.4)]' 
              : 'bg-white border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.08)]'}`}>
            <div className='text-6xl mb-6 animate-bounce'>🏡</div>
            <h3 className={`text-2xl font-black mb-2 tracking-tight ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>No properties found</h3>
            <p className={`text-sm font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Try adjusting your search filters to find your perfect stay.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Home;