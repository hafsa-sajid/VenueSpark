import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  listingId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Listing", 
    required: true 
  },
  author: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  content: { 
    type: String, 
    required: true,
    trim: true
  },
  parentCommentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Comment", 
    default: null 
  },
  replies: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Comment" 
  }],
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }]
}, { timestamps: true });

const Comment = mongoose.models.Comment || mongoose.model("Comment", commentSchema);

export default Comment;
