import express from "express";
import isAuth from "../middleware/isAuth.js";
import { 
  createComplaint, 
  getAllComplaints, 
  getUserComplaints, 
  replyToComplaint,
  deleteComplaint
} from "../controllers/complaint.controller.js";

const complaintRouter = express.Router();

complaintRouter.post("/create", isAuth, createComplaint);
complaintRouter.get("/admin/all", isAuth, getAllComplaints);
complaintRouter.get("/my-complaints", isAuth, getUserComplaints);
complaintRouter.post("/reply/:id", isAuth, replyToComplaint);
complaintRouter.delete("/delete/:id", isAuth, deleteComplaint);

export default complaintRouter;
