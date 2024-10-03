import { config } from '../config/env';
import cors, {CorsOptions} from 'cors';
import { Request, Response, NextFunction } from 'express';

/**
 * @description Middleware to enable CORS with specified options.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function or sends a 403 error response.
 */
export const corsPolicy = (req: Request, res: Response, next: NextFunction): void => {
    
    const allowedOrigins: string[] = config.trustedOrigins.map(origin => origin);
    const origin: string|undefined = req.headers.origin;

    const options: CorsOptions = {
            origin: allowedOrigins,
            methods: ['POST', 'OPTIONS'], // POST for sending, OPTIONS for preflight.
            credentials: false, // Do not require user authentication.
            maxAge: 60 * 15 // Preflight cache duration.
            // allowedHeaders: [], // Specify allowed headers if necessary.
            // exposedHeaders: [], // Specify exposed headers if necessary.
        };

    if (origin && allowedOrigins.includes(origin)) {
        cors(options)(req, res, next); // Invoke CORS middleware with options
    } else {
        // Respond with 403 Forbidden if the origin is not allowed
        res.status(403).json({ message: 'CORS policy does not allow access from this origin.' });
    }
};