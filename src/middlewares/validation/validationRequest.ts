import { validationResult, Result, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

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
        return res.status(400).json({ errors: errors.array() });
    }
    next(); // Call next middleware
};