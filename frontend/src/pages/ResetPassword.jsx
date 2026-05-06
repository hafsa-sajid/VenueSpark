import React, { useContext, useState } from 'react';
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import { authDataContext } from '../Context/AuthContext';
import axios from 'axios';
import toast from 'react-hot-toast';
import log from '../assets/log.png'

function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const { serverUrl } = useContext(authDataContext);
  
  const email = location.state?.email || "";
  const otp = location.state?.otp || "";
  
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [show, setShow] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  if (!email || !otp) {
      toast.error("Invalid session. Restart reset flow.");
      navigate("/forgot-password");
      return null;
  }

  const handleResetPassword = async (e) => {
    e.preventDefault();
    if(newPassword.length < 6) {
        toast.error("Password must be at least 6 characters long");
        return;
    }
    if(newPassword !== confirmPassword) {
        toast.error("Passwords do not match");
        return;
    }
    
    setLoading(true);
    try {
      const result = await axios.post(
        `${serverUrl}/api/auth/reset-password`,
        { email, otp, newPassword },
        { withCredentials: true }
      );
      setLoading(false);
      if (result.status === 200) {
        toast.success("Password reset successfully! Please login.", { style: { height: "50px", width: "300px" } });
        navigate("/login");
      }
    } catch (error) {
      setLoading(false);
      console.log(error);
      if (error.response && error.response.data.message) {
        toast.error(error.response.data.message, { style: { height: "50px", width: "300px" } });
      } else {
        toast.error("An unknown error occurred.", { style: { height: "50px", width: "300px" } });
      }
    }
  };

  return (
    <div className='min-h-screen w-full flex bg-transparent transition-colors duration-500 overflow-hidden relative'>
      {/* Dynamic Brand Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/15 rounded-full blur-[140px]"></div>
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/15 rounded-full blur-[140px]"></div>
      </div>

      {/* Side Branding Panel - Visible only on Desktop */}
      <div className='hidden lg:flex w-1/2 relative flex-col items-center justify-center p-12 bg-transparent border-r border-white/5 shadow-2xl'>
          <div className='absolute inset-0 bg-[url("https://www.transparenttextures.com/patterns/cubes.png")] opacity-[0.05]'></div>
          
          <div className='relative z-10 flex flex-col items-center text-center animate-pop-3d'>
              <div className='w-40 h-40 md:w-48 md:h-48 rounded-[60px] bg-white p-[6px] bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] shadow-[0_40px_100px_rgba(139,92,246,0.4)] mb-10 group hover:rotate-6 transition-transform duration-700'>
                  <div className='w-full h-full bg-white rounded-[54px] flex items-center justify-center overflow-hidden shadow-inner'>
                      <img src={log} alt="Logo" className='w-[80%] h-[80%] object-contain group-hover:scale-110 transition-transform duration-700' />
                  </div>
              </div>
              <h2 className='text-5xl md:text-6xl font-black text-white mb-8 tracking-tighter leading-tight'>
                  Venue<span className='text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8]'>Spark</span>
              </h2>
              <p className='text-slate-400 text-xl font-medium max-w-md leading-relaxed'>
                  Almost there. Create a new strong password to secure your account and regain full control.
              </p>
          </div>
          
          <div className='absolute bottom-12 text-slate-500 text-[10px] font-black uppercase tracking-[6px]'>
              © 2026 VenueSpark Management
          </div>
      </div>

      {/* Form Section */}
      <div className='w-full lg:w-1/2 flex items-center justify-center relative p-6 bg-transparent transition-colors duration-500'>
          <div 
              className='w-12 h-12 bg-white/5 cursor-pointer absolute top-8 left-8 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 hover:bg-[#8B5CF6] hover:text-white transition-all z-50 group active:scale-90' 
              onClick={()=>navigate("/forgot-password")}
          >
              <FaArrowLeft className='w-5 h-5 text-slate-400 group-hover:text-white' />
          </div>
          
          <form className='glass-card max-w-[480px] w-full p-10 md:p-14 flex flex-col gap-8 relative' onSubmit={handleResetPassword}>
              <div className='w-full text-center'>
                <div className='lg:hidden flex justify-center mb-8'>
                   <div className='w-20 h-20 rounded-[28px] bg-white p-[3px] bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] shadow-xl'>
                      <div className='w-full h-full bg-white rounded-[25px] flex items-center justify-center overflow-hidden'>
                          <img src={log} alt="Logo" className='w-[85%] h-[85%] object-contain' />
                      </div>
                   </div>
                </div>
                <h1 className='text-4xl font-black text-white tracking-tighter leading-none'>New Password</h1>
                <p className='text-slate-500 text-sm font-medium mt-4 uppercase tracking-[2px]'>
                    Setup a new restricted password for your account.
                </p>
              </div>
      
              <div className='w-full space-y-6 mt-4'>
                  <div className='space-y-3 relative'>
                      <label className='text-[11px] font-black uppercase tracking-[3px] text-slate-300 ml-1'>New Password</label>
                      <div className="relative w-full">
                          <input 
                            type={show ? "text" : "password"} 
                            className='w-full h-16 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-[15px] font-bold focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-700 pr-16' 
                            onChange={(e) => setNewPassword(e.target.value)} 
                            value={newPassword} 
                            required 
                            placeholder='Min 6 characters'
                          />
                          <div className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-[#8B5CF6] p-2 flex items-center justify-center' onClick={()=>setShow(!show)}>
                              {show ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}
                          </div>
                      </div>
                  </div>

                  <div className='space-y-3 relative'>
                      <label className='text-[11px] font-black uppercase tracking-[3px] text-slate-300 ml-1'>Confirm Password</label>
                      <div className="relative w-full">
                          <input 
                            type={showConfirm ? "text" : "password"} 
                            className='w-full h-16 bg-white/5 border-2 border-white/5 rounded-2xl px-6 text-[15px] font-bold focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 transition-all text-white placeholder-slate-700 pr-16' 
                            onChange={(e) => setConfirmPassword(e.target.value)} 
                            value={confirmPassword} 
                            required 
                            placeholder='Repeat password'
                          />
                          <div className='absolute right-4 top-1/2 -translate-y-1/2 cursor-pointer text-slate-500 hover:text-[#8B5CF6] p-2 flex items-center justify-center' onClick={()=>setShowConfirm(!showConfirm)}>
                              {showConfirm ? <FaEyeSlash size={20}/> : <FaEye size={20}/>}
                          </div>
                      </div>
                  </div>
              </div>
              
              <button className='w-full h-20 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-black text-sm uppercase tracking-[5px] rounded-[30px] shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0.5 border-b-4 border-[#5B21B6] active:border-b-0 transition-all disabled:opacity-50 disabled:pointer-events-none' disabled={loading}>
                  {loading ? "Resetting..." : "Update Password"}
              </button>
          </form>
      </div>
    </div>
  )
}

export default ResetPassword
