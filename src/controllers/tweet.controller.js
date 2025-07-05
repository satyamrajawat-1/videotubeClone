import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Tweet } from "../models/tweet.model.js"
import mongoose from "mongoose";

// create tweet

const createTweet = asyncHandler(async(req,res)=>{
    const {content} = req.body
    if(!content){
        throw new ApiError(400,"CONTENT IS REQUIRED")
    }
    let tweet = await Tweet.create({
        content,
        owner:req.user._id
    })
    if(!tweet){
        throw new ApiError(400,"SOMETHING WENT WRONG WHILE CREATING TWEET")
    }
    tweet = await tweet.populate("owner", "username avatar");
    res.status(200).json(new ApiResponse(200,tweet,"tweet created successfully"))
})


// get user tweets

const getUserTweets = asyncHandler(async(req,res)=>{
    const tweets = await Tweet.aggregate([
        {
            $match:{
                owner:new mongoose.Types.ObjectId(req.user._id)
            }
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
            $project:{
                content:1,
                createdAt:1,
                updatedAt:1,
                "owner.username":1,
                "owner.avatar":1
            }
        }
    ])
    if(!tweets){
        throw new ApiError(400,"TWEETS NOT FOUND")
    }
    res.status(200).json(new ApiResponse(200,tweets,"TWEETS FETCHED SUCCESSFULLY"))
})

// update tweet

const updateTweet = asyncHandler(async(req,res)=>{
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!content || content.trim() === "") {
       throw new ApiError(400, "Tweet content is required");
  }
    
    let tweet = await Tweet.findOneAndUpdate({$and:[{owner:req.user._id},{_id:tweetId}]},
        {
            content
        },
        {
            new:true
        }
    )
    tweet = await tweet.populate("owner", "username avatar");
    res.status(200).json(new ApiResponse(200,tweet,"tweet updated successfully"))
})

// delete tweet

const deleteTweet = asyncHandler(async(req,res)=>{
    const { tweetId } = req.params;
    if(!tweetId){
        throw new ApiError(400,"TWEET NOT FOUND")
    }
    let tweet = await Tweet.findOneAndDelete({$and:[{owner:req.user._id},{_id:tweetId}]})
    tweet = await tweet.populate("owner", "username avatar");
    res.status(200).json(new ApiResponse(200,tweet,"tweet deleted successfully"))
})
export{
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}