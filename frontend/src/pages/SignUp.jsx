import React, { useContext, useState } from 'react'
import { FaEye, FaEyeSlash, FaArrowLeft } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';
import { authDataContext } from '../Context/AuthContext';
import axios from 'axios';
import { userDataContext } from '../Context/UserContext';
import toast from 'react-hot-toast';
import log from '../assets/log.png'

function SignUp() {
  let [show,setShow] = useState(false)
  let navigate = useNavigate()
  let {serverUrl} = useContext(authDataContext)
  let {userData,setUserData} = useContext(userDataContext)
  let [name,setName] = useState("")
  let [email,setEmail] = useState("")
  let [password,setPassword] = useState("")
  // We use local loading state to avoid global conflicts, though auth context loading is fine
  let [loading,setLoading] = useState(false)

  const handleSignUp = async (e) => {
    e.preventDefault()
    if(password.length < 6) {
      toast.error("Password too short");
      return;
    }
    setLoading(true)
    try {
      let result = await axios.post(serverUrl + "/api/auth/signup",{
        name,
        email,
        password
      },{withCredentials:true})
      
      setLoading(false)
      if (result.status === 200 || result.status === 201) {
        toast.success("OTP sent to your email! Please verify.", { style: { height: "50px", width: "300px" } })
        navigate("/verify-otp", { state: { email } }) // Pass email to next page
      }
    } catch (error) {
      setLoading(false)
      console.log(error);
      if (error.response && error.response.data.message) {
            toast.error(error.response.data.message, { style: { height: "50px", width: "300px" } });
        } else {
            toast.error("An unknown error occurred.", { style: { height: "50px", width: "300px" } });
        }
    }
  }
  
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
                        Join a legendary community of hosts and travelers. Ignite your next event today.
                    </p>
                </div>
                
                <div className='absolute bottom-12 text-slate-500 text-[10px] font-black uppercase tracking-[6px]'>
                    Global Venue Network Infrastructure
                </div>
            </div>

            {/* SignUp Form Section */}
            <div className='w-full lg:w-1/2 flex items-center justify-center relative p-6 bg-transparent transition-colors duration-500'>
                <div 
                    className='w-12 h-12 bg-white/5 cursor-pointer absolute top-8 left-8 rounded-2xl flex items-center justify-center shadow-xl border border-white/10 hover:bg-[#8B5CF6] hover:text-white transition-all z-50 group active:scale-90' 
                    onClick={()=>navigate("/")}
                >
                    <FaArrowLeft className='w-5 h-5 text-slate-400 group-hover:text-white' />
                </div>
                
                <form className='glass-card max-w-[480px] w-full p-10 md:p-14 flex flex-col gap-6 relative' onSubmit={handleSignUp}>
                    <div className='w-full text-center'>
                      <div className='lg:hidden flex justify-center mb-8'>
                         <div className='w-20 h-20 rounded-[28px] bg-white p-[3px] bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] shadow-xl'>
                            <div className='w-full h-full bg-white rounded-[25px] flex items-center justify-center overflow-hidden'>
                                <img src={log} alt="Logo" className='w-[80%] h-[80%] object-contain' />
                            </div>
                         </div>
                      </div>
                      <h1 className='text-4xl font-black text-white tracking-tighter leading-none'>Get Started</h1>
                      <p className='text-slate-500 text-sm font-medium mt-4 uppercase tracking-[2px]'>Create your VenueSpark identity</p>
                    </div>
            
                    <div className='w-full space-y-3'>
                        <label htmlFor="name" className='text-[11px] font-black uppercase tracking-[3px] text-slate-300 ml-1'>Full Name</label>
                        <input type="text" id='name' className='w-full h-16 bg-white/5 border-2 border-white/5 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 text-white placeholder-slate-600 transition-all font-bold' onChange={(e)=>setName(e.target.value)} value={name} required placeholder='Your complete name' />
                    </div>

                    <div className='w-full space-y-3'>
                        <label htmlFor="email" className='text-[11px] font-black uppercase tracking-[3px] text-slate-300 ml-1'>Email</label>
                        <input type="email" id='email' className='w-full h-16 bg-white/5 border-2 border-white/5 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 text-white placeholder-slate-600 transition-all font-bold' onChange={(e)=>setEmail(e.target.value)} value={email} required placeholder="you@domain.com" />
                    </div>
                    
                    <div className='w-full space-y-3 relative'>
                        <label htmlFor="password" className='text-[11px] font-black uppercase tracking-[3px] text-slate-300 ml-1'>Password</label>
                        <div className="relative w-full">
                            <input 
                                type={show?"text":"password"} 
                                id='password' 
                                className='w-full h-16 bg-white/5 border-2 border-white/5 rounded-2xl text-[15px] px-6 focus:outline-none focus:border-[#8B5CF6] focus:bg-white/10 text-white placeholder-slate-600 pr-16 transition-all font-bold' 
                                onChange={(e)=>setPassword(e.target.value)} 
                                value={password}
                                required
                                placeholder="••••••••"
                            />
                            <div className='absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-[#8B5CF6] cursor-pointer transition-colors p-2 flex items-center justify-center' onClick={()=>setShow(prev=>!prev)}>
                                {show ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
                            </div>
                        </div>
                    </div>
                    
                    <div className='mt-4'>
                        <button className='w-full h-20 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white font-black text-sm uppercase tracking-[5px] rounded-[30px] shadow-[0_20px_50px_rgba(99,102,241,0.3)] hover:shadow-[0_25px_60px_rgba(99,102,241,0.5)] hover:-translate-y-1 active:translate-y-0.5 border-b-4 border-[#5B21B6] active:border-b-0 transition-all disabled:opacity-50 disabled:pointer-events-none' disabled={loading}>
                            {loading ? "Initializing..." : "Sign Up"}
                        </button>
                    </div>
                    
                    <p className='text-center text-sm font-bold text-slate-500 mt-4'>
                        Already have an account? <span className='text-[#8B5CF6] font-black cursor-pointer hover:underline uppercase tracking-widest text-xs' onClick={()=>navigate("/login")}>Login</span>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default SignUp

