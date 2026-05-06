import React, { useContext, useState, useEffect, useRef } from 'react'
import log from '../assets/log.png'
import { useNavigate } from 'react-router-dom';
import { FaSearch, FaBell, FaTrash, FaUserCircle } from "react-icons/fa";
import { GiHamburgerMenu } from "react-icons/gi";
import { CgProfile } from "react-icons/cg";
import { MdWhatshot, MdOutlinePool, MdBedroomParent, MdStoreMallDirectory, MdLogout, MdDashboard } from "react-icons/md";
import { GiVillage, GiWoodCabin } from "react-icons/gi";
import { FaTreeCity } from "react-icons/fa6";
import { BiBuildingHouse } from "react-icons/bi";
import { IoBedOutline } from "react-icons/io5";
import { RxCross1 } from "react-icons/rx";
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { userDataContext } from '../Context/UserContext';
import toast from 'react-hot-toast';
import { listingDataContext } from '../Context/ListingContext';
import { SocketContext } from '../Context/SocketContext';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { useTheme } from '../Context/ThemeContext';
import { FaSun, FaMoon } from 'react-icons/fa';

function Nav() {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const isHomePage = location.pathname === "/";
  let [showpopup, setShowPopup] = useState(false)
  let [showNotifications, setShowNotifications] = useState(false)
  let { userData, setUserData } = useContext(userDataContext)
  let navigate = useNavigate()
  let { serverUrl } = useContext(authDataContext)  
  let { listingData, setNewListData, handleSearch, searchData, resetForm, handleViewCard, selectedCategory, setSelectedCategory } = useContext(listingDataContext)
  let [input, setInput] = useState("")
  const { socket } = useContext(SocketContext)
  const notifRef = useRef(null)

  // Close notification panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotifications(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Listen for real-time new notifications and add them to userData
  useEffect(() => {
    if (socket && userData) {
      const handleNewNotification = (notification) => {
        setUserData(prev => ({
          ...prev,
          notifications: [notification, ...(prev.notifications || [])]
        }));
        
        // Show a hot toast right there
        if (notification.type === 'ComplaintReply') {
           toast('VenueSpark Team replied!', { icon: '🛡️', style: { background: '#00B4D8', color: '#fff', fontWeight: 'bold' }});
        } else {
           toast(notification.message || 'New Notification', { icon: '🔔' });
        }
      };
      socket.on("newNotification", handleNewNotification);
      return () => socket.off("newNotification", handleNewNotification);
    }
  }, [socket, userData]);

  const handleLogOut = async () => {
    try {
      await axios.post(serverUrl + "/api/auth/logout", {}, { withCredentials: true })
      setUserData(null)
      localStorage.removeItem('token')
      toast.success("LogOut Successfully.")
    } catch (error) {
      toast.error(error.response?.data?.message || "LogOut Failed");
    }
  }

  const handleCategory = (category) => {
    setSelectedCategory(category)
    if (category === "trending" || category === "") {
      setNewListData(listingData)
    } else {
      const filtered = listingData.filter((list) => 
        list.category?.toLowerCase() === category.toLowerCase()
      );
      setNewListData(filtered);
    }
  }

  // Handle Search Fetching
  useEffect(() => {
    handleSearch(input)
  }, [input])

  // Unified data filtering (Search vs Category vs All)
  useEffect(() => {
    if (input.trim() !== "") {
      // If searching, show search results
      setNewListData(searchData)
    } else {
      // If no search, apply category filter if any
      if (selectedCategory && selectedCategory !== "trending") {
        const filtered = listingData.filter((list) => 
          list.category?.toLowerCase() === selectedCategory.toLowerCase()
        );
        setNewListData(filtered);
      } else {
        // Otherwise show all
        setNewListData(listingData)
      }
    }
  }, [input, searchData, listingData, selectedCategory]);

  const goToListingForm = () => {
    if (resetForm) resetForm();
    navigate("/listingpage1");
    setShowPopup(false);
  }

  // Calculate unread notifications
  const unreadCount = userData?.notifications?.filter(n => !n.isRead).length || 0;

  // Mark all notifications as read
  const handleOpenNotifications = async () => {
    setShowNotifications(prev => !prev);
    setShowPopup(false);

    if (!showNotifications && unreadCount > 0) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`${serverUrl}/api/user/mark-read-notifications`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Update local state
        setUserData(prev => ({
          ...prev,
          notifications: prev.notifications.map(n => ({ ...n, isRead: true }))
        }));
      } catch (err) {
        console.error("Failed to mark notifications as read", err);
      }
    }
  };

  const handleDeleteNotification = async (e, notificationId) => {
    e.stopPropagation();
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${serverUrl}/api/user/notifications/${notificationId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserData(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n._id !== notificationId)
      }));
      toast.success("Notification deleted");
    } catch (err) {
      toast.error("Failed to delete notification");
    }
  };

  // Get icon/color for notification type
  const getNotifStyle = (type) => {
    switch (type) {
      case 'COMMENT':
        return { bg: 'bg-violet-100', text: 'text-[#8B5CF6]', label: '💬 Comment' };
      case 'refund_request':
        return { bg: 'bg-orange-100', text: 'text-orange-600', label: '💸 Refund' };
      case 'cancellation_complete':
        return { bg: 'bg-green-100', text: 'text-green-600', label: '✅ Cancellation' };
      case 'ComplaintReply':
        return { bg: 'bg-[#00B4D8]/10', text: 'text-[#00B4D8]', label: '🛡️ Email Received' };
      default:
        return { bg: 'bg-slate-100', text: 'text-slate-600', label: '🔔 Alert' };
    }
  };

  return (
    <div className={`fixed top-0 z-20 w-full backdrop-blur-2xl transition-all duration-500 ${theme === 'dark' ? 'bg-[#0A0F1D]/90 border-b border-white/10 shadow-[0px_10px_40px_rgba(0,0,0,0.5)]' : 'bg-white/80 border-b border-slate-200/60 shadow-[0_4px_30px_rgba(0,0,0,0.03)]'}`}>
      <div className='w-[100vw] min-h-[85px] px-[20px] flex items-center justify-between md:px-[50px] '>
        <div className='cursor-pointer flex items-center justify-center pl-4' onClick={() => navigate("/")}>
          <div className='w-16 h-16 md:w-20 md:h-20 rounded-[22px] bg-white p-[3px] bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] shadow-xl shadow-purple-500/20 flex items-center justify-center transition-all hover:scale-105 active:scale-95'>
            <div className='w-full h-full bg-white rounded-[19px] flex items-center justify-center overflow-hidden'>
              <img src={log} alt="Logo" className='w-[90%] h-[90%] object-contain' />
            </div>
          </div>
        </div>
        
        {/* Desktop Search Bar */}
        <div className='w-[40%] relative hidden md:block'>
          <input 
            type="text" 
            className={`w-[100%] px-[25px] py-[12px] border-[1.5px] outline-none rounded-full text-[15px] transition-all duration-300 ${theme === 'dark' ? 'bg-white/10 border-white/10 text-white focus:border-[#8B5CF6] focus:bg-white/20 placeholder-slate-400' : 'bg-slate-50 border-slate-200/80 text-slate-800 focus:border-[#8B5CF6]/50 focus:bg-white focus:shadow-[0_0_20px_rgba(139,92,246,0.1)] placeholder-slate-400 shadow-inner'}`} 
            placeholder='Any Where | Any location | Any City' 
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className='absolute p-[11px] rounded-full bg-gradient-to-tr from-[#8B5CF6] via-[#9F67FF] to-[#00B4D8] right-[6px] top-[4px] shadow-[0_4px_15px_rgba(139,92,246,0.4)] border-b-[3px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[3px] transition-all hover:brightness-110'><FaSearch className='w-[16px] h-[16px] text-white' /></button>
        </div>

        <div className='flex items-center justify-center gap-[15px] relative'>
          {/* Theme Toggle Button */}
          <button 
            onClick={toggleTheme}
            className={`w-[44px] h-[44px] flex items-center justify-center rounded-full border-[1.5px] backdrop-blur-md transition-all overflow-hidden relative group ${theme === 'dark' ? 'border-white/20 bg-white/5 hover:shadow-[0px_4px_20px_rgba(139,92,246,0.2)] text-yellow-400' : 'border-slate-200 bg-white text-slate-600 hover:border-[#8B5CF6]/30 hover:shadow-[0_4px_15px_rgba(139,92,246,0.15)] hover:text-[#8B5CF6]'}`}
          >
            <div className={`transition-all duration-500 transform ${theme === 'dark' ? 'translate-y-0 opacity-100 scale-110' : 'translate-y-10 opacity-0'}`}>
              <FaSun className='w-[20px] h-[20px] drop-shadow-[0_0_8px_rgba(250,204,21,0.6)]' />
            </div>
            <div className={`absolute transition-all duration-500 transform ${theme === 'light' ? 'translate-y-0 opacity-100' : '-translate-y-10 opacity-0'}`}>
              <FaMoon className='w-[18px] h-[18px] text-[#8B5CF6] drop-shadow-[0_0_8px_rgba(139,92,246,0.6)]' />
            </div>
            <div className='absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/10 to-[#00B4D8]/10 opacity-0 group-hover:opacity-100 transition-opacity'></div>
          </button>

          <span className={`text-[13px] font-black cursor-pointer rounded-full transition-all px-5 py-2.5 tracking-widest uppercase border ${theme === 'dark' ? 'text-white border-transparent hover:text-[#00B4D8] hover:bg-white/10' : 'text-slate-600 border-transparent hover:text-[#8B5CF6] hover:bg-[#8B5CF6]/10 hover:border-[#8B5CF6]/20'}`} onClick={goToListingForm}> List your home </span>
          
          {/* Notification Bell */}
          {userData && (
            <div className='relative' ref={notifRef}>
              <button 
                className={`w-[42px] h-[42px] flex items-center justify-center rounded-full border-[1.5px] transition-all relative group ${theme === 'dark' ? 'border-white/10 bg-white/5 hover:shadow-[0px_4px_15px_rgba(139,92,246,0.15)]' : 'border-slate-200 bg-white hover:border-[#00B4D8]/30 hover:shadow-[0_4px_15px_rgba(0,180,216,0.15)]'}`}
                onClick={handleOpenNotifications}
              >
                <FaBell className={`w-[18px] h-[18px] transition-colors ${unreadCount > 0 ? (theme === 'dark' ? 'text-[#8B5CF6] animate-pulse' : 'text-[#00B4D8] animate-pulse') : (theme === 'dark' ? 'text-slate-400 group-hover:text-white' : 'text-slate-400 group-hover:text-[#00B4D8]')}`} />
                {unreadCount > 0 && (
                  <div className='absolute -top-1.5 -right-1 bg-red-500 text-white text-[9px] font-black min-w-[18px] h-[18px] px-1 rounded-full flex items-center justify-center border-2 border-[#0A0F1D] shadow-sm'>
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </div>
                )}
              </button>

              {/* Notification Panel Dropdown */}
              {showNotifications && (
                <div className={`w-[380px] max-h-[520px] absolute top-[125%] right-0 ${theme === 'dark' ? 'bg-[#111827] border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]' : 'bg-white border-slate-200 shadow-2xl'} backdrop-blur-xl z-50 rounded-[32px] overflow-hidden animate-in slide-in-from-top-4 duration-300`}>
                  {/* Header */}
                  <div className={`px-7 py-5 border-b ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'} flex items-center justify-between`}>
                    <div className='flex items-center gap-3'>
                      <h3 className={`text-[18px] font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Activity</h3>
                      {unreadCount > 0 && (
                        <span className='px-2.5 py-0.5 bg-[#8B5CF6] text-white text-[10px] font-black rounded-full uppercase tracking-widest animate-pulse'>New</span>
                      )}
                    </div>
                    <button onClick={() => setShowNotifications(false)} className={`w-8 h-8 flex items-center justify-center rounded-xl ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-slate-200 text-slate-600'} hover:bg-red-500 hover:text-white transition-all`}>
                      <RxCross1 size={16} />
                    </button>
                  </div>
 
                  {/* Notification List */}
                  <div className='overflow-y-auto max-h-[440px] custom-scrollbar p-2'>
                    {(!userData?.notifications || userData.notifications.length === 0) ? (
                      <div className='flex flex-col items-center justify-center py-16 px-6 opacity-60'>
                        <div className={`w-20 h-20 rounded-[30px] flex items-center justify-center mb-5 border ${theme === 'dark' ? 'bg-white/5 border-white/10' : 'bg-slate-100 border-slate-200'}`}>
                          <FaBell className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'} w-8 h-8`} />
                        </div>
                        <p className={`${theme === 'dark' ? 'text-slate-400' : 'text-slate-600'} font-black text-sm uppercase tracking-widest`}>Silence is Golden</p>
                        <p className='text-slate-500 text-[11px] mt-2'>No new updates for now</p>
                      </div>
                    ) : (
                      [...(userData.notifications || [])]
                        .sort((a, b) => new Date(b.date) - new Date(a.date))
                        .map((notif, i) => {
                          const style = getNotifStyle(notif.type);
                          return (
                            <div
                              key={notif._id || i}
                              className={`group px-5 py-5 mb-2 rounded-[24px] border-2 border-transparent ${theme === 'dark' ? 'hover:border-white/10 hover:bg-white/5' : 'hover:border-slate-100 hover:bg-slate-50'} cursor-pointer transition-all duration-300 relative overflow-hidden ${!notif.isRead ? (theme === 'dark' ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/20' : 'bg-violet-50/50 border-violet-100') : ''}`}
                              onClick={() => {
                                setShowNotifications(false);
                                if (notif.listingId && notif.type === 'COMMENT') {
                                  handleViewCard(notif.listingId);
                                } else if (notif.type === 'refund_request') {
                                  navigate('/mylisting');
                                } else if (notif.type === 'cancellation_complete') {
                                  navigate('/mybooking');
                                } else if (notif.type === 'ComplaintReply') {
                                  navigate('/my-complaints');
                                }
                              }}
                            >
                              <div className='flex items-start gap-4'>
                                <div className={`w-12 h-12 shrink-0 rounded-2xl ${style.bg} flex items-center justify-center text-xl shadow-inner relative z-10`}>
                                  {notif.type === 'COMMENT' ? '💬' : notif.type === 'refund_request' ? '💸' : notif.type === 'cancellation_complete' ? '✅' : notif.type === 'ComplaintReply' ? '🛡️' : '🔔'}
                                </div>
                                
                                <div className='flex-1 min-w-0 relative z-10'>
                                  <div className='flex items-center justify-between gap-2 mb-1'>
                                    <span className={`text-[9px] font-black uppercase tracking-[2px] ${style.text}`}>
                                      {style.label}
                                    </span>
                                    <span className={`text-[10px] font-bold ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                      {notif.date ? formatDistanceToNow(new Date(notif.date), { addSuffix: true }) : ''}
                                    </span>
                                  </div>
                                  
                                  {/* Animated Message Expansion on Hover */}
                                  <div className='relative overflow-hidden'>
                                    <p className={`text-[13px] font-black leading-snug line-clamp-2 group-hover:line-clamp-none transition-all duration-500 ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>
                                      {notif.message}
                                    </p>
                                    
                                    {/* Subtle gradient to indicate more text */}
                                    <div className={`absolute bottom-0 right-0 w-full h-4 ${theme === 'dark' ? 'bg-gradient-to-t from-slate-900/50' : 'bg-gradient-to-t from-white/50'} to-transparent group-hover:opacity-0 transition-opacity`}></div>
                                  </div>
                                </div>
                                
                                <button 
                                  onClick={(e) => handleDeleteNotification(e, notif._id)}
                                  className='w-8 h-8 shrink-0 flex items-center justify-center rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-red-500 shadow-sm transition-all opacity-0 group-hover:opacity-100 relative z-20'
                                  title="Remove"
                                >
                                  <FaTrash size={12} />
                                </button>
                              </div>
                              
                              {/* Bottom Glow line for unread */}
                              {!notif.isRead && (
                                <div className='absolute bottom-0 left-0 w-1 h-full bg-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.5)]'></div>
                              )}
                            </div>
                          );
                        })
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        

          <button className={`px-[18px] py-[10px] flex items-center justify-center gap-[12px] border-[1.5px] rounded-full backdrop-blur-md transition-all relative group overflow-hidden ${theme === 'dark' ? 'border-white/20 bg-white/5 hover:shadow-[0px_8px_25px_rgba(0,0,0,0.2)]' : 'border-slate-200 bg-white hover:shadow-[0_8px_20px_rgba(139,92,246,0.12)] hover:border-[#8B5CF6]/20'}`} onClick={() => { setShowPopup(prev => !prev); setShowNotifications(false); }}>
            <div className='absolute inset-0 bg-gradient-to-tr from-[#8B5CF6]/5 to-[#00B4D8]/5 opacity-0 group-hover:opacity-100 transition-opacity'></div>
            <GiHamburgerMenu className={`w-[18px] h-[18px] relative z-10 transition-colors ${theme === 'dark' ? 'text-white' : 'text-slate-600 group-hover:text-[#8B5CF6]'}`} />
            {userData == null ? (
               <CgProfile className={`w-[26px] h-[26px] relative z-10 ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`} />
            ) : (
               <div className='w-[34px] h-[34px] bg-gradient-to-tr from-[#8B5CF6] via-[#9F67FF] to-[#00B4D8] text-white rounded-full flex items-center justify-center text-[15px] font-black shadow-[0_2px_10px_rgba(139,92,246,0.3)] border border-white/20 relative z-10'>
                 {userData?.name.slice(0, 1).toUpperCase()}
               </div>
            )}
          </button>

          {showpopup && (
            <div className={`w-[320px] absolute ${theme === 'dark' ? 'bg-[#111827] border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.6)]' : 'bg-white border-slate-200 shadow-xl'} top-[125%] right-0 border-2 z-50 rounded-[35px] overflow-hidden animate-in fade-in zoom-in duration-300`}>
              <div className={`p-6 border-b ${theme === 'dark' ? 'border-white/10 bg-white/5' : 'border-slate-100 bg-slate-50'}`}>
                {userData ? (
                  <div className='flex items-center gap-4'>
                    <div className='w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] flex items-center justify-center text-white font-black shadow-lg text-xl'>
                      {userData.name.charAt(0).toUpperCase()}
                    </div>
                    <div className='flex flex-col'>
                      <span className={`text-[15px] font-black leading-none ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>{userData.name}</span>
                      <span className='text-[10px] text-slate-500 font-black uppercase tracking-[2px] mt-1.5'>Verified Guest</span>
                    </div>
                  </div>
                ) : (
                  <div className='flex flex-col gap-1'>
                    <h3 className={`text-lg font-black ${theme === 'dark' ? 'text-white' : 'text-slate-900'}`}>Welcome</h3>
                    <p className='text-xs font-black text-slate-400 uppercase tracking-[2px]'>Access your account</p>
                  </div>
                )}
              </div>

              <ul className='text-[14px] flex flex-col p-2.5'>
                {!userData ? (
                  <li className={`m-1 px-4 py-4 hover:bg-[#8B5CF6] hover:text-white ${theme === 'dark' ? 'text-white' : 'text-slate-900'} cursor-pointer font-black rounded-2xl transition-all flex items-center gap-4 group`} onClick={() => {navigate("/login"); setShowPopup(false)}}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-[#8B5CF6] transition-all shadow-sm ${theme === 'dark' ? 'bg-white/10 text-white' : 'bg-violet-100 text-violet-600'}`}><FaUserCircle size={20}/></div>
                    Login / Sign Up
                  </li>
                ) : (
                  <li className={`m-1 px-4 py-4 hover:bg-red-500 hover:text-white ${theme === 'dark' ? 'text-white' : 'text-slate-900'} cursor-pointer font-black rounded-2xl transition-all flex items-center gap-4 group`} onClick={() => {handleLogOut(); setShowPopup(false)}}>
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center group-hover:bg-white group-hover:text-red-500 transition-all shadow-sm ${theme === 'dark' ? 'bg-red-500/20 text-red-500' : 'bg-red-50 text-red-600'}`}><MdLogout size={20}/></div>
                    Log Out
                  </li>
                )}
                
                <div className={`h-[1px] my-3 mx-4 ${theme === 'dark' ? 'bg-white/10' : 'bg-slate-100'}`}></div>

                <li className={`m-1 px-4 py-3.5 hover:bg-[#2ECC71]/10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} hover:text-[#2ECC71] cursor-pointer font-black rounded-2xl transition-all flex items-center gap-4 group`} onClick={goToListingForm}>
                  <div className='w-9 h-9 rounded-xl bg-[#2ECC71]/10 flex items-center justify-center text-[#2ECC71] group-hover:bg-[#2ECC71] group-hover:text-white transition-all shadow-sm'><BiBuildingHouse size={20}/></div>
                  List Your Home
                </li>

                <li className={`m-1 px-4 py-3.5 hover:bg-[#00B4D8]/10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} hover:text-[#00B4D8] cursor-pointer font-black rounded-2xl transition-all flex items-center justify-between group`} onClick={() => {navigate("/mylisting"); setShowPopup(false)}}>
                  <div className='flex items-center gap-4'>
                    <div className='w-9 h-9 rounded-xl bg-[#00B4D8]/10 flex items-center justify-center text-[#00B4D8] group-hover:bg-[#00B4D8] group-hover:text-white transition-all shadow-sm'><MdDashboard size={20}/></div>
                    My Listing
                  </div>
                </li>

                <li className={`m-1 px-4 py-3.5 hover:bg-[#8B5CF6]/10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} hover:text-[#8B5CF6] cursor-pointer font-black rounded-2xl transition-all flex items-center justify-between group`} onClick={() => {navigate("/mybooking"); setShowPopup(false)}}>
                  <div className='flex items-center gap-4'>
                    <div className='w-9 h-9 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] group-hover:bg-[#8B5CF6] group-hover:text-white transition-all shadow-sm'><MdOutlinePool size={20}/></div>
                    My Booking
                  </div>
                </li>

                <li className={`m-1 px-4 py-3.5 hover:bg-orange-500/10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} hover:text-orange-600 cursor-pointer font-black rounded-2xl transition-all flex items-center justify-between group`} onClick={() => {navigate("/my-complaints"); setShowPopup(false)}}>
                  <div className='flex items-center gap-4'>
                    <div className='w-9 h-9 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 group-hover:bg-orange-500 group-hover:text-white transition-all shadow-sm'><FaBell size={18}/></div>
                    Contact Team
                  </div>
                </li>

                <li className={`m-1 px-4 py-3.5 hover:bg-pink-500/10 ${theme === 'dark' ? 'text-white' : 'text-slate-900'} hover:text-pink-600 cursor-pointer font-black rounded-2xl transition-all flex items-center gap-4 group`} onClick={() => {navigate("/about-us"); setShowPopup(false)}}>
                  <div className='w-9 h-9 rounded-xl bg-pink-500/10 flex items-center justify-center text-pink-500 group-hover:bg-pink-500 group-hover:text-white transition-all shadow-sm'><MdStoreMallDirectory size={20}/></div>
                  About VenueSpark
                </li>

                {userData?.name === "Hafsa Sajid" && (
                  <li className={`m-1 mt-3 px-5 py-4 ${theme === 'dark' ? 'bg-white/5 text-white hover:bg-white/10' : 'bg-slate-100 text-slate-900 hover:bg-slate-200'} cursor-pointer font-black rounded-[24px] transition-all flex items-center gap-4 group`} onClick={() => {navigate("/admin/dashboard"); setShowPopup(false)}}>
                    <div className='w-11 h-11 rounded-xl bg-gradient-to-tr from-[#00B4D8] to-[#8B5CF6] flex items-center justify-center text-white shadow-md group-hover:rotate-12 transition-transform'><MdDashboard size={22}/></div>
                    Admin Dashboard
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Bar */}
      <div className='w-[100%] h-[70px] flex items-center justify-center md:hidden bg-white'>
        <div className='w-[90%] relative '>
          <input 
            type="text" 
            className='w-[100%] px-[22px] py-[10px] bg-[#FAF5FF] border-[1.5px] border-[#EDE9FE] outline-none rounded-full text-[14px] focus:border-[#8B5CF6] focus:bg-white' 
            placeholder='Where do you want to go?' 
            onChange={(e) => setInput(e.target.value)} 
            value={input} 
          />
          <button className='absolute p-[9px] rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] right-[5px] top-[4px] shadow-[0_2px_8px_rgba(139,92,246,0.3)] border-b-[3px] border-[#5B21B6] active:border-b-[0px] active:translate-y-[3px] transition-all'><FaSearch className='w-[14px] h-[14px] text-white' /></button>
        </div>
      </div>

      {/* Category Icons */}
      <div className={`w-[100vw] min-h-[100px] backdrop-blur-2xl flex items-center justify-start cursor-pointer gap-[45px] overflow-x-auto no-scrollbar md:justify-center px-[25px] border-b pt-[20px] transition-all duration-500 ${theme === 'dark' ? 'bg-[#0A0F1D]/60 border-white/10' : 'bg-slate-50/80 border-slate-200/60'}`}>
        {[
          { id: 'trending', label: 'Trending', icon: <MdWhatshot />, color: 'from-[#FF4D4D] to-[#F9CB28]', glow: 'shadow-[0_0_20px_rgba(255,77,77,0.4)]' },
          { id: 'villa', label: 'Villa', icon: <GiVillage />, color: 'from-[#00B4D8] to-[#90E0EF]', glow: 'shadow-[0_0_20px_rgba(0,180,216,0.4)]' },
          { id: 'farmHouse', label: 'Farm House', icon: <FaTreeCity />, color: 'from-[#2ECC71] to-[#27AE60]', glow: 'shadow-[0_0_20px_rgba(46,204,113,0.4)]' },
          { id: 'poolHouse', label: 'Pool House', icon: <MdOutlinePool />, color: 'from-[#0077B6] to-[#00B4D8]', glow: 'shadow-[0_0_20px_rgba(0,119,182,0.4)]' },
          { id: 'rooms', label: 'Rooms', icon: <MdBedroomParent />, color: 'from-[#8B5CF6] to-[#C084FC]', glow: 'shadow-[0_0_20px_rgba(139,92,246,0.4)]' },
          { id: 'flat', label: 'Flat', icon: <BiBuildingHouse />, color: 'from-[#E67E22] to-[#F39C12]', glow: 'shadow-[0_0_20px_rgba(230,126,34,0.4)]' },
          { id: 'pg', label: 'PG', icon: <IoBedOutline />, color: 'from-[#34495E] to-[#2C3E50]', glow: 'shadow-[0_0_20px_rgba(52,73,94,0.4)]' },
          { id: 'cabin', label: 'Cabins', icon: <GiWoodCabin />, color: 'from-[#A0522D] to-[#8B4513]', glow: 'shadow-[0_0_20px_rgba(160,82,45,0.4)]' },
          { id: 'shops', label: 'Shops', icon: <MdStoreMallDirectory />, color: 'from-[#E91E63] to-[#F06292]', glow: 'shadow-[0_0_20px_rgba(233,30,99,0.4)]' },
        ].map((item) => (
          <div 
            key={item.id}
            className='flex flex-col items-center min-w-[85px] gap-3 pb-4 transition-all duration-300 relative group'
            onClick={() => handleCategory(item.id)}
          >
            <div className={`w-14 h-14 rounded-[22px] flex items-center justify-center text-2xl transition-all duration-500 relative overflow-hidden
              ${selectedCategory === item.id 
                ? `bg-gradient-to-br ${item.color} text-white ${theme === 'dark' ? item.glow : 'shadow-[0_8px_20px_rgba(0,0,0,0.15)] border border-white/40'} scale-110 z-10` 
                : `${theme === 'dark' ? 'bg-white/5 text-slate-400 group-hover:bg-white/10 group-hover:text-white' : 'bg-white border border-slate-100 text-slate-400 group-hover:border-[#8B5CF6]/30 group-hover:shadow-[0_4px_15px_rgba(139,92,246,0.1)] group-hover:text-[#8B5CF6]'} scale-100`
              }`}>
              {item.icon}
              {selectedCategory === item.id && <div className='absolute inset-0 bg-gradient-to-tr from-white/20 to-transparent'></div>}
            </div>
            
            <h3 className={`text-[11px] font-black uppercase tracking-[2px] whitespace-nowrap transition-all duration-300 ${selectedCategory === item.id ? (theme === 'dark' ? 'text-white scale-105' : 'text-slate-900 drop-shadow-sm scale-105') : (theme === 'dark' ? 'text-white opacity-70 group-hover:opacity-100 group-hover:scale-105' : 'text-slate-500 opacity-80 group-hover:opacity-100 group-hover:scale-105 group-hover:text-[#8B5CF6]')}`}>
              {item.label}
            </h3>

            {selectedCategory === item.id && (
              <div className={`absolute bottom-0 w-10 h-1 bg-gradient-to-r ${item.color} rounded-full ${theme === 'dark' ? item.glow : ''}`}></div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

export default Nav;