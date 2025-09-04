import mongoose, { isValidObjectId } from "mongoose";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asynHandler.js";

const createTweet = asyncHandler(async (req, res) => {
    //TODO: create tweet
    const { content } = req.body;

    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content required")
    }

    const tweet = await Tweet.create({
        content,
        owner: req.user._id // user from JWT middleware
    });

    return res
        .status(201)
        .json(201, tweet, "Tweet created successfully")
});

const getUserTweets = asyncHandler(async (req, res) => {
    // TODO: get user tweets
    const { userId } = req.params;

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID");
    }

    const tweets = await Tweet
        .find({ owner: userId })
        .sort({ createdAt: -1 });

    return res
        .status(200)
        .json(200, tweets, "Tweets fetched successfully");
});

const updateTweet = asyncHandler(async (req, res) => {
    //TODO: update tweet
    const { tweetId } = req.params;
    const { content } = req.body;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid tweet ID !");
    }

    if (!content?.trim()) {
        throw new ApiError(400, "Tweet content required");
    }

    const tweet = await Tweet.findOneAndUpdate(
        { _id: tweetId, owner: req.user._id }, // Ensure only owner can update
        { content },
        { new: true }
    );

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res
        .status(200)
        .json(200, tweet, "Tweet updated successfully")
})

const deleteTweet = asyncHandler(async (req, res) => {
    //TODO: delete tweet
    const { tweetId } = req.params;

    if (!isValidObjectId(tweetId)) {
        throw new ApiError(400, "Invalid Tweet ID !");
    }

    const tweet = await Tweet.findOneAndDelete({
        _id: tweetId,
        owner: req.user._id
    });

    if (!tweet) {
        throw new ApiError(404, "Tweet not found or unauthorized");
    }

    return res
        .status(200)
        .json(200, null, "Tweet deleted successfully");
})

export {
    createTweet,
    getUserTweets,
    updateTweet,
    deleteTweet
}