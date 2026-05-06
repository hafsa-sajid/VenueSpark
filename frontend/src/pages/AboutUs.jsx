import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaRocket, FaHeart, FaUsers, FaShieldAlt, FaStar, FaGlobe, FaArrowLeft, FaCheckCircle, FaLightbulb, FaGem } from 'react-icons/fa';

const AboutUs = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-transparent font-sans text-slate-100 overflow-x-hidden selection:bg-[#8B5CF6] selection:text-white transition-colors duration-500">
            
            {/* Minimal Header / Back Button */}
            <div className="fixed top-0 left-0 w-full z-50 p-6 flex justify-between items-center pointer-events-none">
                <button 
                    onClick={() => navigate('/')}
                    className="pointer-events-auto flex items-center gap-2 px-6 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-full text-sm font-black text-slate-300 hover:text-white transition-all active:scale-95"
                >
                    <FaArrowLeft /> Back to Home
                </button>
            </div>

            {/* Premium Hero Section */}
            <section className="relative min-h-[90vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden">
                {/* Decorative Background Elements */}
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-gradient-to-br from-[#8B5CF6]/10 to-transparent rounded-full blur-[120px] dark:opacity-20"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-gradient-to-tl from-[#00B4D8]/10 to-transparent rounded-full blur-[120px] dark:opacity-20"></div>
                
                <div className="max-w-5xl relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8] rounded-full shadow-[0_0_20px_rgba(139,92,246,0.4)] mb-12 animate-pulse group">
                        <FaGem className="text-white text-sm animate-bounce" />
                        <span className="text-[11px] font-black uppercase tracking-[4px] text-white">Official Team Introduction</span>
                    </div>
                    
                    <h1 className="text-6xl md:text-8xl font-black tracking-tight text-white mb-10 leading-[0.95]">
                        The Spark Behind <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#7C3AED] to-[#00B4D8]">Every Celebration.</span>
                    </h1>
                    
                    <p className="text-xl md:text-2xl text-slate-300 font-medium leading-relaxed max-w-3xl mx-auto mb-16">
                        VenueSpark was founded with a singular vision: to bridge the gap between dream events and the perfect spaces. We believe that every moment deserves a legendary stage.
                    </p>

                    <div className="flex flex-wrap justify-center gap-6">
                        <div 
                            onClick={() => document.getElementById('purpose')?.scrollIntoView({ behavior: 'smooth' })}
                            className="cursor-pointer px-8 py-4 bg-[#8B5CF6] text-white rounded-3xl font-black text-sm uppercase tracking-widest shadow-2xl shadow-purple-500/20 hover:-translate-y-1 transition-transform"
                        >
                            Our Purpose
                        </div>
                        <div 
                            onClick={() => document.getElementById('team')?.scrollIntoView({ behavior: 'smooth' })}
                            className="cursor-pointer px-8 py-4 bg-white/10 border border-white/20 text-slate-300 rounded-3xl font-black text-sm uppercase tracking-widest shadow-lg hover:text-white hover:bg-white/20 hover:-translate-y-1 transition-all"
                        >
                            Team Management
                        </div>
                    </div>
                </div>
            </section>

            {/* Modern Purpose Grid */}
            <section id="purpose" className="py-32 px-4 max-w-7xl mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
                    <div>
                        <span className="text-[#8B5CF6] font-black uppercase tracking-widest text-xs mb-4 block">Core Values</span>
                        <h2 className="text-4xl md:text-5xl font-black text-white mb-8 leading-tight">Driven by Integrity, <br />Powered by Innovation.</h2>
                        <p className="text-slate-300 text-lg font-medium leading-relaxed mb-10">
                            At VenueSpark, we don't just list venues; we vet them. Our management team ensures that every host is verified and every space meets our high standards of quality and aesthetics.
                        </p>
                        
                        <div className="space-y-6">
                            {[
                                { title: "Seamless Discovery", desc: "Intuitive search and filters to find your match instantly." },
                                { title: "Verified Trust", desc: "Every venue and host undergoes a professional verification process." },
                                { title: "Management Support", desc: "Our team is always there to mediate and support your journey." }
                            ].map((feat, i) => (
                                <div key={i} className="flex gap-4">
                                    <FaCheckCircle className="text-green-500 text-xl shrink-0 mt-1" />
                                    <div>
                                        <h4 className="font-black text-white text-lg">{feat.title}</h4>
                                        <p className="text-slate-300 font-medium">{feat.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-[#8B5CF6] to-[#00B4D8] rounded-[60px] blur-2xl opacity-10"></div>
                        <div className="relative glass-card border-white/20 p-4 rounded-[60px]">
                            <img 
                                src="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?q=80&w=2069&auto=format&fit=crop" 
                                alt="Event" 
                                className="w-full h-[600px] object-cover rounded-[50px] contrast-[1.1]"
                            />
                            <div className="absolute bottom-12 left-12 right-12 bg-slate-900/80 backdrop-blur-xl p-8 rounded-[35px] border border-white/10 shadow-2xl">
                                <p className="text-white font-black text-xl leading-tight">
                                    "Making event planning as joyful as the event itself."
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CEO / Management Section */}
            <section id="team" className="py-40 bg-transparent relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 text-center">
                    <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-[#8B5CF6] mx-auto mb-10 shadow-2xl shadow-[#8B5CF6]/20">
                        <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Hafsa" alt="CEO" className="w-full h-full object-cover bg-slate-800" />
                    </div>
                    
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-12 max-w-4xl mx-auto leading-[1.1]">
                        "Our team works around the clock to ensure your memories are hosted in perfection."
                    </h2>
                    
                    <p className="text-slate-400 text-xl font-medium leading-relaxed max-w-3xl mx-auto mb-16">
                        VenueSpark Team Management is committed to professional excellence. We understand that behind every booking, there is a dream, a celebration, or a milestone. Our platform is built on the foundation of trust and accessibility. We invite you to explore, book, and celebrate with confidence.
                    </p>

                    <div className="flex flex-col items-center">
                        <span className="text-white font-black text-3xl tracking-wide mb-2">Hafsa Sajid</span>
                        <span className="text-[#8B5CF6] font-bold uppercase tracking-[5px] text-[10px]">Founder & CEO, VenueSpark Management</span>
                        <div className="w-12 h-1.5 bg-[#8B5CF6] mt-6 rounded-full"></div>
                    </div>
                </div>
            </section>

            {/* Philosophy Section */}
            <section className="py-32 px-4 bg-transparent">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24">
                        <h2 className="text-4xl font-black mb-4 text-white">The VenueSpark Philosophy</h2>
                        <p className="text-slate-300 font-medium">Built on three core pillars of management</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        {[
                            { 
                                icon: <FaLightbulb />, 
                                title: "Visionary Tech", 
                                desc: "Using advanced algorithms to match users with their ideal venues based on style, budget, and location.",
                                theme: "from-indigo-50 to-white dark:from-slate-900 dark:to-slate-950 border-indigo-100 dark:border-slate-800 text-indigo-600 shadow-indigo-100 dark:shadow-black/20"
                            },
                            { 
                                icon: <FaUsers />, 
                                title: "Human Centric", 
                                desc: "Our support team is real people, ready to help you navigate your booking journey with empathy.",
                                theme: "from-purple-50 to-white dark:from-slate-900 dark:to-slate-950 border-purple-100 dark:border-slate-800 text-purple-600 shadow-purple-100 dark:shadow-black/20"
                            },
                            { 
                                icon: <FaShieldAlt />, 
                                title: "Bulletproof Security", 
                                desc: "Integrated payment protection and verified host policies to keep your investments safe.",
                                theme: "from-cyan-50 to-white dark:from-slate-900 dark:to-slate-950 border-cyan-100 dark:border-slate-800 text-cyan-600 shadow-cyan-100 dark:shadow-black/20"
                            }
                        ].map((item, i) => (
                            <div key={i} className={`group glass-card p-10 rounded-[50px] transition-all border border-white/10 hover:border-white/30`}>
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-3xl mb-8 bg-white/10 shadow-md border border-white/20`}>
                                    <span className={item.theme.split('text-')[1].split(' ')[0]}>{item.icon}</span>
                                </div>
                                <h3 className="text-2xl font-black mb-4 text-white">{item.title}</h3>
                                <p className="text-slate-300 font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final Footer */}
            <footer className="py-20 border-t border-white/10 text-center bg-transparent">
                <div className="max-w-4xl mx-auto px-4">
                    <h3 className="text-3xl font-black mb-4 text-white">VenueSpark Management</h3>
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px] mb-8">Official Platform Purpose & Intro</p>
                    <div className="flex justify-center gap-6 text-slate-400 text-sm font-medium">
                        <span>teamvenuesparkofficial@gmail.com</span>
                        <span>•</span>
                        <span>Available 24/7</span>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default AboutUs;
