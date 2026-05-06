import React, { useState, useEffect, useContext, useRef } from 'react';
import axios from 'axios';
import { formatDistanceToNow } from 'date-fns';
import { authDataContext } from '../Context/AuthContext';
import { userDataContext } from '../Context/UserContext';
import { toast } from 'react-hot-toast';
import { FaReply, FaEdit, FaTrash, FaPaperPlane, FaQuoteLeft, FaHeart, FaTimes } from 'react-icons/fa';

const CommentSection = ({ listingId }) => {
    const { serverUrl } = useContext(authDataContext);
    const { userData } = useContext(userDataContext);
    const [comments, setComments] = useState([]);
    const [newComment, setNewComment] = useState("");
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyContent, setReplyContent] = useState("");
    const [loading, setLoading] = useState(true);

    // Edit/Delete states
    const [editingId, setEditingId] = useState(null);
    const [editContent, setEditContent] = useState("");

    // Mention/Tag states
    const [taggableUsers, setTaggableUsers] = useState([]);
    const [showMentionDropdown, setShowMentionDropdown] = useState(false);
    const [mentionSearch, setMentionSearch] = useState("");
    const [mentionTarget, setMentionTarget] = useState("main"); // "main" or comment._id for reply
    const [selectedMentions, setSelectedMentions] = useState([]); // [{_id, name}]
    const [replyMentions, setReplyMentions] = useState([]);
    const mainTextareaRef = useRef(null);
    const replyTextareaRef = useRef(null);

    const token = localStorage.getItem('token');

    const fetchComments = async () => {
        try {
            const { data } = await axios.get(`${serverUrl}/api/comments/${listingId}`);
            if (data.success) {
                setComments(data.comments);
            }
        } catch (error) {
            console.error("Failed to fetch comments", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTaggableUsers = async () => {
        if (!token) return;
        try {
            const { data } = await axios.get(`${serverUrl}/api/comments/taggable/${listingId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (data.success) {
                setTaggableUsers(data.users.filter(u => u._id !== userData?._id));
            }
        } catch (error) {
            console.error("Failed to fetch taggable users", error);
        }
    };

    useEffect(() => {
        if (listingId) {
            fetchComments();
            fetchTaggableUsers();
        }
    }, [listingId]);

    const handleTextChange = (value, isReply = false) => {
        if (isReply) {
            setReplyContent(value);
        } else {
            setNewComment(value);
        }

        const lastAtIndex = value.lastIndexOf('@');
        if (lastAtIndex !== -1) {
            const textAfterAt = value.substring(lastAtIndex + 1);
            if (!textAfterAt.includes(' ') && textAfterAt.length <= 20) {
                setMentionSearch(textAfterAt.toLowerCase());
                setShowMentionDropdown(true);
                setMentionTarget(isReply ? "reply" : "main");
                return;
            }
        }
        setShowMentionDropdown(false);
    };

    const handleSelectMention = (user) => {
        const isReply = mentionTarget === "reply";
        const currentText = isReply ? replyContent : newComment;
        const lastAtIndex = currentText.lastIndexOf('@');
        const newText = currentText.substring(0, lastAtIndex) + `@${user.name} `;

        if (isReply) {
            setReplyContent(newText);
            setReplyMentions(prev => {
                if (prev.find(m => m._id === user._id)) return prev;
                return [...prev, user];
            });
            setTimeout(() => replyTextareaRef.current?.focus(), 50);
        } else {
            setNewComment(newText);
            setSelectedMentions(prev => {
                if (prev.find(m => m._id === user._id)) return prev;
                return [...prev, user];
            });
            setTimeout(() => mainTextareaRef.current?.focus(), 50);
        }
        setShowMentionDropdown(false);
    };

    const filteredMentionUsers = taggableUsers.filter(u =>
        u.name.toLowerCase().includes(mentionSearch)
    );

    const handleAddComment = async (e, parentCommentId = null) => {
        e.preventDefault();
        const content = parentCommentId ? replyContent : newComment;
        const mentions = parentCommentId ? replyMentions : selectedMentions;

        if (!content.trim()) return toast.error("Comment cannot be empty.");

        try {
            const { data } = await axios.post(
                `${serverUrl}/api/comments`,
                {
                    listingId,
                    content,
                    parentCommentId,
                    mentionedUserIds: mentions.map(m => m._id)
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (data.success) {
                if (parentCommentId) {
                    setReplyingTo(null);
                    setReplyContent("");
                    setReplyMentions([]);
                    toast.success("Reply added!");
                } else {
                    setNewComment("");
                    setSelectedMentions([]);
                    toast.success("Comment added!");
                }
                fetchComments();
                fetchTaggableUsers();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to add comment.");
        }
    };

    const handleEditComment = async (commentId) => {
        if (!editContent.trim()) return toast.error("Comment cannot be empty.");
        try {
            const { data } = await axios.put(
                `${serverUrl}/api/comments/${commentId}`,
                { content: editContent },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                toast.success("Comment updated!");
                setEditingId(null);
                setEditContent("");
                fetchComments();
            }
        } catch (error) {
            toast.error(error.response?.data?.message || "Failed to edit comment.");
        }
    };

    const handleDeleteComment = (commentId) => {
        toast((t) => (
            <div className='flex flex-col gap-3 p-1'>
                <p className='text-sm font-bold text-slate-800'>Delete this comment permanently?</p>
                <div className='flex gap-2 justify-end'>
                    <button 
                        onClick={() => toast.dismiss(t.id)}
                        className='px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors'
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={async () => {
                            toast.dismiss(t.id);
                            try {
                                const { data } = await axios.delete(
                                    `${serverUrl}/api/comments/${commentId}`,
                                    { headers: { Authorization: `Bearer ${token}` } }
                                );
                                if (data.success) {
                                    toast.success("Comment deleted!");
                                    fetchComments();
                                }
                            } catch (error) {
                                toast.error(error.response?.data?.message || "Failed to delete.");
                            }
                        }}
                        className='px-3 py-1.5 text-xs font-bold text-white bg-red-500 rounded-lg shadow-sm active:scale-95 transition-transform'
                    >
                        Delete
                    </button>
                </div>
            </div>
        ), { duration: 5000, position: 'top-center', style: { borderRadius: '16px', padding: '12px', minWidth: '280px' } });
    };

    const handleToggleLike = async (commentId) => {
        if (!userData) return toast.error("Please login to like!");
        try {
            const { data } = await axios.post(
                `${serverUrl}/api/comments/like/${commentId}`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (data.success) {
                // Update local state immediately for fast feedback
                setComments(prev => prev.map(c => {
                    if (c._id === commentId) {
                        return { ...c, likes: data.likes };
                    }
                    // Check replies too
                    if (c.replies && c.replies.length > 0) {
                        const updatedReplies = c.replies.map(r => 
                            r._id === commentId ? { ...r, likes: data.likes } : r
                        );
                        return { ...c, replies: updatedReplies };
                    }
                    return c;
                }));
            }
        } catch (error) {
            console.error("Failed to toggle like", error);
        }
    };

    const renderContent = (text) => {
        if (!text) return text;
        const parts = text.split(/(@\w[\w\s]*?)(?=\s|$|@)/g);
        return parts.map((part, i) => {
            if (part.startsWith('@')) {
                return <span key={i} className='text-[#8B5CF6] font-black cursor-pointer hover:underline'>{part}</span>;
            }
            return <span key={i}>{part}</span>;
        });
    };

    if (loading) return <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin mx-auto"></div></div>;

    return (
        <div className="glass-card-container mt-20 max-w-4xl mx-auto">
            <div className="glass-card p-6 md:p-10 relative flex flex-col">
                
                {/* Header (Like Pic 1) */}
                <div className='flex items-center justify-between mb-8 pb-4 border-b border-white/10'>
                    <div className='flex items-center gap-4'>
                        <h3 className="text-2xl md:text-3xl font-medium text-white">Comments</h3>
                        <div className='w-10 h-10 rounded-full bg-gradient-to-tr from-[#8B5CF6] to-[#00B4D8] flex items-center justify-center text-white font-bold shadow-lg'>
                            {comments.length}
                        </div>
                    </div>
                    <button className='text-slate-400 hover:text-white transition-colors'>
                        <FaTimes size={20} />
                    </button>
                </div>

                {/* Comments List */}
                <div className="space-y-6 mb-10 overflow-y-auto max-h-[600px] pr-2 custom-scrollbar">
                    {comments.length === 0 && !loading && (
                        <div className='py-16 text-center'>
                            <p className="text-slate-400 font-bold text-xl">No reviews yet. Be the first to spark a conversation!</p>
                        </div>
                    )}
                    
                    {comments.map((comment) => {
                        const isLiked = comment.likes?.includes(userData?._id);
                        return (
                        <div key={comment._id} className="flex flex-col group border-b border-white/5 pb-6 last:border-0">
                            <div className="flex gap-4 md:gap-5 relative z-10">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-full bg-slate-800 border border-white/10 shadow-lg shrink-0 flex items-center justify-center overflow-hidden">
                                    <span className="text-xl font-bold text-white/80">{comment.author?.name?.charAt(0).toUpperCase()}</span>
                                </div>
                                
                                {/* Comment Body */}
                                <div className="flex-1">
                                    {/* Name & Time */}
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className='flex items-center gap-2'>
                                            <h4 className="font-bold text-white text-[15px]">{comment.author?.name}</h4>
                                            <span className="text-slate-500 text-[10px]">•</span>
                                            <span className="text-[13px] font-medium text-slate-400">
                                                {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content or Edit Form */}
                                    {editingId === comment._id ? (
                                        <div className='flex flex-col gap-3 mt-2'>
                                            <textarea
                                                className='w-full bg-white/5 border border-white/20 rounded-xl p-3 outline-none text-white font-medium text-sm resize-none'
                                                rows={3}
                                                value={editContent}
                                                onChange={(e) => setEditContent(e.target.value)}
                                                autoFocus
                                            />
                                            <div className='flex gap-3 justify-end'>
                                                <button onClick={() => { setEditingId(null); setEditContent(""); }} className='px-4 py-1.5 text-[11px] font-bold text-slate-400 hover:text-white transition-colors'>Cancel</button>
                                                <button onClick={() => handleEditComment(comment._id)} className='px-4 py-1.5 text-[11px] font-bold text-white bg-[#8B5CF6] rounded-lg'>Save</button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="text-slate-300 leading-relaxed font-normal text-[15px] whitespace-pre-line mb-3">
                                            {renderContent(comment.content)}
                                        </div>
                                    )}
                                    
                                    {/* Action Buttons (Reply / Like) */}
                                    <div className='flex items-center justify-between mt-2'>
                                        <div className='flex items-center gap-5'>
                                            {userData && editingId !== comment._id && (
                                                <button 
                                                    onClick={() => { setReplyingTo(replyingTo === comment._id ? null : comment._id); setReplyMentions([]); setReplyContent(""); }}
                                                    className="text-[13px] font-bold text-slate-400 hover:text-[#8B5CF6] transition-colors"
                                                >
                                                    Reply
                                                </button>
                                            )}
                                            {userData?._id === comment.author?._id && editingId !== comment._id && (
                                                <>
                                                    <button onClick={() => { setEditingId(comment._id); setEditContent(comment.content); }} className="text-[11px] font-bold text-slate-500 hover:text-blue-400">Edit</button>
                                                    <button onClick={() => handleDeleteComment(comment._id)} className="text-[11px] font-bold text-slate-500 hover:text-red-400">Delete</button>
                                                </>
                                            )}
                                        </div>
                                        
                                        <div className='flex items-center gap-2'>
                                            <button 
                                                onClick={() => handleToggleLike(comment._id)}
                                                className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${isLiked ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                            >
                                                <FaHeart className={`${isLiked ? 'scale-125 animate-pulse' : 'scale-100'} transition-transform duration-300`} size={14} />
                                                <span className='text-[13px] font-black'>{comment.likes?.length || 0}</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Reply Input Box */}
                            {replyingTo === comment._id && (
                                <form onSubmit={(e) => handleAddComment(e, comment._id)} className="ml-14 md:ml-16 mt-4 flex flex-col gap-3 relative animate-in fade-in duration-300">
                                    <div className='relative flex items-center bg-white/5 border border-white/10 rounded-full pr-2'>
                                        <input 
                                            ref={replyTextareaRef}
                                            className="flex-1 bg-transparent p-3 pl-5 outline-none text-white font-medium text-sm placeholder:text-slate-500"
                                            placeholder={`Replying to ${comment.author?.name?.split(" ")[0]}...`}
                                            value={replyContent}
                                            onChange={(e) => handleTextChange(e.target.value, true)}
                                            autoFocus
                                        />
                                        <button type="submit" className="w-8 h-8 rounded-full bg-[#00B4D8] text-white flex items-center justify-center hover:bg-[#0096B4] transition-colors">
                                            <FaPaperPlane size={10} />
                                        </button>

                                        {showMentionDropdown && mentionTarget === "reply" && filteredMentionUsers.length > 0 && (
                                            <div className='absolute bottom-full left-0 mb-2 w-[240px] bg-slate-800 border border-white/10 rounded-xl shadow-xl overflow-hidden z-50'>
                                                {filteredMentionUsers.map(user => (
                                                    <div key={user._id} className='px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer' onClick={() => handleSelectMention(user)}>
                                                        <div className='w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold'>{user.name.charAt(0)}</div>
                                                        <p className='text-sm font-medium text-white'>{user.name}</p>
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </form>
                            )}

                            {/* Nested Replies */}
                            {comment.replies && comment.replies.length > 0 && (
                                <div className="ml-14 md:ml-16 mt-5 space-y-5">
                                    {comment.replies.map((reply) => {
                                        const isReplyLiked = reply.likes?.includes(userData?._id);
                                        return (
                                        <div key={reply._id} className="flex gap-4">
                                            <div className="w-10 h-10 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center overflow-hidden shrink-0">
                                                <span className="text-sm font-bold text-slate-300">{reply.author?.name?.charAt(0).toUpperCase()}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <h4 className="font-bold text-white/90 text-[14px]">{reply.author?.name}</h4>
                                                    <span className="text-slate-500 text-[10px]">•</span>
                                                    <span className="text-[12px] font-medium text-slate-500">{formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}</span>
                                                </div>

                                                {editingId === reply._id ? (
                                                    <div className='flex flex-col gap-2 mt-2'>
                                                        <textarea
                                                            className='w-full bg-white/5 border border-white/20 rounded-xl p-2 outline-none text-white font-medium text-sm resize-none'
                                                            rows={2}
                                                            value={editContent}
                                                            onChange={(e) => setEditContent(e.target.value)}
                                                            autoFocus
                                                        />
                                                        <div className='flex gap-2 justify-end'>
                                                            <button onClick={() => { setEditingId(null); setEditContent(""); }} className='px-3 py-1 text-[10px] font-bold text-slate-400'>Cancel</button>
                                                            <button onClick={() => handleEditComment(reply._id)} className='px-3 py-1 text-[10px] font-bold text-white bg-[#8B5CF6] rounded-lg'>Save</button>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <p className="text-slate-400 font-normal text-[14px] leading-relaxed mb-2">{renderContent(reply.content)}</p>
                                                )}

                                                <div className='flex items-center justify-between'>
                                                    <div className='flex items-center gap-3'>
                                                        {userData?._id === reply.author?._id && editingId !== reply._id && (
                                                            <>
                                                                <button onClick={() => { setEditingId(reply._id); setEditContent(reply.content); }} className="text-[11px] font-bold text-slate-500 hover:text-blue-400">Edit</button>
                                                                <button onClick={() => handleDeleteComment(reply._id)} className="text-[11px] font-bold text-slate-500 hover:text-red-400">Delete</button>
                                                            </>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleToggleLike(reply._id)}
                                                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full transition-all ${isReplyLiked ? 'bg-red-500/10 text-red-500' : 'bg-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                                                    >
                                                        <FaHeart size={10} className={isReplyLiked ? 'animate-pulse' : ''} />
                                                        <span className='text-[11px] font-black'>{reply.likes?.length || 0}</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    )})}
                                </div>
                            )}
                        </div>
                    )})}
                </div>

                {/* Input Area (Bottom) */}
                <div className='pt-6 border-t border-white/10 mt-auto'>
                    {userData ? (
                        <form onSubmit={(e) => handleAddComment(e, null)} className="flex items-center bg-white/5 border border-white/10 rounded-full pr-2">
                            {selectedMentions.length > 0 && (
                                <div className='flex gap-1 pl-4'>
                                    {selectedMentions.map(m => (
                                        <span key={m._id} className='text-[#8B5CF6] text-sm font-bold'>@{m.name} </span>
                                    ))}
                                </div>
                            )}
                            <input 
                                ref={mainTextareaRef}
                                className="flex-1 bg-transparent p-4 pl-6 outline-none text-white font-medium text-[15px] placeholder:text-slate-500"
                                placeholder="Type a comment..."
                                value={newComment}
                                onChange={(e) => handleTextChange(e.target.value, false)}
                            />
                            
                            {showMentionDropdown && mentionTarget === "main" && filteredMentionUsers.length > 0 && (
                                <div className='absolute bottom-[80px] left-8 w-[280px] bg-slate-800 border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50'>
                                    <div className='px-4 py-2 bg-white/5 border-b border-white/10'><span className='text-xs text-[#8B5CF6] font-bold uppercase'>Tag Members</span></div>
                                    {filteredMentionUsers.map(user => (
                                        <div key={user._id} className='px-4 py-3 flex items-center gap-3 hover:bg-white/5 cursor-pointer' onClick={() => handleSelectMention(user)}>
                                            <div className='w-8 h-8 rounded-full bg-slate-700 text-white flex items-center justify-center text-xs font-bold'>{user.name.charAt(0)}</div>
                                            <p className='text-sm font-medium text-white'>{user.name}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button type="submit" className="w-12 h-12 shrink-0 rounded-full bg-[#00B4D8] hover:bg-[#0096B4] transition-colors flex items-center justify-center text-white shadow-lg">
                                <FaPaperPlane size={16} className='ml-1' />
                            </button>
                        </form>
                    ) : (
                        <div className="p-4 bg-white/5 border border-white/10 rounded-full text-center text-slate-400 font-medium text-sm">
                            Sign in to join the conversation
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default CommentSection;
