import User from "../models/user.model.js";

export const getCurrentUser = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;

        const user = await User.findById(userId)
            .select("-password")
            .populate("listing") // User ki apni banayi hui listings
            .populate({
                path: "bookings", // FIX: bookings (plural) as per model
                populate: {
                    path: "listing", // Booking ke andar ki listing details
                    model: "Listing"
                }
            });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        
        return res.status(200).json(user);
    } catch (error) {
        console.error("getCurrentUser Error:", error);
        return res.status(500).json({ message: `Server error: ${error.message}` });
    }
};

export const markNotificationsRead = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { type } = req.body; // Optional: mark only specific type (e.g., 'refund_request')

        const query = { _id: userId };
        const update = type 
            ? { "notifications.$[elem].isRead": true }
            : { "notifications.$[].isRead": true };
        
        const options = type
            ? { arrayFilters: [{ "elem.type": type }] }
            : {};

        await User.updateOne(query, { $set: update }, options);
        
        return res.status(200).json({ message: "Notifications marked as read" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

export const deleteNotification = async (req, res) => {
    try {
        const userId = req.userId || req.user?._id;
        const { notificationId } = req.params;

        await User.findByIdAndUpdate(userId, {
            $pull: { notifications: { _id: notificationId } }
        });

        return res.status(200).json({ message: "Notification deleted successfully" });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};