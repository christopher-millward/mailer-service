import rateLimit, { RateLimitRequestHandler } from 'express-rate-limit';
import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * @description Configuration for the rate limiter. This one in particular is intended to be applied 
 *              to one specific route. 
 * 
 *              Note:   This middleware uses req.ip to determine IP address. If this API is hosted
 *                      on a server that uses a reverse proxy for load balancing, you'll have to
 *                      configure the index.ts file to set 'trust proxy' to `true` and trust the 
 *                      ip as recommended by the server host. 
 *                      See https://express-rate-limit.mintlify.app/guides/troubleshooting-proxy-issues
 * 
 * @link see https://www.npmjs.com/package/express-rate-limit for all options.S
 */
const limiter: RateLimitRequestHandler = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window (in ms)
    max: 100, // Limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    validate : { trustProxy: config.environment ==='test' ? false: true} // turn off warning in test environment.
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
