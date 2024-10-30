import { Request, Response, NextFunction } from 'express';
import { apiKeyAuth } from './apiKeyAuth';
import { corsPolicy } from './corsConfig';

/**
 * @description Middleware to conditionally apply the API key authentication middleware.
 *              It activates the apiKeyAuth middleware only for requests coming from servers 
 *              (i.e., those without an Origin header) or those with an empty Origin. It also
 *              applies CORS policy to all requests.
 * @param {Request} req - Express Request object.
 * @param {Response} res - Express Response object.
 * @param {NextFunction} next - Express NextFunction to move to the next middleware.
 * @returns {void} - Calls the next middleware or applies the API key auth as necessary.
 */
export const authHandler = (req: Request, res: Response, next: NextFunction): void => {
    // Apply CORS to all incoming requests
    corsPolicy(req, res, ()=>{
        // If no origin header, require APIkey
        if (!req.headers.origin || req.headers.origin === '') {
            apiKeyAuth(req, res, next);
        } else {
            next();
        }
    });
};
