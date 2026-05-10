import express from "express";
import dotenv from "dotenv";
dotenv.config();
import connectDb from "./config/db.js";
import cookieParser from "cookie-parser";
import cors from "cors";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.route.js";
import listingRouter from "./routes/listing.route.js";
import path from "path"; 
import { fileURLToPath } from "url"; 
import bookingRouter from "./routes/booking.route.js";
import commentRouter from "./routes/comment.route.js";
import complaintRouter from "./routes/complaint.route.js";
import { app } from "./socket.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.json({ limit: '10mb' })); 
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Static folder - handling case where it might not exist
const uploadsPath = path.join(__dirname, 'uploads');
app.use('/uploads', express.static(uploadsPath)); 

app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept']
}));

// Database connection middleware to prevent timeouts on Vercel
app.use(async (req, res, next) => {
  try {
    await connectDb();
    next();
  } catch (error) {
    res.status(503).json({ 
      success: false, 
      message: "Database connection error. Please try again in a few seconds.",
      error: error.message 
    });
  }
});

app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/listing", listingRouter);
app.use("/api/booking", bookingRouter);
app.use("/api/comments", commentRouter);
app.use("/api/complaints", complaintRouter);

app.get("/", (req, res) => {
  res.status(200).json({ status: "success", message: "API is running..." });
});

app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  res.status(statusCode).json({ success: false, statusCode, message });
});

const port = process.env.PORT || 8000; 


// Start server only if not on Vercel
if (process.env.NODE_ENV !== 'production') {
    app.listen(port, () => {
        console.log(`🚀 Server started at: http://localhost:${port}`);
    });
}

export default app;
