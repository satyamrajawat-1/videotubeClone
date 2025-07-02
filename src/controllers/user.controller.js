import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import jwt from "jsonwebtoken"
import dotenv from "dotenv"

// generate access and refresh token

const generateAccessAndRefreshToken = async(userid)=>{
    try {
        const user = await User.findById(userid)
        const accessToken = user.generateAccessToken()
        const refreshToken = user.generateRefreshToken()
        user.refreshToken = refreshToken
        await user.save({validateBeforeSave:false})
        return { accessToken, refreshToken }
    } catch (error) {
        throw new ApiError(500,"Error in generating access and refresh token")
    }
}

// register user 
const registerUser = asyncHandler(async(req,res)=>{

    const {username, email, fullName, password} = req.body
    if([username, email, fullName, password].some((field)=>field?.trim()==="")){
        throw new ApiError(400,"ALL FIELDS ARE REQUIRED ! ")
    }

    const Existeduser = await User.findOne({$or:[{username},{email}]})
    if(Existeduser) {
        throw new ApiError(400,"USER ALREADY EXIST")
    }

    const avatarLocalPath = req.files?.avatar[0]?.path
    console.log(`avatar : ${req.files.avatar[0].path}`)
    const coverImageLocalPath = req.files?.coverImage[0].path

    if(!avatarLocalPath){
        throw new ApiError(400,"AVATAR IS REQUIRED !!")
    }

    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(404,"SOMETHING WENT WRONG WHILE UPLOADING AVATAR")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)


    const user = await User.create({
        fullName,
        avatar :avatar.url,
        password,
        email,
        username : username.toLowerCase(),
        coverImage : coverImage?.url || ""
    })

    const createdUser = await User.findById(user._id).select("-password -refreshToken")
    console.log(createdUser)

    if (!createdUser) {
        throw new ApiError(500, "SOMETHING WENT WRONG WHILE REGISTERING USER")
    }

    return res.status(200)
    .json(new ApiResponse(200,createdUser,"USER CREATED SUCCESSFULL"))
    
})

// login user

const loginUser = asyncHandler(async(req,res)=>{
  const  {email, username, password} = req.body
  if(!email || !username){
    throw new ApiError("email or username required")
  }
  const user = await User.findOne({$or:[{username},{email}]})
  if(!user){
    throw new ApiError(404,"Invalide Credentials")
  }
  const correctPassword =await user.isPasswordCorrect(password)
  if(!correctPassword){
    throw new ApiError(400,"Password is incorrect")
  }
  const {accessToken , refreshToken} = await generateAccessAndRefreshToken(user._id)
  const options = {
    httpOnly:true,
    secure:true
  }
  const loggedUser = await User.findById(user._id).select("-password -refreshToken")
  return res.status(200).cookie("accessToken",accessToken,options).cookie("refreshToken",refreshToken,options)
    .json(new ApiResponse(200,{user:loggedUser,accessToken,refreshToken},"LOGIN SUCCESSFULL"))
    
})



// logout  user


const logOutUser = asyncHandler(async(req,res)=>{
    const user = User.findByIdAndUpdate(req.user._id,{
            $set :{
                refreshToken:undefined
            }
        },
        {
                new:true
        }
        
    )

  const options = {
    httpOnly:true,
    secure:true
  }
  return res.status(200).clearCookie("accessToken",options).clearCookie("refreshToken",options)
    .json(new ApiResponse(200,{},"LOG OUT SUCCESSFULL"))
})


// refresh access token


const refreshAccessToken = asyncHandler(async(req,res)=>{
    const incomingRefreshToken = req.cookies.refreshToken || req.body.refreshToken
    if(!incomingRefreshToken){
        throw new ApiError(400,"UNAUTHORISED ACCESS")
    }
    try {
        const decodedToken =  jwt.verify(incomingRefreshToken,process.env.REFRESH_TOKEN_SECRET)
        const user = await User.findById(decodedToken?._id)
        if(!user){
            throw new ApiError(400,"INVALID OR EXPIRED TOKEN")
        }
        if(incomingRefreshToken!==user.refreshToken){
            throw new ApiError(400,"UNAUTHORISED ACCESS")
        }
        const options = {
            httpOnly: true,
            secure: true
        }
        const { accessToken, newrefreshToken } = await generateAccessAndRefreshToken(user._id)
        return res.status(200).cookie("accessToken", accessToken, options).cookie("refreshToken", newrefreshToken, options).json(new ApiResponse(200,
            { accessToken, refreshToken: newrefreshToken }
            , "ACCESS TOKEN REFRESHED"))
    } catch (error) {
        throw new ApiError(401, error?.message || "INVALID REFRESH TOKEN")
    }
})


// update account details


const updateAcountDetail = asyncHandler(async(req,res)=>{
    const {email,username} = req.body
    if(!email||!username){
        throw new ApiError(400,"ALL FIELDS ARE REQUIRED")
    }
    const updatedUser = await User.findByIdAndUpdate(req.user?._id,
        {
            $set:{
                email,
                username
            }
        },
        {
            new:true
        }
    ).select("-password -refreshToken")
    return res
        .status(200)
        .json(new ApiResponse(200, updatedUser, "ACCOUNT DETAILS UPDATED SUCCESSFULLY"))
})

// change password 

const changePassword = asyncHandler(async(req,res)=>{
    const { newPassword , oldPassword } = req.body
    if(!newPassword||!oldPassword){
        throw new ApiError(400,"PASSWORD IS REQUIRED ")
    }
    const user = await User.findById(req.user?._id)
    const correctPassword = user.isPasswordCorrect(oldPassword)
    if(!correctPassword){
        throw new ApiError(400,"INVALID PASSWORD")
    }
    user.password = newPassword
    await user.save({validateBeforeSave:false})
    res.status(200).json(new ApiResponse(200,{},"password change successfully"))
})

// get current user

const currentUser = asyncHandler(async(req,res)=>{
    res.status(200).json(new ApiResponse(200,req.user,"CURRENT USER FETCHED SUCCESSFULLY"))
})

// chnange avatar

const changeAvatar = asyncHandler(async(req,res)=>{
    const avatarLocalPath = req.file?.path
    if(!avatarLocalPath){
        throw new ApiError(400,"avatar is required")
    }
    const avatar = await uploadOnCloudinary(avatarLocalPath)
    if(!avatar){
        throw new ApiError(400,"ERROR WHILE UPLODING AVAATR")
    }
    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    user.avatar = avatar.url
    await user.save({validateBeforeSave:false})
    res.status(200).json(new ApiResponse(200,user,"AVATAR UPDATED SUCCESSFULLY"))
})

// change coverImage

const changeCoverImage = asyncHandler(async(req,res)=>{
    const coverImageLocalPath = req.file?.path
    if(!coverImageLocalPath){
        throw new ApiError(400,"coverImage is required")
    }
    const coverImage = await uploadOnCloudinary(coverImageLocalPath)
    if(!coverImage){
        throw new ApiError(400,"ERROR WHILE UPLODING coverImage")
    }
    const user = await User.findById(req.user?._id).select("-password -refreshToken")
    user.coverImage = coverImage.url
    await user.save({validateBeforeSave:false})
    res.status(200).json(new ApiResponse(200,user,"COVERIMAGE UPDATED SUCCESSFULLY"))
})
export{
    registerUser,
    loginUser,
    logOutUser,
    refreshAccessToken,
    updateAcountDetail,
    changePassword,
    currentUser,
    changeAvatar,
    changeCoverImage
}