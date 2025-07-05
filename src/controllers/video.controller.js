import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js" 
import { uploadOnCloudinary } from "../utils/cloudinary.util.js";
import { ApiResponse } from "../utils/Apiresponse.js";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import { Video } from "../models/video.model.js";


// get all videos

const getAllVideos = asyncHandler(async(req,res)=>{
    const{page = 1,limit = 10,query = "",sortBy = "createdAt",sortType = "desc",userId} = req.query

const matchStage = {isPublished:true}
if(query){
    matchStage.title = {$regex:query,$options:"i"}
}
if(userId){
    matchStage.owner= mongoose.Types.ObjectId(userId)
}
const sortStage ={ [sortBy] : sortType === "desc"?1:-1}

const skip = (parseInt(page) - 1) * parseInt(limit)

const videos = await Video.aggregate([{
    $match:matchStage
},
{
    $lookup:{
        from:"users",
        localField:"owner",
        foreignField:"_id",
        as:"owner"
    }
},
{
    $unwind:"$owner"
},
{
    $project:{
        title: 1,
        description: 1,
        videoFile: 1,
        thumbnail: 1,
        duration: 1,
        views: 1,
        createdAt: 1,
        "owner._id": 1,
        "owner.username": 1,
        "owner.avatar": 1
    }
},
{$sort:sortStage},
{$skip:skip},
{$limit:parseInt(limit)}
])
if(!videos){
    throw new ApiError(400,"VIDEOS NOT FOUND")
}
const total = await Video.countDocuments(matchStage)

res.status(200).json(
    new ApiResponse(200, {
      videos,
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalResults: total
    }, "VIDEOS FETCHED SUCCESSFULLY")
  );
})
// publish a video

const publishVideo = asyncHandler(async(req,res)=>{
    const {title ,description} = req.body
    if(!title || !description){
        throw new ApiError(400,"ALL FIELDS ARE REQUIRED")
    }
    const localVideoPath = req.files?.video[0]?.path
    if(!localVideoPath){
        throw new ApiError(400,"VIDEO IS REQUIRED")
    }
    const cloudinaryVideo = await uploadOnCloudinary(localVideoPath)
    if(!cloudinaryVideo){
        throw new ApiError(400,"UNABLE TO UPLOAD VIDEO ON CLOUDINARY")
    }
    const thumbnailLocalPath = req.files?.thumbnail[0]?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"THUMBNAIL IS REQUIRED")
    }

    console.log("local :" ,thumbnailLocalPath)
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400,"UNABLE TO UPLOAD THUMBNAIL ON CLOUDINARY")
    }
    
    const video = await Video.create({
        title,
        description,
        videoFile:cloudinaryVideo.url,
        thumbnail:thumbnail.url,
        owner:req.user?._id,
        duration:cloudinaryVideo.duration
    })
    if(!video){
        throw new ApiError("SOMETHING WENT WRONG WHILE UPLOADING VIDEO ON DATABASE")
    }
    res.status(200).json(new ApiResponse(200,video,"VIDEO UPLOADED SUCCESSFULL"))
})

// get video by id

const getVideo = asyncHandler(async(req,res)=>{
    const {videoid} = req.params
    const video = await Video.findById(videoid).select("-isPublished").populate("owner","username avatar")
    if(!video){
        throw new ApiError(400,"VIDEO NOT FOUND")
    }
    res.status(200).json(new ApiResponse(200,video,"VIDEO FETCHED SUCCESSFULL"))
})

// update video

const updateVideo = asyncHandler(async(req,res)=>{
    const {videoid} = req.params
    const {title,description} = req.body
    if(!title || !description){
        throw new ApiError(400,"ALL FIELDS ARE REQUIRED")
    }
    const thumbnailLocalPath = req.file?.path
    if(!thumbnailLocalPath){
        throw new ApiError(400,"THUMBNAIL IS REQUIRED")
    }
    const thumbnail = await uploadOnCloudinary(thumbnailLocalPath)
    if(!thumbnail){
        throw new ApiError(400,"UNABLE TO UPLOAD THUMBNAIL ON CLOUDINARY")
    }
    const video = await Video.findByIdAndUpdate(videoid,
        {
            $set:{
                title,
                description,
                thumbnail:thumbnail.url
            }
        },
        {
            new:true
        }
    )

     if (!video) {
    throw new ApiError(404, "VIDEO NOT FOUND");
  }

    res.status(200).json(new ApiResponse(200,video,"VIDEO UPDATED SUCCESSFULLY"))
})

// delete video
const deleteVideo = asyncHandler(async(req,res)=>{
    const {videoid} = req.params
    console.log("video is :",videoid)
    const deletedVideo = await Video.findOneAndDelete({$and:[{_id:videoid},{owner:req.user._id}]},{projection:{title:1 , thumbnail:1}})
    console.log("deleted :",deletedVideo)
    if(!deletedVideo){
        throw new ApiError(400,"UNABLE TO DELETE VIDEO")
    }
    res.status(200).json(new ApiResponse(200,deletedVideo,"VIDEO DELETED SUCCESSFULLY"))
})

// toggle isPublished

const toggleIsPublished = asyncHandler(async(req,res)=>{
    const {videoid} = req.params
    const video = await Video.findOne({$and:[{_id:videoid},{owner:req.user._id}]})
    if(!video){
        throw new ApiError(400,"UNABLE TO FIND VIDEO")
    }
    video.isPublished = false
    await video.save({validateBeforeSave:false})
    res.status(200).json(new ApiResponse(200,video,"ISPUBLISHED UPDATED SUCCESSFULLY"))
})
export{
    publishVideo,
    getVideo,
    updateVideo,
    deleteVideo,
    toggleIsPublished,
    getAllVideos
}