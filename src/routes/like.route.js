import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { getAllLikedVideos, toggleCommentLike, toggleLikeVideo, toggleTweetLike } from "../controllers/like.controller.js";
const router = Router()


router.route('/toggle-video-like/:videoId').post(verifyJWT,toggleLikeVideo)

router.route('/toggle-comment-like/:commentId').post(verifyJWT,toggleCommentLike)

router.route('/toggle-tweet-like/:tweetId').post(verifyJWT,toggleTweetLike)

router.route('/getalllikevideos').get(verifyJWT,getAllLikedVideos)







export default router