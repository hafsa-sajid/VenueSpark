import Booking from "../models/booking.model.js";
import Listing from "../models/listing.model.js";
import User from "../models/user.model.js";
import Stripe from "stripe";
import dotenv from "dotenv";
import { sendEmail } from "../config/email.js";
import PDFDocument from "pdfkit";
import uploadOnCloudinary from "../config/cloudinary.js";


dotenv.config();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export const createBooking = async (req, res) => {
    try {
        const { id } = req.params; 
        const { checkIn, checkOut, totalRent, paymentMethod, transactionId } = req.body;
        const guestId = req.userId;

        if (!guestId) return res.status(401).json({ message: "User not authenticated" });

        const listing = await Listing.findById(id);
        if (!listing) return res.status(404).json({ message: "Listing not found" });

        let paymentProofUrl = "";
        if (req.file) {
            paymentProofUrl = await uploadOnCloudinary(req.file.buffer);
        }

        const newBooking = await Booking.create({
            listing: listing._id,
            user: guestId,
            host: listing.host, 
            checkIn,
            checkOut,
            price: totalRent,
            status: 'Booked', // Explicitly setting status
            paymentMethod: paymentMethod || 'Manual',
            transactionId: transactionId || `TXN-${Date.now()}`,
            paymentStatus: 'completed',
            paymentProof: paymentProofUrl
        });

        const booking = await Booking.findById(newBooking._id)
            .populate('user', 'email name')
            .populate('host', 'email')
            .populate('listing');

        await Promise.all([
            User.findByIdAndUpdate(guestId, { $push: { bookings: booking._id } }),
            Listing.findByIdAndUpdate(id, { isBooked: true })
        ]);

        return res.status(201).json(booking);
    } catch (error) {
        console.error("Create Booking Error:", error);
        return res.status(500).json({ message: error.message });
    }
};
export const getHostBookings = async (req, res) => {
    try {
        const hostId = req.userId;
        const bookings = await Booking.find({ host: hostId })
            .populate('listing')
            .populate('user', 'email name')
            .sort({ createdAt: -1 }); 
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch host bookings" });
    }
};

