import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

/**
 * @description Middleware to enforce HTTPS for incoming requests. Only time we're OK with unsecure
 *              requests is during development, from localhost.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Response|void} Redirects to HTTPS if the request is not secure, otherwise calls the next middleware.
 */
export const enforceHttps = (req: Request, res: Response, next: NextFunction) => {
    const isHttps: boolean = req.secure; // use `req.headers['X-Forwarded-Proto'] ==='https'` if behind proxy.
    const isDevelopment = config.environment=='development' && req.headers.host?.includes('localhost');

    if (!isHttps){
        isDevelopment ? next(): res.redirect(`https://${req.headers.host}${req.url}`); // Redirect to HTTPS
    }

    next();
};
