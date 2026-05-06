import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { SocketContext } from '../Context/SocketContext';
import { toast } from 'react-hot-toast';
import { FaUserShield, FaExclamationCircle, FaCheckCircle, FaPaperPlane, FaTrash, FaInbox, FaHistory, FaArrowLeft } from 'react-icons/fa';
import { RxCross1 } from 'react-icons/rx';
import { formatDistanceToNow } from 'date-fns';
import { useLocation } from 'react-router-dom';
import { userDataContext } from '../Context/UserContext';

const MyComplaints = () => {
    const { serverUrl } = useContext(authDataContext);
    const { userData } = useContext(userDataContext);
    const { socket } = useContext(SocketContext);
    const location = useLocation();
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);

    const [showForm, setShowForm] = useState(false);
    const [subject, setSubject] = useState("");
    const [message, setMessage] = useState("");
    const [sending, setSending] = useState(false);

    // Admin Reply States
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const isAdmin = userData?.name === "Hafsa Sajid";

    const token = localStorage.getItem('token');

    const fetchMyComplaints = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/complaints/my-complaints?t=${new Date().getTime()}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(data);
        } catch (error) {
            toast.error("Failed to load your complaints");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMyComplaints();
    }, []);

    // Handle Admin auto-marking from Email Link
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const markId = urlParams.get('markReplied');
        if (markId && token) {
            const autoMark = async () => {
                try {
                    await axios.post(`${serverUrl}/api/complaints/reply/${markId}`, 
                        { reply: "Replied via Admin Email. Please check your inbox." }, 
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    toast.success("Complaint marked as Replied!");
                    fetchMyComplaints();
                    // Clean the URL
                    window.history.replaceState({}, document.title, "/my-complaints");
                } catch (err) {
                    console.error("Auto-mark failed", err);
                }
            };
            autoMark();
        }
    }, [location.search, token]);

    // Handle Admin opening specific reply form from Email Link
    useEffect(() => {
        const urlParams = new URLSearchParams(location.search);
        const replyId = urlParams.get('replyingTo');
        if (replyId && isAdmin) {
            setReplyingTo(replyId);
            // Clean the URL
            window.history.replaceState({}, document.title, "/my-complaints");
        }
    }, [location.search, isAdmin]);

    useEffect(() => {
        if (socket) {
            const handleComplaintUpdate = (notification) => {
                if (notification.type === 'ComplaintReply') {
                    toast('New Reply from VenueSpark Team!', {
                        icon: '📢',
                        style: {
                          borderRadius: '20px',
                          background: '#8B5CF6',
                          color: '#fff',
                          fontWeight: 'black',
                          textTransform: 'uppercase',
                          fontSize: '10px',
                          letterSpacing: '1px'
                        },
                        duration: 6000,
                    });
                    if (notification.complaintId && notification.replyText) {
                        setComplaints(prev => prev.map(c => 
                            String(c._id) === String(notification.complaintId) ? { ...c, reply: notification.replyText, status: 'Replied' } : c
                        ));
                    }
                    // Reliably fetch the latest DB status
                    fetchMyComplaints();
                }
            };
            socket.on("newNotification", handleComplaintUpdate);
            
            // Add fallback polling just in case socket cross-tab misses the timing
            const autoRefresh = setInterval(() => {
                fetchMyComplaints();
            }, 3000);

            return () => {
                socket.off("newNotification", handleComplaintUpdate);
                clearInterval(autoRefresh);
            }
        } else {
            // Also poll if socket isn't ready
            const autoRefresh = setInterval(() => {
                fetchMyComplaints();
            }, 3000);
            return () => clearInterval(autoRefresh);
        }
    }, [socket]);

    const handleSubmitComplaint = async (e) => {
        e.preventDefault();
        if (!token) return toast.error("Please login to contact admin");

        setSending(true);
        try {
            await axios.post(`${serverUrl}/api/complaints/create`, { subject, message }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Message sent to VenueSpark Team!");
            setShowForm(false);
            setSubject("");
            setMessage("");
            fetchMyComplaints();
        } catch (error) {
            toast.error("Failed to send message.");
        } finally {
            setSending(false);
        }
    };

    const handleDeleteComplaint = (id) => {
        toast((t) => (
            <div className='p-2'>
                <p className="font-black text-slate-800 dark:text-white mb-4 text-sm uppercase tracking-tight">Delete this message permanently?</p>
                <div className="flex gap-4 justify-end mt-2">
                    <button 
                        onClick={() => toast.dismiss(t.id)} 
                        className="px-6 py-2 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                await axios.delete(`${serverUrl}/api/complaints/delete/${id}`, {
                                    headers: { Authorization: `Bearer ${token}` }
                                });
                                toast.success("Message deleted successfully");
                                setComplaints(prev => prev.filter(c => c._id !== id));
                            } catch (error) {
                                toast.error("Failed to delete message");
                            }
                        }}
                        className="px-6 py-2 bg-red-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-red-500/20"
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center', style: { borderRadius: '25px', background: '#fff', border: '2px solid #f1f5f9' } });
    };

    const handleReply = async (id) => {
        if (!replyText.trim()) return toast.error("Reply cannot be empty");
        setSending(true);
        try {
            await axios.post(`${serverUrl}/api/complaints/reply/${id}`, { reply: replyText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Reply sent successfully!");
            setReplyingTo(null);
            setReplyText("");
            fetchMyComplaints();
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center bg-transparent'>
            <div className='w-16 h-16 border-8 border-[#00B4D8]/20 border-t-[#00B4D8] rounded-full animate-spin'></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent py-24 px-4 transition-colors duration-500 overflow-x-hidden">
            {/* Brand Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
            </div>

            <div className="max-w-5xl mx-auto relative z-10">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between mb-16 gap-8 pb-10 border-b border-slate-200">
                    <div className='space-y-4'>
                        <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 rounded-full text-[#8B5CF6]'>
                            <FaUserShield size={14}/>
                            <span className='text-[10px] font-black uppercase tracking-[3px]'>Support Center</span>
                        </div>
                        <h1 className="text-5xl font-black text-white tracking-tighter leading-none">
                            Contact Admin
                        </h1>
                        <p className="text-slate-300 font-medium text-lg">Direct communication with VenueSpark Headquarters</p>
                    </div>
                    <button 
                        onClick={() => setShowForm(true)}
                        className="flex items-center gap-4 px-10 py-5 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-[25px] font-black text-sm uppercase tracking-[4px] shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:-translate-y-1 transition-all active:translate-y-0"
                    >
                        <FaPaperPlane /> New Message
                    </button>
                </div>

                <div className="grid grid-cols-1 gap-10">
                    {!Array.isArray(complaints) || complaints.length === 0 ? (
                        <div className="glass-card p-24 text-center animate-pop-3d">
                            <div className='w-24 h-24 bg-white/5 rounded-[30px] flex items-center justify-center mx-auto mb-8 text-slate-400'>
                                <FaInbox size={40} />
                            </div>
                            <p className="text-slate-400 font-black text-xl uppercase tracking-widest">Inbox is Empty</p>
                        </div>
                    ) : (
                        complaints.map((complaint) => (
                            <div key={complaint._id} className="glass-card overflow-hidden group hover:scale-[1.01] transition-all duration-500 animate-pop-3d">
                                <div className="p-10 md:p-14 flex flex-col md:flex-row gap-10 items-start">
                                    <div className={`w-16 h-16 rounded-[22px] flex items-center justify-center shrink-0 shadow-2xl ${(complaint.status === 'Pending' && !complaint.reply) ? 'bg-[#00B4D8] text-white rotate-3' : 'bg-[#8B5CF6] text-white -rotate-3'}`}>
                                        {(complaint.status === 'Pending' && !complaint.reply) ? <FaExclamationCircle size={28} /> : <FaCheckCircle size={28} />}
                                    </div>
                                    
                                    <div className="flex-1 min-w-0 space-y-8">
                                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                            <div className="space-y-2">
                                                <h3 className="text-3xl font-black text-white tracking-tighter break-words leading-tight">{complaint.subject}</h3>
                                                <div className='flex items-center gap-4'>
                                                    {isAdmin && complaint.user && (
                                                        <p className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest flex items-center gap-2">
                                                            <span className='w-1 h-1 rounded-full bg-[#8B5CF6]'></span>
                                                            {complaint.user.name} ({complaint.user.email})
                                                        </p>
                                                    )}
                                                    <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-2">
                                                        <FaHistory size={10}/>
                                                        {complaint.createdAt ? formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true }) : "recently"}
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {complaint.reply && !isAdmin && (
                                                    <span className="bg-[#8B5CF6] text-white text-[9px] font-black uppercase tracking-[3px] px-4 py-2 rounded-full animate-pulse shadow-xl shadow-[#8B5CF6]/30">Email Received</span>
                                                )}
                                                <button 
                                                    onClick={() => handleDeleteComplaint(complaint._id)}
                                                    className="w-12 h-12 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/30 transition-all flex items-center justify-center active:scale-90"
                                                    title="Remove"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-white/5 border border-white/10 rounded-[35px] p-8 md:p-10 shadow-inner">
                                            <p className="text-white font-bold text-lg leading-relaxed break-words whitespace-pre-wrap">{complaint.message}</p>
                                        </div>

                                        {(complaint.status?.toLowerCase() === 'resolved' || complaint.status?.toLowerCase() === 'replied' || complaint.status?.toLowerCase() === 'processing' || (complaint.status !== 'Pending' && complaint.status) || complaint.reply) ? (
                                            <div className="space-y-8 animate-in slide-in-from-bottom-6 duration-700">
                                                <div className='h-[1px] bg-slate-100 w-full'></div>
                                                
                                                {complaint.reply && (
                                                    <div className="relative pl-12 border-l-4 border-[#00B4D8]">
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-white font-black text-xs ring-4 ring-white/5">
                                                                VS
                                                            </div>
                                                            <div className='flex flex-col'>
                                                                <span className="text-[10px] font-black uppercase tracking-[3px] text-white">
                                                                    Official Response
                                                                </span>
                                                                <span className='text-[9px] font-bold text-[#00B4D8] uppercase tracking-widest'>Hafsa Sajid • Admin</span>
                                                            </div>
                                                        </div>
                                                        <div className="bg-white/5 border border-white/10 rounded-[35px] p-8 relative">
                                                            <p className="text-[#00B4D8] font-black text-xl leading-relaxed italic break-words whitespace-pre-wrap">"{complaint.reply}"</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="flex flex-col gap-6 pt-4">
                                                <div className="flex items-center gap-3 text-[#00B4D8]">
                                                    <div className="w-2.5 h-2.5 rounded-full bg-[#00B4D8] animate-ping"></div>
                                                    <span className="text-[10px] font-black uppercase tracking-[4px] italic">Awaiting Response...</span>
                                                </div>

                                                {isAdmin && replyingTo !== complaint._id && (
                                                    <button 
                                                        onClick={() => setReplyingTo(complaint._id)}
                                                        className="w-full h-16 bg-slate-900 text-white rounded-[25px] font-black text-xs uppercase tracking-[5px] hover:bg-[#8B5CF6] transition-all shadow-xl"
                                                    >
                                                        Compose Reply
                                                    </button>
                                                )}

                                                {isAdmin && replyingTo === complaint._id && (
                                                    <div className="space-y-6 animate-in slide-in-from-top-6">
                                                        <textarea 
                                                            className="w-full bg-white/5 border-2 border-white/20 rounded-[35px] p-8 outline-none text-white font-bold text-lg resize-none shadow-2xl focus:scale-[1.01] transition-transform placeholder-slate-500"
                                                            placeholder="Enter your official reply..."
                                                            rows={4}
                                                            value={replyText}
                                                            onChange={(e) => setReplyText(e.target.value)}
                                                        />
                                                        <div className="flex gap-4">
                                                            <button 
                                                                onClick={() => handleReply(complaint._id)}
                                                                disabled={sending}
                                                                className="flex-1 h-18 py-5 bg-[#8B5CF6] text-white rounded-[25px] font-black text-[10px] uppercase tracking-[4px] shadow-2xl disabled:opacity-50"
                                                            >
                                                                {sending ? "Transmitting..." : "Deliver Reply"}
                                                            </button>
                                                            <button 
                                                                onClick={() => setReplyingTo(null)}
                                                                className="px-10 h-18 py-5 bg-white/10 text-slate-300 rounded-[25px] font-black text-[10px] uppercase tracking-[4px] hover:bg-white/20 transition-all border border-white/10"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
                
                <div className="mt-24 text-center">
                    <button 
                        onClick={() => window.history.back()}
                        className="inline-flex items-center gap-4 px-12 py-5 bg-white/10 text-white rounded-[30px] font-black text-[10px] uppercase tracking-[5px] transition-all hover:bg-white/20 shadow-2xl border border-white/20"
                    >
                        <FaArrowLeft size={12}/> Return Home
                    </button>
                </div>
            </div>

            {/* Complaint Form Modal */}
            {showForm && (
                <div className="fixed inset-0 z-[500] flex items-center justify-center bg-slate-900/90 backdrop-blur-2xl p-6 overflow-y-auto">
                    <div className="glass-card w-full max-w-2xl overflow-hidden shadow-[0_50px_150px_rgba(0,0,0,0.6)] relative animate-in zoom-in-95 duration-500">
                        <button 
                            onClick={() => setShowForm(false)}
                            className="absolute top-10 right-10 w-14 h-14 flex items-center justify-center rounded-[20px] bg-white/10 border border-white/20 text-white hover:bg-red-500/20 hover:text-red-400 transition-all"
                        >
                            <RxCross1 size={22} />
                        </button>

                        <div className="p-12 md:p-20 pt-24">
                            <div className="mb-12 space-y-3">
                                <div className='inline-flex items-center gap-2 px-4 py-1.5 bg-[#8B5CF6]/10 rounded-full text-[#00B4D8] mb-2 border border-[#00B4D8]/20'>
                                    <FaInbox size={12}/>
                                    <span className='text-[10px] font-black uppercase tracking-[3px]'>Secure Message</span>
                                </div>
                                <h3 className="text-4xl font-black text-white tracking-tighter leading-none">New Message</h3>
                                <p className="text-slate-300 font-medium text-lg">Send your concern to the VenueSpark Admin Team</p>
                            </div>

                            <form onSubmit={handleSubmitComplaint} className="space-y-8">
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[5px] ml-4">Subject</label>
                                    <input 
                                        type="text" 
                                        required
                                        value={subject}
                                        onChange={(e) => setSubject(e.target.value)}
                                        placeholder="WHAT IS THIS REGARDING?"
                                        className="w-full h-18 bg-white/5 border border-white/20 rounded-[25px] px-8 font-black text-white outline-none focus:border-[#00B4D8] transition-all placeholder-slate-500"
                                    />
                                </div>
                                <div className="space-y-4">
                                    <label className="text-[10px] font-black uppercase text-slate-400 tracking-[5px] ml-4">Detailed Message</label>
                                    <textarea 
                                        required
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="DESCRIBE YOUR CONCERN IN DETAIL..."
                                        rows={6}
                                        className="w-full bg-white/5 border border-white/20 rounded-[35px] p-8 font-medium text-white outline-none focus:border-[#00B4D8] transition-all resize-none shadow-inner placeholder-slate-500"
                                    />
                                </div>
                                <button 
                                    type="submit"
                                    disabled={sending}
                                    className="w-full h-20 bg-gradient-to-r from-[#8B5CF6] to-[#6366F1] text-white rounded-[30px] font-black text-sm uppercase tracking-[6px] transition-all shadow-[0_20px_50px_rgba(139,92,246,0.3)] hover:shadow-[0_25px_60px_rgba(139,92,246,0.5)] hover:-translate-y-1 active:translate-y-0.5 border-b-4 border-[#5B21B6] disabled:opacity-50"
                                >
                                    {sending ? "Transmitting..." : "Submit Message"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyComplaints;
