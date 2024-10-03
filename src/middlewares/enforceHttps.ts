import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * @description Middleware to enforce HTTPS for incoming requests.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Response|void} Redirects to HTTPS if the request is not secure, otherwise calls the next middleware.
 */
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
    if (req.secure || (config.environment=='development' && req.headers.host?.includes('localhost'))) {
        next(); // Request is secure or from localhost
    } else {
        res.redirect(`https://${req.headers.host}${req.url}`); // Redirect to HTTPS
    }
};
