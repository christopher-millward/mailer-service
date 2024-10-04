import { config } from '../config/env';
import cors, {CorsOptions} from 'cors';
import { Request, Response, NextFunction } from 'express';
import { type } from 'os';

/**
 * @description Middleware to enable CORS with specified options.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void | Response} Calls the next middleware function or sends a 403 error response.
 */
export const corsPolicy = (req: Request, res: Response, next: NextFunction): void | Response=> {
    
    const allowedOrigins: string[] = config.trustedOrigins;
    const reqOrigin: string|undefined = req.headers.origin;

    const options: CorsOptions = {
        origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
            if (origin && allowedOrigins.includes(origin)) {
                callback(null, origin); // Pass origin to callback to allow it
            } else {
                callback(new Error('Untrusted Origin')); // Reject the origin with an error
            }
        },
        methods: ['POST', 'OPTIONS'], // Only sending email info. No preflight required
        credentials: false, // Do not require user authentication.
        maxAge: 60 * 15 // Preflight cache duration.
    };

    // Handle preflight requests directly
    if (req.method === 'OPTIONS') {
        if (!options.methods) {
            // Optionally handle the case where methods are undefined
            return res.status(500).json({ message: 'CORS configuration error: No methods defined.' });
        }

        const methods = Array.isArray(options.methods) ? options.methods.join(',') : options.methods;
        res.setHeader('Access-Control-Allow-Methods', methods);
        res.setHeader('Access-Control-Allow-Origin', reqOrigin || '*'); // Allow the request origin
        
        return res.status(204).end(); // End the response without content
    }

    // Verify request method
    if (options.methods && !options.methods.includes(req.method)) {
        return res.status(403).json({ message: 'Blocked by CORS policy.' });
    }

    // Use cors with updated options.
    cors(options)(req, res, (err) => {
        if (err) {
            // Handle CORS error (e.g., if origin not allowed)
            res.status(403).json({ message: 'Blocked by CORS policy.' });
        } else {
            next(); // Continue to the next middleware if no error
        }
    });
};