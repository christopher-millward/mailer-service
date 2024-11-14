import { Request, Response, NextFunction } from 'express';
import { baseLogger } from './baseLogger';

/**
 * Middleware for logging successful HTTP requests.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void}
 */
export const successLogger = (req: Request, res: Response, next: NextFunction) => {
    baseLogger(req, res, next, 'info'); // Using 'info' for successful requests
    next();
};
