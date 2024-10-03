import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';

/**
 * @description Middleware to apply rate limiting to the API. Limits the number of requests a client can make in a given time window.
 * @returns {rateLimit.RateLimitRequestHandler} Rate limiting middleware for the Express app.
 */
const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window (in ms)
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

/**
 * @description Middleware to apply rate limiting. Calls the next middleware if the rate limit has not been exceeded.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function or sends a rate limit error message.
 */
export const rateLimiter = (req: Request, res: Response, next: NextFunction): void => {
    limiter(req, res, next); // Apply rate limiting
};