export const cancelBooking = async (req, res) => {
    try {
        const { id } = req.params; 
        const currentUserId = req.userId;
        const { refundDetails } = req.body; 

        const booking = await Booking.findById(id).populate('listing').populate('user', 'name email').populate('host', 'name email');
        if (!booking) return res.status(404).json({ message: "Booking record not found" });

        const hostIdString = booking.host?._id?.toString() || booking.host?.toString();
        const guestIdString = booking.user?._id?.toString() || booking.user?.toString();
        
        const isHost = hostIdString === currentUserId;
        const isGuest = guestIdString === currentUserId;

        if (!isHost && !isGuest) {
            return res.status(403).json({ message: "Unauthorized" });
        }

        // Logic for Guest Cancelling
        if (isGuest) {
            const bookingTime = new Date(booking.createdAt).getTime();
            const now = new Date().getTime();
            const hoursPassed = (now - bookingTime) / (1000 * 60 * 60);

            if (hoursPassed > 6) {
                return res.status(400).json({ message: "Cancellation window (6 hours) has expired." });
            }

            // Mark as cancel requested and pending refund
            booking.status = 'Cancel_Requested';
            booking.paymentStatus = 'cancelled';
            booking.refundStatus = 'Pending';
            
            if (refundDetails) {
                booking.refundDetails = {
                    ...refundDetails,
                    requestedAt: new Date()
                };
            }

            // Notify Host via App Notification
            const cancelNotification = {
                message: `Alert: Guest ${booking.user?.name || ''} has cancelled the booking for "${booking.listing?.title}". A refund request is pending.`,
                type: 'refund_request',
                date: new Date(),
                isRead: false
            };
            
            if (booking.host) {
                await User.findByIdAndUpdate(hostIdString, { $push: { notifications: cancelNotification } });
            }

            // Notify Host via Email
            const emailSubject = `Booking Cancellation Alert: ${booking.listing?.title}`;
            const emailText = `Hello ${booking.host?.name || 'Owner'},\n\nYour guest ${booking.user?.name || 'A user'} has just cancelled their booking for ${booking.listing?.title}.\n\nThey have requested a refund via ${refundDetails?.method || 'N/A'}.\nPlease check your VenuSpark Dashboard to process and terminate this booking.\n\nThank You,\nVenuSpark Team`;
            // Generate Receipt PDF Buffer
            const generateReceiptPDF = () => {
                return new Promise((resolve, reject) => {
                    try {
                        const doc = new PDFDocument({ margin: 0, size: 'A4' });
                        const buffers = [];
                        
                        doc.on('data', buffers.push.bind(buffers));
                        doc.on('end', () => {
                            resolve(Buffer.concat(buffers));
                        });
                        doc.on('error', reject);

                        // Colors
                        const primaryColor = '#8B5CF6';
                        const darkBg = '#272727';
                        const lightBg = '#f9fafb';
                        const textDark = '#111827';
                        const textMuted = '#6b7280';

                        // Header block
                        doc.fillColor(darkBg).rect(0, 0, doc.page.width, 150).fill();

                        // "Paid" Badge
                        doc.fillColor(primaryColor).fontSize(12).font('Helvetica-Bold').text('PAID', doc.page.width - 70, 30);

                        // Title
                        doc.fillColor('#ffffff').fontSize(40).font('Helvetica-Bold').text('VenuSpark', 0, 50, { align: 'center' });
                        doc.fillColor('#9ca3af').fontSize(12).font('Helvetica').text('BOOKING RECEIPT', 0, 95, { align: 'center', characterSpacing: 4 });

                        // Reset margins for content
                        doc.x = 50;
                        doc.y = 180;

                        // Booking Info Row
                        doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text('BOOKING ID', 50, 180).text('DATE', doc.page.width - 150, 180);
                        doc.fillColor(textDark).fontSize(14).font('Helvetica').text(`#${booking._id.toString().slice(-8).toUpperCase()}`, 50, 195).text(`${new Date().toLocaleDateString()}`, doc.page.width - 150, 195);

                        // Line separator
                        doc.moveTo(50, 230).lineTo(doc.page.width - 50, 230).strokeColor('#e5e7eb').stroke();

                        // Details List
                        let currentY = 260;
                        const drawRow = (label, value, fontValue = 'Helvetica-Bold', colorValue = textDark) => {
                            doc.fillColor(textMuted).fontSize(12).font('Helvetica').text(label, 50, currentY);
                            doc.fillColor(colorValue).font(fontValue).text(value, 200, currentY, { align: 'right', width: doc.page.width - 250 });
                            currentY += 30;
                        };

                        drawRow('Property', booking.listing?.title || "Property Reserved");
                        drawRow('Guest Email', booking.user?.email || "N/A");
                        drawRow('Owner Email', booking.host?.email || "N/A");
                        drawRow('Check-In', booking.checkIn);
                        drawRow('Check-Out', booking.checkOut);
                        drawRow('Payment Method', booking.paymentMethod);
                        drawRow('Transaction ID', booking.transactionId, 'Courier-Bold', primaryColor);

                        // Total Box
                        currentY += 20;
                        doc.fillColor(lightBg).rect(50, currentY, doc.page.width - 100, 100).fill();
                        doc.fillColor(textMuted).fontSize(10).font('Helvetica-Bold').text('TOTAL AMOUNT PAID', 70, currentY + 30, { characterSpacing: 1 });
                        doc.fillColor(textMuted).fontSize(10).font('Helvetica-Oblique').text('Inclusive of all taxes', 70, currentY + 45);
                        
                        doc.fillColor(darkBg).fontSize(30).font('Helvetica-Bold').text(`Rs.${booking.price}`, doc.page.width - 250, currentY + 35, { align: 'right', width: 180 });

                        // Footer
                        doc.fillColor('#9ca3af').fontSize(10).font('Helvetica').text('Thank you for choosing VenuSpark!', 0, currentY + 140, { align: 'center' });
                        doc.fillColor('#d1d5db').fontSize(8).font('Helvetica-Oblique').text('This is a computer generated receipt for FYP project purposes.', 0, currentY + 155, { align: 'center' });

                        doc.end();
                    } catch (err) {
                        reject(err);
                    }
                });
            };

            const pdfBuffer = await generateReceiptPDF();

            const attachments = [
                {
                    filename: `Receipt_${booking.transactionId}.pdf`,
                    content: pdfBuffer,
                    contentType: 'application/pdf'
                }
            ];

            if (booking.host?.email) {
                // Send email asynchronously in the background so API responds instantly
                sendEmail(booking.host.email, emailSubject, emailText, "", attachments).catch(err => console.log('Email Error:', err));
            }

            await booking.save();

            // The listing remains booked and the booking remains in the user's dashboard
            // until the owner explicitly approves and terminates it.

            return res.status(200).json({ message: "Cancellation request sent. Booking will be completely removed once the owner approves it." });
        }

        // Logic for Host Cancelling (Termination)
        if (isHost) {
            const cancelNotification = {
                message: `Alert: Your booking for "${booking.listing?.title || 'Property'}" was approved and permanently removed by owner ${booking.host?.name || ''}.`,
                type: 'cancellation_complete',
                date: new Date(),
                isRead: false
            };

            // Remove booking from Guest's bookings array so it disappears from My Bookings
            if (guestIdString) {
                // Send Email to Guest
                const emailSubject = `Booking Cancellation Approved: ${booking.listing?.title}`;
                const emailText = `Hello ${booking.user?.name || 'Guest'},\n\nYour booking cancellation request for ${booking.listing?.title} has been approved by the owner ${booking.host?.name || ''}.\n\nThe booking has been removed from your dashboard, and the refund (if applicable) is being processed.\n\nThank You,\nVenuSpark Team`;
                
                if (booking.user?.email) {
                    // Send email asynchronously
                    sendEmail(booking.user.email, emailSubject, emailText).catch(err => console.log('Email Error:', err));
                }

                await User.findByIdAndUpdate(guestIdString, { 
                    $pull: { bookings: id },
                    $push: { notifications: cancelNotification }
                });
            }

            // Make sure the property is free — available again on home page
            const listingIdHost = booking.listing?._id || booking.listing;
            if (listingIdHost) {
                await Listing.findByIdAndUpdate(listingIdHost, { isBooked: false });
            }

            // Host physically deletes the booking record to terminate it permanently from both ends
            await Booking.findByIdAndDelete(id);
            return res.status(200).json({ message: "Booking terminated successfully and removed from user dashboard" });
        }

    } catch (error) {
        console.error("Cancel Booking Error:", error);
        return res.status(500).json({ message: error.message });
    }
};

