import { check, ValidationChain } from 'express-validator';
import { SimpleAttachmentKeys } from '../../schema/simpleAttachment';

/**
 * @description Validation rules for the email attachments. One of `href` or `content` must be present.
 * @param {string} filename - Validates and sanitizes the filename. 
 * @param {string} href - (Optional) Validates and sanitizes the filepath (URL). 
 * @param {Buffer} content - Validates the file contents (Buffer).
 * @param {string} cid - (Optional) Validates and sanitizes the cid.
 */
export const attachmentValidationRules: ValidationChain[] = [
// Validation of attachments being in an Array is performed in './mailOptionsValidation.ts'

// Validate each attachment in the array
check('attachments.*.filename').isString().withMessage('Attachment filename must be a string').escape(),
check('attachments.*.href').optional().isURL().withMessage('Attachment href must be a URL').escape(),
check('attachments.*.content').optional().isString().withMessage('Attachment content must be a string (or Buffer encoded as string).'),
check('attachments.*.cid').optional().isString().withMessage('cid must be a string').escape(),

// Ensure only one of `href` or `content` is present, but not both
check('attachments').custom((attachments) => {
    attachments.forEach((attachment: any) => {
        const hasPath = !!attachment.href;
        const hasContent = !!attachment.content;

        // Ensure exactly one is provided
        if ((hasPath && hasContent) || (!hasPath && !hasContent)) {
            throw new Error('Each attachment must contain either `href` or `content`, but not both or neither.');
        }
    });

    return true;
}),

// Ensure attachment objects conform to SimpleAttachment schema (no unwanted fields)
check('attachments').custom((attachments) => {
    const allowedFields = SimpleAttachmentKeys;

    attachments.forEach((attachment: any) => {
        const keys = Object.keys(attachment);

        keys.forEach((key) => {
            if (!allowedFields.includes(key)) {
                throw new Error(`Attachment contains an invalid field: ${key}`);
            }
        });
    });

    return true;
})
];