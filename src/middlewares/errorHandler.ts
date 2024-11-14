import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../types/responseError';
import { errorLogger } from './logging/errorLogger';


/**
 * Error handling middleware for Express.
 * This middleware catches errors passed through `next()` in route handlers or other middleware,
 * logs the error using `errorLogger`, and sends an error response to the client.
 * It should be placed after all route handlers to catch errors.
 * 
 * @param {ResponseError} err - The error object containing error details. 
 * @param {Request} req - The Express request object associated with the error.
 * @param {Response} res - The Express response object used to send the error response.
 * @param {NextFunction} next - The next middleware function in the pipeline.
 * 
 * @returns {void} - This middleware does not return anything. It ends the response cycle with the error message.
 */
export const errorHandler = (err: ResponseError, req: Request, res: Response, next: NextFunction): void => {
    // Set default status if not provided
    if (!err.status) {
        err.status = 500;
    }

    // Default error message if not properly handled in middleware.
    const errorMessage = err.message || 'Unknown error.';
    
    // Log Error
    errorLogger(req, res, next, errorMessage);

    // Send response to client
    res.status(err.status).json({
        message: errorMessage,
        errors: err.errors || undefined, // Attach validation errors if present
    });
};
