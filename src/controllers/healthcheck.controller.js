import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asynHandler.js';

const healthCheck = asyncHandler(async (_, res) => {
    //TODO: build a healthcheck response that simply returns the OK status as json with a message
    return res
        .status(200)
        .json(new ApiResponse(200, "OK, Service wa healthy desu"));
})

export {
    healthCheck
};