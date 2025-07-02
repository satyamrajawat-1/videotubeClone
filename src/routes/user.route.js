import { Router } from "express";
import { upload } from "../middlewares/multer.middleware.js";
import { changeAvatar, changeCoverImage, changePassword, currentUser, loginUser, logOutUser, refreshAccessToken, registerUser, updateAcountDetail } from "../controllers/user.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
const router = Router()


router.route('/register').post(upload.fields([
    {
        name : 'avatar',
        maxCount : 1
    },
    {
        name : 'coverImage',
        maxCount : 1
    }
]),registerUser)

router.route('/login').post(loginUser)

router.route('/logout').post(verifyJWT,logOutUser)

router.route('/refresh-token').post(refreshAccessToken)

router.route('/update-account').post(verifyJWT,updateAcountDetail)

router.route('/change-password').post(verifyJWT,changePassword)

router.route('/current-user').get(verifyJWT,currentUser)

router.route('/update-avatar').post(verifyJWT,upload.single("avatar"),changeAvatar)

router.route('/update-cover-image').post(verifyJWT,upload.single("coverImage"),changeCoverImage)
export default router
