import cors from 'cors';
import { Request, Response, NextFunction } from 'express';
import { handlePreflightRequest } from './handlePreflight';
import { corsOptions } from '../../config/corsOptions';

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

    // Handle preflight requests
    if (req.method === 'OPTIONS') {
        return handlePreflightRequest(req, res, next, corsOptions);
    }

    // Apply cors with specified options.
    cors(corsOptions)(req, res, (err) => {
        if (err) {
            return next(err);
        } else {
            next(); // Continue to the next middleware if no error
        }
    });
};