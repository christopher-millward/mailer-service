import { Request, Response, NextFunction } from 'express';
import { baseLogger } from './baseLogger';

/**
 * Middleware for logging failed HTTP requests (errors).
 * Logs the error message along with the request details.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @param {string} errorMessage - The error message intended to be logged.
 * 
 * @returns {void}
 */
export const errorLogger = (req: Request, res: Response, next: NextFunction, errorMessage: string) => {
    baseLogger(req, res, next, 'error', `Error Message: ${errorMessage}`); // Using 'error' log level for failed requests
    
    // Don't call next() -> since this is error, response is going to be sent right after.
};
