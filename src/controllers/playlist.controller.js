import mongoose, { isValidObjectId } from "mongoose"
import { Playlist } from "../models/playlist.model.js"
import { ApiError } from "../utils/ApiError.js"
import { ApiResponse } from "../utils/ApiResponse.js"
import { asyncHandler } from "../utils/asyncHandler.js"


const createPlaylist = asyncHandler(async (req, res) => {
    const { name, description } = req.body
    //TODO: create playlist

    if (!name?.trim()) {
        throw new ApiError(400, "Playlist name required");
    }

    if (!description?.trim()) {
        throw new ApiError(400, "Playlist description required");
    }

    const playlist = await Playlist.create({
        name,
        description,
        owner: req.user._id,
        videos: []
    });

    return res
        .status(201)
        .json(201, playlist, "Playlist created successfully")
});

const getUserPlaylists = asyncHandler(async (req, res) => {
    const { userId } = req.params
    //TODO: get user playlists

    if (!isValidObjectId(userId)) {
        throw new ApiError(400, "Invalid User ID !");
    }

    const playlists = await Playlist
        .findOne({ owner: userId })
        .populate("videos");

    return res
        .status(200)
        .json(200, playlists, "Playlist fetched successfully");
});

const getPlaylistById = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    //TODO: get playlist by id

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID !");
    }

    const playlist = await Playlist
        .findById(playlistId)
        .populate("videos");

    if (!playlist) {
        throw new ApiError(404, "Playlist not found !");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist fetched successfully"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video ID");
    }

    const playlist = await Playlist.findById(playlist);

    if (!playlist) {
        throw new ApiError(404, "Playlist not found !");
    }

    if (playlist.videos.includes(videoId)) {
        throw new ApiError(400, "Video already in the playlist");
    }

    playlist.videos.push(videoId);
    await playlist.save();

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video added to playlist"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
    const { playlistId, videoId } = req.params
    // TODO: remove video from playlist

    if (!isValidObjectId(playlistId) || !isValidObjectId(videoId)) {
        throw new ApiError(400, "Invalid Playlist or Video ID !");
    }

    const playlist = await Playlist.findByIdAndUpdate(
        playlistId,
        { $pull: { videos: videoId } },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found !");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Video removed from playlist"));
});

const deletePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params
    // TODO: delete playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid Playlist ID !");
    }

    const playlist = await Playlist.deleteOne({
        _id: playlistId,
        owner: req.user._id // ensure only owner can delete
    });

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or unauthorized !");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, null, "Playlist deleted successfully"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
    const { playlistId } = req.params;
    const { name, description } = req.body;
    //TODO: update playlist

    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID !");
    }
    
    const playlist = await Playlist.findOneAndUpdate(
        { _id: playlistId, owner: req.user._id }, // Ensure only owner can edit
        { name, description },
        { new: true }
    );

    if (!playlist) {
        throw new ApiError(404, "Playlist not found or not authorized to update");
    }

    return res
        .status(200)
        .json(new ApiResponse(200, playlist, "Playlist updated successfully"));
});

export {
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    deletePlaylist,
    updatePlaylist
}