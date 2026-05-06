import Complaint from "../models/complaint.model.js";
import User from "../models/user.model.js";
import { sendEmail } from "../config/email.js";
import { io, getReceiverSocketId } from "../socket.js";

// 1. Create Complaint (User Side)
export const createComplaint = async (req, res) => {
  try {
    const { subject, message } = req.body;
    const userId = req.userId;

    if (!subject || !message) {
      return res.status(400).json({ message: "Subject and message are required" });
    }

    const complaint = await Complaint.create({
      user: userId,
      subject,
      message,
      status: "Replied",
      reply: "Your message has been received by the VenueSpark Team. We will get back to you soon."
    });

    const user = await User.findById(userId);

    // Send email to Admin
    const emailSubject = `New Complaint/Feedback: ${subject}`;
    const emailText = `Hello VenueSpark Team,\n\nYou have received a new message from ${user.name} (${user.email}).\n\nSubject: ${subject}\nMessage:\n${message}\n\nAn automated acknowledgment has been sent to the user. To send a custom official response, click here:\nhttp://localhost:5173/my-complaints?replyingTo=${complaint._id}\n\nThank you,\nVenueSpark System`;
    sendEmail('teamvenuesparkofficial@gmail.com', emailSubject, emailText, "", [], user.email).catch(err => console.log('Email Error:', err));

    // Also emit real-time event to Admin
    io.emit("adminNewComplaint", { message: `New message from ${user.name}`, subject });

    return res.status(201).json({ message: "Complaint submitted successfully", complaint });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 2. Get All Complaints (Admin Side)
export const getAllComplaints = async (req, res) => {
  try {
    // Note: Ideally, check if the current user is an Admin
    const complaints = await Complaint.find().populate("user", "name email").sort({ createdAt: -1 });
    return res.status(200).json(complaints);
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 3. Reply to Complaint (Admin Side)
export const replyToComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const { reply } = req.body;

    if (!reply) {
      return res.status(400).json({ message: "Reply is required" });
    }

    // Update status and reply using a direct MongoDB update to bypass any potential schema/model caching issues
    const complaint = await Complaint.findOneAndUpdate(
      { _id: id },
      { $set: { reply: reply, status: "Replied" } },
      { new: true, runValidators: true }
    );
    
    if (!complaint) {
      console.log(`Complaint not found for ID: ${id}`);
      return res.status(404).json({ message: "Complaint not found" });
    }

    console.log(`Complaint ${id} updated. Status: ${complaint.status}, Reply length: ${complaint.reply.length}`);

    const user = await User.findById(complaint.user);

    // Optionally notify the user
    if (user) {
        // Prepare notification payload
        const notificationPayload = {
          message: `VenueSpark Team has replied to your message: "${complaint.subject}"`,
          type: "ComplaintReply",
          date: new Date(),
          isRead: false,
          complaintId: complaint._id.toString(),
          replyText: reply
        };

        await User.findByIdAndUpdate(complaint.user, {
          $push: { notifications: notificationPayload }
        });

        // Emit real-time notification to all connected tabs of this user
        io.to(complaint.user.toString()).emit("newNotification", notificationPayload);

        // Send email to User (Nodemailer)
        const emailSubject = `Response to your complaint: ${complaint.subject}`;
        const emailText = `Hello ${user.name},\n\nThe VenueSpark Team has replied to your message.\n\nYour Message:\n${complaint.message}\n\nAdmin's Reply:\n${reply}\n\nYou can view this response and track your complaint here: http://localhost:5173/my-complaints\n\nThank you,\nVenueSpark Team`;
        
        if (user.email) {
            await sendEmail(user.email, emailSubject, emailText);
            console.log(`Reply email sent to ${user.email} for complaint ${id}`);
        }
    }

    return res.status(200).json({ message: "Reply sent and status updated to Replied", complaint });
  } catch (error) {
    console.error("Reply Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 4. Get User's Own Complaints (User Side)
export const getUserComplaints = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId);

    // FIX: Automatically update ALL 'Pending' complaints to 'Replied' for consistency
    await Complaint.updateMany(
        { status: "Pending" },
        { 
            $set: { 
                status: "Replied", 
                reply: "Your message has been received by the VenueSpark Team. We will get back to you soon." 
            } 
        }
    );

    let complaints;
    // Check if the user is the Admin (Hafsa Sajid)
    if (user && user.name === "Hafsa Sajid") {
      // Admin sees ALL complaints from ALL users
      complaints = await Complaint.find().populate("user", "name email").sort({ createdAt: -1 });
    } else {
      // Regular users see ONLY their own complaints
      complaints = await Complaint.find({ user: userId }).sort({ createdAt: -1 });
    }

    return res.status(200).json(complaints);
  } catch (error) {
    console.error("Get Complaints Error:", error);
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// 5. Delete Complaint (User Side)
export const deleteComplaint = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const complaint = await Complaint.findOne({ _id: id, user: userId });
    
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found or unauthorized" });
    }

    await Complaint.findByIdAndDelete(id);

    return res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: "Server Error", error: error.message });
  }
};
