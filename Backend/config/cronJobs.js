import cron from 'node-cron';
import Booking from '../models/booking.model.js';
import Listing from '../models/listing.model.js';

// REAL MODE: Har raat 12:00 AM (00:00) Pakistan Time par check karega
cron.schedule('0 0 * * *', async () => {
    try {
        console.log("Running Daily Cleanup: Checking for expired bookings (PKT)...");
        
        // Aaj ki date (YYYY-MM-DD format mein) Pakistan Time ke mutabiq
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

        // Logic: CheckOut date aaj se purani ho (e.g., Kal check-out ho gaya tha)
        const expiredBookings = await Booking.find({
            checkOut: { $lt: todayStr },
            $or: [
                { status: 'Booked' },
                { status: { $exists: false } }
            ]
        });

        if (expiredBookings.length > 0) {
            for (let booking of expiredBookings) {
                // 1. Status 'Completed' mark karein
                booking.status = 'Completed';
                await booking.save();

                // 2. Listing ko 'isBooked: false' karein taake wo wapis show ho sake
                if (booking.listing) {
                    await Listing.findByIdAndUpdate(booking.listing, { isBooked: false });
                }
            }
            console.log(`✅ Success: ${expiredBookings.length} bookings expired and listings are now available.`);
        } else {
            console.log("No bookings to expire today.");
        }
    } catch (error) {
        console.error("Cron Job Error:", error);
    }
}, {
    scheduled: true,
    timezone: "Asia/Karachi"
});