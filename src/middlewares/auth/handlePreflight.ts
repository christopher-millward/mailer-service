import { Request, Response, NextFunction } from 'express';
import { CorsOptions } from 'cors';

/**
 * @description Handles preflight OPTIONS requests for CORS. Sets necessary headers
 *              based on the provided CORS options and ends the request if it’s a preflight.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function for error handling.
 * @param {CorsOptions} options - CORS options object to define allowed origins and methods.
 * @returns {void | Response} Ends the response for preflight requests or sends an error response.
 */
export const handlePreflightRequest = (
    req: Request, 
    res: Response, 
    next: NextFunction, 
    options: CorsOptions
): void | Response => {
    try {
        const reqOrigin: string|undefined = req.headers.origin;
        const methods = Array.isArray(options.methods) ? options.methods.join(',') : options.methods;

        if (!methods) {
            throw new Error('CORS configuration error: No methods defined.');
        }

        res.setHeader('Access-Control-Allow-Methods', methods);
        res.setHeader('Access-Control-Allow-Origin', reqOrigin || '*'); // Use request origin or wildcard

        if (options.credentials) {
            res.setHeader('Access-Control-Allow-Credentials', 'true');
        }

        if (options.maxAge) {
            res.setHeader('Access-Control-Max-Age', options.maxAge.toString());
        }

        return res.status(204).end(); // End the response with no content for preflight requests
        
    } catch (error){
        next(error);
    }
};
