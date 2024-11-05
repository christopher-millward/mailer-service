import { check, ValidationChain } from 'express-validator';
import { MailOptions } from '../../schema/mailOptions';

/**
 * @description Validation rules for the email data.
 * @param {string} from - Validates the sender's email address.
 * @param {string[]} to - Ensures `to` is an array of valid email addresses.
 * @param {string} subject - Ensures the subject is not empty.
 * @param {string[]} cc - (Optional) Ensures `cc` is an array of valid email addresses.
 * @param {string[]} bcc - (Optional) Ensures `bcc` is an array of valid email addresses.
 * @param {string} text - (Optional) Ensures the message is sanitized.
 * @param {SimpleAttachment[]} attachments - (Optional) Ensures attachments is array of objects.
 */
export const mailOptionsValidationRules: ValidationChain[] = [
// Validate Sender email address
check('from').notEmpty().isEmail().withMessage('Invalid sender email address'),

// Ensure 'to' is an array of valid email addresses
check('to').isArray().withMessage('To must be an array of email addresses'),
check('to.*').isEmail().withMessage('Invalid email address in To field'),

// Validate subject
check('subject').notEmpty().withMessage('Subject cannot be empty'),

// Ensure 'cc' is an optional array of valid email addresses
check('cc').optional().isArray().withMessage('Cc must be an array of email addresses'),
check('cc.*').optional().isEmail().withMessage('Invalid email address in Cc field'),

// Ensure 'bcc' is an optional array of valid email addresses
check('bcc').optional().isArray().withMessage('Bcc must be an array of email addresses'),
check('bcc.*').optional().isEmail().withMessage('Invalid email address in Bcc field'),

// Validate optional text
check('text').optional().notEmpty().withMessage('Message cannot be empty'),

// Validate optional html
check('html').optional().notEmpty().withMessage('html cannot be empty'),

// Validate optional attachments array
check('attachments').optional().isArray().withMessage('Attachments must be an array of objects'),

// Ensure that only one of `text` and `html` is present
check('text').custom((value, { req }) => {
    const hasText = !!value;
    const hasHtml = !!req.body.html;

    // Ensure exactly one is provided
    if ((hasText && hasHtml) || (!hasText && !hasHtml)) {
        throw new Error('Each email must contain either `text` or `html`, but not both or neither');
    }
    return true;
}),

// Enforce allowed fields only (no extra fields)
check('attachments').custom((attachments) => {
    const allowedFields = ['filename', 'path', 'content', 'cid']; // keys from SimpleAttachment

    attachments.forEach((attachment: any) => {
        const keys = Object.keys(attachment);

        keys.forEach((key) => {
            if (!allowedFields.includes(key)) {
                throw new Error(`Attachment contains an invalid field: ${key}`);
            }
        });
    });

    return true;
}),

// Custom validation to ensure request body conforms to MailOptions schema
check('*').custom((value, { req }) => {
    const requestBody = req.body;
    const mailOptionsKeys = new Set(['from', 'to', 'subject', 'cc', 'bcc', 'text', 'html', 'attachments']); // keys from MailOptions
    const requestBodyKeys = new Set(Object.keys(requestBody));

    // Check for extra keys not in MailOptions
    const extraKeys = [...requestBodyKeys].filter(key => !mailOptionsKeys.has(key));
    if (extraKeys.length > 0) {
        throw new Error(`Invalid keys found in request body: ${extraKeys.join(', ')}`);
    }

    return true;
})



];