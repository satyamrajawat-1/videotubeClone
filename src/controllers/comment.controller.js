import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Comment } from "../models/comment.model.js"
import { Video } from "../models/video.model.js";
import mongoose from "mongoose";

// get all comments
const getAllComments = asyncHandler(async(req,res)=>{
    const{page=1,limit=10,userId,videoId,query=""} = req.query
    const matchStage = {commentAt:new mongoose.Types.ObjectId(videoId)}
    if(query){
        matchStage.content = {$regex:query , $options:"i"}
    }
    if(userId){
        matchStage.owner = new mongoose.Types.ObjectId(userId)
    }
    const skip = (parseInt(page) - 1) * parseInt(limit)
    let comments = await Comment.aggregate([
        {
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
            $skip:skip
        },
        {
            $limit:parseInt(limit)
        },
        {
            $project:{
                content:1,
                "owner.username":1,
                "owner._id":1,
                "owner.avatar":1,
                commentAt:1
            }
        }

    ])
    if(!comments){
        throw new ApiError(400,"COMMENTS NOT FOUND")
    }
    res.status(200).json(new ApiResponse(200,comments,"ALL COMMENTS ARE DISPLAYED SUCCESSFULLY"))
})


// create a comment

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const { content } = req.body
    if (!content) {
        throw new ApiError(400, "content is required")
    }
    const videoExists = await Video.findById(videoId);
    if (!videoExists) {
        throw new ApiError(404, "Video not found");
    }
        let comment = await Comment.create({
            content,
            owner: req.user._id,
            commentAt: videoId
        })
        await comment.populate("owner", "username avatar")
        res.status(200).json(new ApiResponse(200, comment, "comment created successfully"))
    })

// update a comment
const updateComment = asyncHandler(async(req,res)=>{
    const {videoId , commentId} = req.params
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"content required")
    }
    let comment = await Comment.findOne({$and:[{_id:commentId},{owner:req.user._id},{commentAt:videoId}]})
    if(!comment){
        throw new ApiError(400 ,"comment not found")
    }
    comment.content = content
    await comment.save({validateBeforeSave:false})
    await comment.populate("owner", "username avatar")
    res.status(200).json(
    new ApiResponse(200, comment, "Comment updated successfully")
  )
})

// delete comment

const deleteComment = asyncHandler(async(req,res)=>{
    const {videoId , commentId} = req.params
    let comment = await Comment.findOne({$and:[{_id:commentId},{owner:req.user._id},{commentAt:videoId}]})
    if(!comment){
        throw new ApiError(400 ,"comment not found")
    }
    await comment.deleteOne()
    res.status(200).json(
    new ApiResponse(200, {}, "Comment deleted successfully")
  )
})

export {
    addComment,
    updateComment,
    deleteComment,
    getAllComments
}