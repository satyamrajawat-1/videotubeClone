import { Router } from "express";
const router = Router()
import { deleteVideo, getAllVideos, getVideo, publishVideo, toggleIsPublished, updateVideo } from "../controllers/video.controller.js";
import {upload} from "../middlewares/multer.middleware.js"
import {verifyJWT} from "../middlewares/auth.middleware.js";

router.route("/upload").post(upload.fields([
    {
        name:'video',
        maxCount:1
    },
    {
        name:'thumbnail',
        maxCount:1
    }
]),verifyJWT,publishVideo)

router.route('/c/:videoid').get(getVideo)

router.route('/update/c/:videoid').post(verifyJWT,upload.single('thumbnail'),updateVideo)

router.route('/delete/c/:videoid').post(verifyJWT,deleteVideo)

router.route('/publish/c/:videoid').post(verifyJWT,toggleIsPublished)

router.route('/videos').get(getAllVideos)

export default router