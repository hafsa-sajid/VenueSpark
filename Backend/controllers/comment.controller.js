import Comment from "../models/comment.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import { io, getReceiverSocketId } from "../socket.js";

// Helper: Send notification to a user (DB + socket)
const sendNotification = async (receiverId, message, listingId) => {
    const receiverUser = await User.findById(receiverId);
    if (!receiverUser) return;

    const newNotification = {
        message,
        type: "COMMENT",
        listingId,
        date: new Date(),
        isRead: false
    };
    receiverUser.notifications.push(newNotification);
    await receiverUser.save();

    // Real-time socket notification
    const receiverSocketId = getReceiverSocketId(receiverId.toString());
    if (receiverSocketId) {
        io.to(receiverSocketId).emit("newNotification", newNotification);
    }
};

// Add a comment or reply
export const addComment = async (req, res) => {
    try {
        const { listingId, content, parentCommentId, mentionedUserIds } = req.body;
        const authorId = req.userId;

        if (!listingId || !content) {
            return res.status(400).json({ success: false, message: "Listing ID and content are required." });
        }

        // Get author name for notification messages
        const author = await User.findById(authorId).select("name");
        const authorName = author?.name || "Someone";

        const newComment = new Comment({
            listingId,
            author: authorId,
            content,
            parentCommentId: parentCommentId || null
        });

        await newComment.save();

        const listing = await Listing.findById(listingId);
        if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });

        // Track who we've already notified to avoid duplicates
        const notifiedUsers = new Set();

        // 1) Notify for reply or direct comment (existing logic)
        if (parentCommentId) {
            const parentComment = await Comment.findById(parentCommentId);
            if (parentComment) {
                parentComment.replies.push(newComment._id);
                await parentComment.save();

                if (parentComment.author.toString() !== authorId.toString()) {
                    const receiverId = parentComment.author.toString();
                    notifiedUsers.add(receiverId);
                    await sendNotification(receiverId, `${authorName} replied to your comment on "${listing.title}"`, listing._id);
                }
            }
        } else {
            // Direct comment - notify listing host
            if (listing.host.toString() !== authorId.toString()) {
                const receiverId = listing.host.toString();
                notifiedUsers.add(receiverId);
                await sendNotification(receiverId, `${authorName} commented on your listing: ${listing.title}`, listing._id);
            }
        }

        // 2) Notify all mentioned/tagged users
        if (mentionedUserIds && Array.isArray(mentionedUserIds)) {
            for (const mentionedId of mentionedUserIds) {
                const mentionedIdStr = mentionedId.toString();
                // Don't notify yourself or someone already notified
                if (mentionedIdStr === authorId.toString()) continue;
                if (notifiedUsers.has(mentionedIdStr)) continue;

                notifiedUsers.add(mentionedIdStr);
                await sendNotification(mentionedIdStr, `${authorName} mentioned you in a comment on "${listing.title}"`, listing._id);
            }
        }

        // Populate author to return with response
        await newComment.populate("author", "name email");

        res.status(201).json({ success: true, comment: newComment });

    } catch (error) {
        console.error("Error in addComment:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get threads (comments and populated replies) for a listing
export const getComments = async (req, res) => {
    try {
        const { listingId } = req.params;

        const comments = await Comment.find({ listingId, parentCommentId: null })
            .populate("author", "name email")
            .populate({
                path: "replies",
                populate: { path: "author", select: "name email" }
            })
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, comments });
    } catch (error) {
        console.error("Error in getComments:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get users who can be tagged on a listing (owner + all commenters)
export const getTaggableUsers = async (req, res) => {
    try {
        const { listingId } = req.params;

        const listing = await Listing.findById(listingId).populate("host", "name email");
        if (!listing) return res.status(404).json({ success: false, message: "Listing not found." });

        // Get all unique commenters on this listing
        const comments = await Comment.find({ listingId }).populate("author", "name email");
        
        const usersMap = new Map();
        
        // Add host/owner
        if (listing.host) {
            usersMap.set(listing.host._id.toString(), {
                _id: listing.host._id,
                name: listing.host.name,
                role: "Owner"
            });
        }

        // Add all commenters
        for (const comment of comments) {
            if (comment.author && !usersMap.has(comment.author._id.toString())) {
                usersMap.set(comment.author._id.toString(), {
                    _id: comment.author._id,
                    name: comment.author.name,
                    role: "Guest"
                });
            }
        }

        // Add guest if listing has one
        if (listing.guest) {
            const guest = await User.findById(listing.guest).select("name");
            if (guest && !usersMap.has(guest._id.toString())) {
                usersMap.set(guest._id.toString(), {
                    _id: guest._id,
                    name: guest.name,
                    role: "Guest"
                });
            }
        }

        res.status(200).json({ success: true, users: Array.from(usersMap.values()) });
    } catch (error) {
        console.error("Error in getTaggableUsers:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Edit a comment (only by the author)
export const editComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const { content } = req.body;
        const userId = req.userId;

        if (!content || !content.trim()) {
            return res.status(400).json({ success: false, message: "Content cannot be empty." });
        }

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

        // Only the author can edit
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only edit your own comments." });
        }

        comment.content = content.trim();
        await comment.save();
        await comment.populate("author", "name email");

        res.status(200).json({ success: true, comment });
    } catch (error) {
        console.error("Error in editComment:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Delete a comment (only by the author)
export const deleteComment = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

        // Only the author can delete
        if (comment.author.toString() !== userId.toString()) {
            return res.status(403).json({ success: false, message: "You can only delete your own comments." });
        }

        // If this is a reply, remove it from parent's replies array
        if (comment.parentCommentId) {
            await Comment.findByIdAndUpdate(comment.parentCommentId, {
                $pull: { replies: comment._id }
            });
        }

        // Delete all child replies recursively
        if (comment.replies && comment.replies.length > 0) {
            await Comment.deleteMany({ _id: { $in: comment.replies } });
        }

        await Comment.findByIdAndDelete(commentId);

        res.status(200).json({ success: true, message: "Comment deleted." });
    } catch (error) {
        console.error("Error in deleteComment:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
// Toggle like on a comment
export const toggleLike = async (req, res) => {
    try {
        const { commentId } = req.params;
        const userId = req.userId;

        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ success: false, message: "Comment not found." });

        const likeIndex = comment.likes.indexOf(userId);
        if (likeIndex === -1) {
            // Like
            comment.likes.push(userId);
        } else {
            // Unlike
            comment.likes.splice(likeIndex, 1);
        }

        await comment.save();
        res.status(200).json({ success: true, likes: comment.likes });
    } catch (error) {
        console.error("Error in toggleLike:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};
