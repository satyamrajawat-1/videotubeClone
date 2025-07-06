import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { addComment, deleteComment, getAllComments, updateComment } from "../controllers/comment.controller.js";
const router = Router()


router.route('/add-comment/:videoId').post(verifyJWT,addComment)

router.route('/update-comment/:videoId/:commentId').post(verifyJWT,updateComment)

router.route('/delete-comment/:videoId/:commentId').post(verifyJWT,deleteComment)

router.route('/get-all-comments').get(verifyJWT,getAllComments)

export default router