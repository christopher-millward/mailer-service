import { check, ValidationChain } from 'express-validator';
import { MailOptions } from '../../schema/mailOptions';

/**
 * @description Validation rules for the email data. Also sanitizes all incoming data.
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
check('from').isEmail().withMessage('Invalid sender email address').escape(),

// Ensure 'to' is an array of valid email addresses
check('to').isArray().withMessage('To must be an array of email addresses'),
check('to.*').isEmail().withMessage('Invalid email address in To field').escape(),

// Validate subject
check('subject').notEmpty().withMessage('Subject cannot be empty').escape(),

// Ensure 'cc' is an optional array of valid email addresses
check('cc').optional().isArray().withMessage('Cc must be an array of email addresses'),
check('cc.*').optional().isEmail().withMessage('Invalid email address in Cc field').escape(),

// Ensure 'bcc' is an optional array of valid email addresses
check('bcc').optional().isArray().withMessage('Bcc must be an array of email addresses'),
check('bcc.*').optional().isEmail().withMessage('Invalid email address in Bcc field').escape(),

// Validate optional text
check('text').optional().notEmpty().withMessage('Message cannot be empty').escape(),

// IMPLEMENT HTML SANITIZING FOR HTML BODY
// I'm thinking just remove script tags/ anything that can run on error?
// Is it possible to disable all javascript? This isn't escential though. Come back to this when you have time.

// Validate optional attachments array
check('attachments').optional().isArray().withMessage('Attachments must be an array of objects'),

// Ensure that only one of `text` and `html` is present
check('text').custom((value, { req }) => {
    const hasText = !!value;
    const hasHtml = !!req.body.html;

    // Ensure exactly one is provided
    if ((hasText && hasHtml) || (!hasText && !hasHtml)) {
    throw new Error('Each attachment must contain either `text` or `html`, but not both or neither');
    }
    return true;
})
];