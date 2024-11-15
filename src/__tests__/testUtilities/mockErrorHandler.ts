import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../../types/responseError';


/**
 * Mock error handling middleware to be used in testing. Allows the errors to be caught and sent
 * in the response as expected, but does not log the request options. This allows us to bypass
 * sending valid email options with each test.
 * 
 * @param {ResponseError} err - The error object containing error details. 
 * @param {Request} req - The Express request object associated with the error.
 * @param {Response} res - The Express response object used to send the error response.
 * @param {NextFunction} next - The next middleware function in the pipeline.
 * 
 * @returns {void} - This middleware does not return anything. It ends the response cycle with the error message.
 */
export const mockErrorHandler = (err: ResponseError, req: Request, res: Response, next: NextFunction): void => {
    // Set default status if not provided
    if (!err.status) {
        err.status = 500;
    }

    // Default error message if not properly handled in middleware.
    const errorMessage = err.message || 'Error message not configured.';

    // Send response to client
    res.status(err.status).json({
        message: errorMessage,
        errors: err.errors || undefined, // Attach validation errors if present
    });
};
