import { Router } from "express"
import { verifyJWT } from "../middlewares/auth.middleware.js"
import { createTweet, deleteTweet, getUserTweets, updateTweet } from "../controllers/tweet.controller.js"
const router = Router()



router.route('/create').post(verifyJWT,createTweet)

router.route('/get-tweets').get(verifyJWT,getUserTweets)

router.route('/update/c/:tweetId').post(verifyJWT,updateTweet)

router.route('/delete/c/:tweetId').post(verifyJWT,deleteTweet)

export default router