export const getUserBookings = async (req, res) => {
    try {
        const guestId = req.userId;
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

        // Filter out Cancelled, Completed, and Outdated (past check-out date) bookings
        const bookings = await Booking.find({ 
            user: guestId, 
            status: { $nin: ['Cancelled', 'Completed'] }


        })

                 .populate('listing')
                 .populate('host', 'email')
                 .populate('user', 'name email');
        res.status(200).json(bookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const manualCleanupBookings = async (req, res) => {
    try {
        console.log("Running Manual Cleanup...");
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' });

        const expiredBookings = await Booking.find({
            checkOut: { $lt: todayStr },
            $or: [
                { status: 'Booked' },
                { status: { $exists: false } }
            ]
        });

        if (expiredBookings.length > 0) {
            for (let booking of expiredBookings) {
                booking.status = 'Completed';
                await booking.save();
                if (booking.listing) {
                    await Listing.findByIdAndUpdate(booking.listing, { isBooked: false });
                }
            }
            return res.status(200).json({ 
                message: `Success: ${expiredBookings.length} bookings expired and listings are now available.`,
                count: expiredBookings.length 
            });
        } else {
            return res.status(200).json({ message: "No outdated bookings found at this time." });
        }
    } catch (error) {
        return res.status(500).json({ message: "Cleanup Error", error: error.message });
    }
};