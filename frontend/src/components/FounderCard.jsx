import React from 'react';
import { FaLinkedin, FaInstagram, FaEnvelope, FaPaperPlane } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

const FounderCard = () => {
    const navigate = useNavigate();

    return (
        <div className="w-full mt-16 group">
            <div className="glass-card border border-white/20 border-l-[4px] border-l-[#00B4D8] rounded-2xl p-8 flex flex-col md:flex-row items-center gap-8 transition-all hover:shadow-[0_20px_60px_-15px_rgba(0,180,216,0.25)] relative overflow-hidden">
                {/* Decorative Element */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#00B4D8]/5 rounded-bl-full -mr-8 -mt-8 transition-transform group-hover:scale-110"></div>
                
                {/* Image Placeholder with rich aesthetics */}
                <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-[#00B4D8] via-[#0077B6] to-[#03045E] flex items-center justify-center text-white text-5xl font-black shrink-0 shadow-2xl rotate-3 transition-transform group-hover:rotate-0">
                    HS
                </div>

                <div className="flex-1 text-center md:text-left z-10">
                    <div className="flex flex-col md:flex-row md:items-center gap-2 mb-2">
                        <h3 className="text-3xl font-black text-white tracking-tight">Hafsa Sajid</h3>
                        <span className="inline-flex px-3 py-1 bg-[#00B4D8]/10 text-[#00B4D8] text-[10px] font-black uppercase tracking-widest rounded-full self-center">Founder & CEO</span>
                    </div>
                    <p className="text-slate-300 font-medium text-lg leading-relaxed max-w-2xl mb-6">
                        "Welcome to VenueSpark! Our mission is to transform how people discover and book premium venues. If you have any feedback or concerns, I'm personally here to ensure your experience is flawless."
                    </p>
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                        <button 
                            onClick={() => navigate('/my-complaints')}
                            className="flex items-center gap-3 px-8 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-black text-sm transition-all hover:bg-[#00B4D8] hover:border-[#00B4D8] hover:-translate-y-1 shadow-lg hover:shadow-[#00B4D8]/30"
                        >
                            <FaPaperPlane /> Contact Founder
                        </button>
                        
                        <div className="flex items-center gap-4 ml-2">
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#00B4D8]/10 hover:border-[#00B4D8]/30 hover:text-[#00B4D8] transition-all"><FaLinkedin size={18} /></a>
                            <a href="#" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#00B4D8]/10 hover:border-[#00B4D8]/30 hover:text-[#00B4D8] transition-all"><FaInstagram size={18} /></a>
                            <a href="mailto:sajidhafsa073@gmail.com" className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-300 hover:bg-[#00B4D8]/10 hover:border-[#00B4D8]/30 hover:text-[#00B4D8] transition-all"><FaEnvelope size={18} /></a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FounderCard;
