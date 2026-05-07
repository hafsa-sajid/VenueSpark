import express from "express";
import isAuth from "../middleware/isAuth.js";
import { addComment, getComments, getTaggableUsers, editComment, deleteComment, toggleLike } from "../controllers/comment.controller.js";

const router = express.Router();

router.post("/", isAuth, addComment);
router.get("/taggable/:listingId", isAuth, getTaggableUsers);
router.get("/:listingId", getComments);
router.put("/:commentId", isAuth, editComment);
router.delete("/:commentId", isAuth, deleteComment);
router.post("/like/:commentId", isAuth, toggleLike);

export default router;
