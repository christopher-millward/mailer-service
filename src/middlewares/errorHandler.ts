import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../types/responseError';

// Error handling middleware (typically placed after all route handlers)
export const errorHandler = (err: ResponseError, req: Request, res: Response, next: NextFunction): void => {
    if (!err.status) {
        err.status = 500; // Default to internal server error
    }
    res.status(err.status).json({
        message: err.message || 'Something went wrong.',
        errors: err.errors || undefined, // Attach validation errors if present
    });
};
