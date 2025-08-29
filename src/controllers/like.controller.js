import mongoose, { isValidObjectId } from "mongoose";
import { Like } from "../models/like.model"
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";
import { asyncHandler } from "../utils/asynHandler";

const toggleVideoLike = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const userId = req.user._id;
    //TODO: toggle like on video

    if (!isValidObjectId(videoId)) {
        throw new ApiError(400, "Video ID is Invalid!")
    }

    const existingLike = await Like.findOne({
        video: videoId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(new ApiResponse(200, existingLike, "Video Like removed successfully"));
    }

    const likeVideo = await Like.create({
        video: videoId,
        likedBy: userId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, likeVideo, "Video Liked Successfully"));
})

const toggleCommentLike = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const userId = req.user._id;
    //TODO: toggle like on comment

    if (!isValidObjectId(commentId)) {
        throw new ApiError(400, "Comment ID is Invalid!");
    }

    const existingLike = await Like.findOne({
        comment: commentId,
        likedBy: userId
    });

    if (existingLike) {
        await Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(new ApiResponse(200, existingLike, "Comment like removed successfully"));
    }

    const likeComment = await Like.create({
        comment: commentId,
        likedBy: userId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, likeComment, "Comment liked successfully"));
})

const toggleTweetLike = asyncHandler(async (req, res) => {
    const { tweetId } = req.params;
    const userId = req.user._id;
    //TODO: toggle like on tweet

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Tweet ID is Invalid!");
    }

    const existingLike = await Like.findOne({
        tweet: tweetId,
        likedBy: userId
    });

    if (existingLike) {
        Like.findByIdAndDelete(existingLike._id);

        return res
            .status(200)
            .json(200, existingLike, "Tweet Like removed successfully");
    }

    const likeTweet = await Like.create({
        tweet: tweetId,
        likedBy: userId
    });

    return res
        .status(200)
        .json(new ApiResponse(200, likeTweet, "Tweet liked successfully"));
})

const getLikedVideos = asyncHandler(async (req, res) => {
    const userId = req.user._id;
    //TODO: get all liked videos

    const likedVideos = await Like.find({
        likedBy: userId,
        video: { $exists: true }
    }).populate("video", "_id title url");

    return res
        .status(200)
        .json(new ApiResponse(200, likedVideos, "Liked videos fetched successfully"));
})

export {
    toggleVideoLike,
    toggleCommentLike,
    toggleTweetLike,
    getLikedVideos
}