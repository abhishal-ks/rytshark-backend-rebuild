import mongoose, { isValidObjectId } from "mongoose"
import { Video } from "../models/video.model.js"
import { User } from "../models/user.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"
import { uploadOnCloudinary } from "../utils/cloudinary.js"


const getAllVideos = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, query, sortBy = "createdAt", sortType = "desc", userId } = req.query;
    //TODO: get all videos based on query, sort, pagination

    page = parseInt(page);
    limit = parseInt(limit);

    const filter = {};
    if (query) filter.title = { $regex: query, $options: "i" };
    if (userId && isValidObjectId(userId)) filter.owner = userId;

    const sortOrder = sortType === "asc" ? 1 : -1;

    const videos = await Video.find(filter)
        .sort({ [sortBy]: sortOrder })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate("owner", "name email");

    const totalVideos = await Video.countDocuments(filter);

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {
                    videos,
                    totalVideos,
                    page,
                    totalPages: Math.ceil(totalVideos / limit)
                },
                "Videos fetched successfully"
            )
        )
});

const publishAVideo = asyncHandler(async (req, res) => {
    const { title, description } = req.body
    // TODO: get video, upload to cloudinary, create video
    if (!title?.trim() || !description?.trim()) {
        throw new ApiError(400, "Title and description are required !");
    }

    if (!req.file) {
        throw new ApiError(400, "Video file is required");
    }

    const videoUpload = await uploadOnCloudinary(req.file.path);
    if (!videoUpload?.secure_url) {
        throw new ApiError(400, "Failed to upload video !");
    }

    const video = await Video.create(
        {
            title,
            description,
            url: videoUpload.secure_url,
            owner: req.user._id
        }
    );

    return res
        .status(201)
        .json(
            new ApiResponse(
                201,
                video,
                "Video published successfully"
            )
        );
});

const getVideoById = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    //TODO: get video by id

    if (!isValidObjectId(req.params)) {
        throw new ApiError(400, "INVALID video ID !");
    }

    const video = await Video.findById(videoId)
        .populate("owner", "name email");
    if (!video) throw new ApiError(404, "Video not found !")

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video fetched successfully"
            )
        );
})

const updateVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params;
    const { title, description } = req.body;
    //TODO: update video details like title, description, thumbnail

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const updateFields = {};
    if (title) updateFields.title = title;
    if (description) updateFields.description = description;

    if (req.file) {
        const thumbnailUpload = await uploadOnCloudinary(req.file.path);
        if (thumbnailUpload?.secure_url) updateFields.thumbnail = thumbnailUpload.secure_url;
    }

    const video = await Video.findOneAndUpdate(
        { _id: videoId, owner: req.user._id },
        { $set: updateFields },
        { new: true }
    );

    if (!video) throw new ApiError(404, "Video not found or you're not the owner");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video updated successfully"
            )
        );
});

const deleteVideo = asyncHandler(async (req, res) => {
    const { videoId } = req.params
    //TODO: delete video

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID");

    const video = await Video.findOneAndDelete({ video: videoId, owner: req.user._id });
    if (!video) throw new ApiError(404, "Video not found or you're unauthorized to delete !");

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                "Video deleted successfully"
            )
        );
});

const togglePublishStatus = asyncHandler(async (req, res) => {
    const { videoId } = req.params;

    if (!isValidObjectId(videoId)) throw new ApiError(400, "Invalid video ID !");

    const video = await Video.findOne({ _id: videoId, owner: req.user._id });
    if (!video) throw new ApiError(404, "Video not found or you're unauthorized !");

    video.isPublished = !video.isPublished;
    await video.save();

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                video,
                `Video ${video.isPublished ? "published" : "unpublished"} successfully`
            )
        );
});

export {
    getAllVideos,
    publishAVideo,
    getVideoById,
    updateVideo,
    deleteVideo,
    togglePublishStatus
}