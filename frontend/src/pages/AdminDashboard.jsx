import React, { useState, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import { authDataContext } from '../Context/AuthContext';
import { toast } from 'react-hot-toast';
import { FaReply, FaCheckCircle, FaExclamationCircle, FaUser, FaHistory } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import { SocketContext } from '../Context/SocketContext';
import Nav from '../Component/Nav';

const AdminDashboard = () => {
    const { serverUrl } = useContext(authDataContext);
    const [complaints, setComplaints] = useState([]);
    const [loading, setLoading] = useState(true);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState("");
    const [sending, setSending] = useState(false);

    const token = localStorage.getItem('token');

    const fetchComplaints = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/complaints/admin/all`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setComplaints(data);
        } catch (error) {
            toast.error("Failed to fetch complaints");
        } finally {
            setLoading(false);
        }
    };

    const { socket } = useContext(SocketContext);
    const { search } = useLocation();

    useEffect(() => {
        fetchComplaints();
    }, []);

    useEffect(() => {
        const urlParams = new URLSearchParams(search);
        const markId = urlParams.get('markResolved');
        if (markId) {
            const autoResolve = async () => {
                try {
                    const token = localStorage.getItem('token');
                    await axios.post(`${serverUrl}/api/complaints/reply/${markId}`, { reply: "Verified & Replied via Email. Please check your inbox." }, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    toast.success("Complaint marked as Replied!");
                    fetchComplaints();
                    // Clean URL
                    window.history.replaceState({}, document.title, "/admin/dashboard");
                } catch (err) {
                    console.error("Auto-resolve failed", err);
                }
            };
            autoResolve();
        }
    }, [search]);

    useEffect(() => {
        if (socket) {
            const handleNewComplaint = (notification) => {
                toast(`New feedback: ${notification.subject}`, { icon: '📩', duration: 4000 });
                fetchComplaints();
            };
            socket.on("adminNewComplaint", handleNewComplaint);
            return () => socket.off("adminNewComplaint", handleNewComplaint);
        }
    }, [socket]);

    const handleReply = async (id) => {
        if (!replyText.trim()) return toast.error("Reply cannot be empty");
        setSending(true);
        try {
            await axios.post(`${serverUrl}/api/complaints/reply/${id}`, { reply: replyText }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Reply sent! User notified via Email & Dashboard.");
            setReplyingTo(null);
            setReplyText("");
            fetchComplaints();
        } catch (error) {
            toast.error("Failed to send reply");
        } finally {
            setSending(false);
        }
    };

    if (loading) return (
        <div className='min-h-screen flex items-center justify-center bg-transparent'>
            <div className='w-12 h-12 border-4 border-[#00B4D8]/20 border-t-[#00B4D8] rounded-full animate-spin'></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-transparent py-24 px-4 font-sans relative">
            {/* Dynamic Brand Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#8B5CF6]/5 rounded-full blur-[140px]"></div>
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#00B4D8]/5 rounded-full blur-[140px]"></div>
            </div>
            <Nav />
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
                    <div>
                        <h1 className="text-4xl font-black text-white tracking-tight">Admin Dashboard</h1>
                        <p className="text-slate-300 font-bold uppercase tracking-[4px] text-xs mt-2">Hafsa's Communication System</p>
                    </div>
                    <div className="flex gap-4">
                        <div className="bg-white/10 px-6 py-3 rounded-2xl shadow-sm border border-white/20 flex items-center gap-3">
                            <span className="text-2xl font-black text-[#00B4D8]">{complaints.filter(c => c.status === 'Pending').length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Pending</span>
                        </div>
                        <div className="bg-white/10 px-6 py-3 rounded-2xl shadow-sm border border-white/20 flex items-center gap-3">
                            <span className="text-2xl font-black text-green-500">{complaints.filter(c => c.status === 'Resolved').length}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-300">Resolved</span>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {complaints.length === 0 ? (
                        <div className="glass-card p-20 text-center border-white/10">
                            <FaHistory size={60} className="mx-auto text-slate-400 mb-6" />
                            <p className="text-slate-400 font-bold text-xl">No complaints found in the system.</p>
                        </div>
                    ) : (
                        complaints.map((complaint) => (
                            <div key={complaint._id} className={`glass-card p-0 overflow-hidden shadow-[0px_20px_50px_rgba(0,0,0,0.2)] border-white/20 transition-all hover:shadow-[0_30px_60px_rgba(139,92,246,0.2)] border-l-[10px] ${complaint.status === 'Pending' ? 'border-l-[#00B4D8]' : 'border-l-green-500'}`}>
                                <div className="p-8 md:p-10">
                                    <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-white text-xl font-black">
                                                {complaint.user?.name?.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h3 className="font-black text-white text-xl leading-tight">{complaint.subject}</h3>
                                                <p className="text-slate-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 mt-1">
                                                    <FaUser size={10} /> {complaint.user?.name} ({complaint.user?.email})
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${complaint.status === 'Pending' ? 'bg-[#00B4D8]/10 text-[#00B4D8]' : 'bg-green-500/10 text-green-500'}`}>
                                            {complaint.status}
                                        </span>
                                    </div>

                                    <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 mb-8">
                                        <p className="text-white font-medium text-lg leading-relaxed">{complaint.message}</p>
                                        <div className="mt-6 flex items-center justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <span>Submitted {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}</span>
                                        </div>
                                    </div>

                                    {complaint.reply ? (
                                        <div className="border-t border-dashed border-white/20 pt-8 mt-2">
                                            <div className="flex items-center gap-3 mb-4">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white shadow-lg">
                                                    <FaCheckCircle size={14} />
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-green-500">Your Official Response</span>
                                            </div>
                                            <p className="text-white font-bold italic text-lg ml-11">"{complaint.reply}"</p>
                                        </div>
                                    ) : (
                                        <div className="mt-4">
                                            {replyingTo === complaint._id ? (
                                                <div className="space-y-4 animate-in slide-in-from-top-4">
                                                    <textarea 
                                                        className="w-full bg-white/5 border border-white/20 rounded-[25px] p-6 outline-none text-white font-medium text-lg resize-none shadow-inner focus:border-[#00B4D8]"
                                                        placeholder="Type your official response here..."
                                                        rows={4}
                                                        value={replyText}
                                                        onChange={(e) => setReplyText(e.target.value)}
                                                        autoFocus
                                                    />
                                                    <div className="flex gap-4 justify-end">
                                                        <button 
                                                            onClick={() => setReplyingTo(null)}
                                                            className="px-8 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button 
                                                            disabled={sending}
                                                            onClick={() => handleReply(complaint._id)}
                                                            className="px-10 py-3 bg-[#00B4D8] text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-lg shadow-[#00B4D8]/20 transition-all hover:-translate-y-1 active:translate-y-0"
                                                        >
                                                            {sending ? "Sending..." : "Submit Reply"}
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex gap-4">
                                                    <button 
                                                        onClick={() => setReplyingTo(complaint._id)}
                                                        className="flex items-center gap-3 px-8 py-4 bg-white/10 text-white border border-white/20 rounded-2xl font-black text-xs uppercase tracking-widest transition-all hover:bg-[#00B4D8] hover:-translate-y-1 shadow-xl hover:border-[#00B4D8]"
                                                    >
                                                        <FaReply /> Reply to User
                                                    </button>
                                                    <button 
                                                        onClick={async () => {
                                                            try {
                                                                const token = localStorage.getItem('token');
                                                                await axios.post(`${serverUrl}/api/complaints/reply/${complaint._id}`, { reply: "Replied via Admin Email. Please check your inbox." }, {
                                                                    headers: { Authorization: `Bearer ${token}` }
                                                                });
                                                                toast.success("Marked as Replied!");
                                                                fetchComplaints();
                                                            } catch (err) {
                                                                toast.error("Failed to update status");
                                                            }
                                                        }}
                                                        className="px-8 py-4 bg-green-500/10 border border-green-500/30 text-green-400 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-green-500/30 hover:text-green-300 transition-all shadow-sm"
                                                    >
                                                        Mark as Replied
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
