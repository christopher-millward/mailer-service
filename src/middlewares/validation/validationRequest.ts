import { validationResult, Result, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';
import { ResponseError } from '../../types/responseError';

/**
 * @description Middleware to validate the request against the defined validation rules.
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {Response|void} Sends a JSON response with validation errors if any, otherwise calls the next middleware.
 */
export const validateRequest = (req: Request, res: Response, next: NextFunction) => {
    const errors: Result<ValidationError> = validationResult(req);
    if (!errors.isEmpty()) {
        const error: ResponseError = new Error('Validation failed');
        error.status = 400;
        error.errors = errors.array(); // Attach validation errors
        return next(error); // Pass error to the error handling middleware
    }
    next(); // Call next middleware
};