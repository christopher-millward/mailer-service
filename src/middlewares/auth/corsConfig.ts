import { config } from '../../config/env';
import cors, {CorsOptions} from 'cors';
import { Request, Response, NextFunction } from 'express';

/**
 * @description Middleware to enable CORS with specified options. Verifies trusted origins,
 *              handles preflights, and enforces allowed request methods. This will be used
 *              when a request comes from the broswer.
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
            if (!origin) {
                // If the origin header is not present (e.g., server-to-server requests), allow the request
                callback(null, true);
            } else if (allowedOrigins.includes(origin)) {
                // If the origin is in the list of allowed origins, allow the request
                callback(null, origin);
            } else {
                // Otherwise, block the request with an error
                const error: Error = new Error("Unauthorized Access: untrusted origin");
                error.name = "Auth Error";
                callback(error, false);
            }
        },
        methods: ['POST', 'OPTIONS'],
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