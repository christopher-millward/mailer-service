import { check, ValidationChain, validationResult, Result, ValidationError } from 'express-validator';
import { Request, Response, NextFunction } from 'express';

/**
 * @description Validation rules for the email data.
 * @param {string} to Checks if the recipient email address is valid.
 * @param {string} subject Ensures the subject is not empty.
 * @param {string} text Ensures the message is not empty and sanitizes it.
 */
export const mailValidationRules: ValidationChain[] = [
  check('to').isEmail().withMessage('Invalid email address'),
  check('subject').notEmpty().withMessage('Subject cannot be empty').escape(),
  check('text').notEmpty().withMessage('Message cannot be empty').escape(),
];

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
  next();
};
