import mongoose from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const getVideoComments = asyncHandler(async (req, res) => {
    //TODO: get all comments for a video
    const { videoId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid Video ID!");
    }

    const comments = await Comment
        .find({ video: videoId })
        .populate("user", "name avatar")
        .skip((page - 1) * limit)
        .limit(Number(limit))
        .sort({ createdAt: -1 });

    const totalComments = await Comment.countDocuments({ video: videoId });

    return res
        .status(200)
        .json(ApiResponse(200, { comments, totalComments }, "Comments fetched successfully"));
});

const addComment = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { text } = req.body;
    // TODO: add a comment to a video

    if (!text?.trim()) {
        throw new ApiError(400, "Comment text is required");
    }

    if (!mongoose.Types.ObjectId.isValid(videoId)) {
        throw new ApiError(400, "Invalid VideoID");
    }

    const comment = await Comment.create({
        text,
        video: videoId,
        user: req.user._id
    });

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment added successfully"));
});

const updateComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    const { text } = req.body;
    // TODO: update a comment

    if (!text?.trim()) {
        throw new ApiError(400, "Updated comment text required");
    }

    const comment = await Comment.findOneAndUpdate(
        { _id: commentId, user: req.user._id }, // Ensure only owner can edit
        { text },
        { new: true }
    );

    if (!comment) {
        throw new ApiError(404, "Comment not found or not authorized to update");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, comment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async (req, res) => {
    const { commentId } = req.params;
    // TODO: delete a comment

    const comment = await Comment.findOneAndDelete({
        _id: commentId,
        user: req.user._id
    });

    if (!comment) {
        throw new ApiError(404, "Comment not found or not authorized to delete!");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Comment deleted successfully"));
});

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};