import { Request, Response, NextFunction } from 'express';
import { ValidationError, validationResult } from 'express-validator';
import { mailOptionsValidationRules } from './mailOptionsValidation';
import { attachmentValidationRules } from './attachmentValidation';
import { validateRequest } from './validationRequest';
import { Result } from 'express-validator';

/**
 * @description Combines all validation logic and conditionally applies them in one handler.
 *
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Continues to the next middleware if all validations pass, or returns validation errors.
 */
export const validationHandler = [
    ...mailOptionsValidationRules,

    // Conditionally apply attachment validation rules if attachments are present
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            if (hasAttachments(req)) {
                await validateAttachments(req);
            }
            next();
        } catch (error) {
            next(error);
        }
    },

    // Validate the request using custom validateRequest middleware
    validateRequest
];

/**
 * @description Checks if the request contains attachments.
 * @param {Request} req - Express request object.
 * @returns {boolean} True if attachments are present, false otherwise.
 */
function hasAttachments(req: Request): boolean {
    return Array.isArray(req.body.attachments) && req.body.attachments.length > 0;
}

/**
 * @description Validates attachments in the request and returns errors if any.
 * @param {Request} req - Express request object.
 * @returns {Promise<Array|null>} Validation errors or null if no errors.
 */
async function validateAttachments(req: Request): Promise<Array<ValidationError> | null> {
    await Promise.all(attachmentValidationRules.map(rule => rule.run(req)));
    const errors: Result<ValidationError> = validationResult(req);
    return errors.isEmpty() ? null : errors.array();
}
