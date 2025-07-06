import { ApiResponse } from "../utils/Apiresponse.js";
import { asyncHandler } from "../utils/AsyncHandler.js";
import { ApiError } from "../utils/ApiError.js"
import { Like } from "../models/like.model.js"
import mongoose from "mongoose";

// toggle like video

const toggleLikeVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    const likedVideo = await Like.findOne({ $and: [{ video: videoId }, { owner: req.user._id }] })
    if (likedVideo) {
        await likedVideo.deleteOne()
        res.status(200).json(new ApiResponse(200, {}, "VIDEO DISLIKED SUCCESSFULLY"))
    }
    else {
        let video = Like.create({
            owner: req.user._id,
            video: videoId
        })
        res.status(200).json(new ApiResponse(200, video, "VIDEO LIKED SUCCESSFULLY"))
    }
})

// toggle comment like

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params
    const likedComment = await Like.findOne({ $and: [{ owner: req.user._id }, { comment: commentId }] })
    if (!likedComment) {
        const comment = await Like.create({ owner: req.user._id, comment: commentId })
        res.status(200).json(new ApiResponse(200, comment, "liked comment successfully"))
    }
    else {
        await likedComment.deleteOne()
        res.status(200).json(new ApiResponse(200, {}, "disliked comment successfully"))
    }
})

// toggle tweet like

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params
    const likedTweet = await Like.findOne({ $and: [{ owner: req.user._id }, { tweet: tweetId }] })
    if (!likedTweet) {
        const tweet = await Like.create({ owner: req.user._id, tweet: tweetId })
        res.status(200).json(new ApiResponse(200, tweet, "liked tweet successfully"))
    }
    else {
        await likedTweet.deleteOne()
        res.status(200).json(new ApiResponse(200, {}, "disliked tweet successfully"))
    }
})

//  get all like videos

const getAllLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        owner: new mongoose.Types.ObjectId(req.user._id),
        video: { $ne: null }
      }
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    username: 1,
                    fullName: 1,
                    avatar: 1
                  }
                }
              ]
            }
          },
          {
            $addFields: {
              owner: { $first: "$owner" }
            }
          },
          {
            $project: {
              title: 1,
              description: 1,
              thumbnail: 1,
              videoFile: 1,
              duration: 1,
              owner: 1,
              createdAt: 1
            }
          }
        ]
      }
    },
    {
      $addFields: {
        video: { $first: "$video" }
      }
    },
    {
      $project: {
        _id: 0,
        video: 1
      }
    }
  ]);

  res.status(200).json(
    new ApiResponse(200, likedVideos.map(v => v.video), "Liked videos fetched successfully")
  );
});


export {
    toggleLikeVideo,
    toggleCommentLike,
    toggleTweetLike,
    getAllLikedVideos
}