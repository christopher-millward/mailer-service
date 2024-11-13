import { Request, Response, NextFunction } from 'express';
import { config } from '../../config/env';

/**
 * @description Middleware to authenticate requests using an API key. This will be used when a
 *              request comes from a server.
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object.
 * @param {NextFunction} next - Express NextFunction to move to the next middleware.
 * @returns {void} - Sends an unauthorized response if the API key is incorrect, otherwise calls the next middleware.
 */
export const apiKeyAuth = (req: Request, res: Response, next: NextFunction): void => {
   
    const apiKey = req.headers['x-api-key'] as string | undefined;
    const allowedKeys: string[] = config.apiKeys;

    if (apiKey && allowedKeys.includes(apiKey)) {
        // Call the next middleware if authentication succeeds
        next();
    }else{
        // Send error to error handler
        const error: Error = new Error("Unauthorized Access: invalid API key.");
        error.name = "Auth Error";

        next(error);
    }  
};
