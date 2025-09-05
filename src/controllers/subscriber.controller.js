import mongoose, { isValidObjectId } from "mongoose";
import { User } from "../models/user.model.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asynHandler.js";

const toggleSubscription = asyncHandler(async (req, res) => {
    const { channelId } = req.params;
    // TODO: toggle subscription

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID !");
    }

    const existingSubscribe = await Subscription.findOne({
        subscriber: req.user._id,
        channel: channelId
    });

    if (existingSubscribe) {
        // unsubscribe
        await existingSubscribe.remove();
    } else {
        await Subscription.create({
            channel: channelId,
            subscriber: req.user._id
        });
    }

    return res
        .status(200)
        .json(new ApiResponse(200, existingSubscribe, existingSubscribe ? "Unsubscribed successfully" : "Subscribed successfully"));
});

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const { channelId } = req.params;

    if (!isValidObjectId(channelId)) {
        throw new ApiError(400, "Invalid channel ID !");
    }

    const { subscribers, subscriberCount } = await Promise.all([
        Subscription.find({ channel: channelId }).populate("subscriber", "name email"),
        Subscription.countDocuments({ channel: channelId })
    ]);

    return res
        .status(200)
        .json(new ApiResponse(200, subscribers, "Subscribers fetched successfully"));
})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params;

    if (!isValidObjectId(subscriberId)) {
        throw new ApiError(400, "Invalid Subscriber ID !");
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
        .populate("channel", "name email avatar");

    return res
        .status(200)
        .json(new ApiResponse(200, channels, "Subscribed channels fetched successfully"));
});

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}