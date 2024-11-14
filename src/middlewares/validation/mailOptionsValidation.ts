import { check, ValidationChain } from 'express-validator';
import { MailOptionsKeys } from '../../schema/mailOptions';
import { ResponseError } from '../../types/responseError';

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
        const error: ResponseError = new Error('Each email must contain either `text` or `html`, but not both or neither');
        error.status = 400;
        throw error;
    }
    return true;
}),

// Ensure request body conforms to MailOptions schema (no unwanted fields)
check('*').custom((value, { req }) => {
    const requestBody = req.body;
    const allowedFields = MailOptionsKeys; // keys from MailOptions
    const requestBodyKeys = Object.keys(requestBody);

    requestBodyKeys.forEach((key)=>{
        if(!allowedFields.includes(key)){
            const error: ResponseError = new Error(`Attachment contains an invalid field: ${key}`);
            error.status = 400;
            throw error;
        }
    })

    return true;
})
];