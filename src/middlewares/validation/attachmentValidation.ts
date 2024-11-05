import { check, ValidationChain } from 'express-validator';
import { SimpleAttachmentKeys } from '../../schema/simpleAttachment';

/**
 * @description Validation rules for the email attachments. One of `path` or `content` must be present.
 * @param {string} filename - Validates and sanitizes the filename. 
 * @param {string} path - (Optional) Validates and sanitizes the filepath (URL). 
 * @param {Buffer} content - Validates the file contents (Buffer).
 * @param {string} cid - (Optional) Validates and sanitizes the cid.
 */
export const attachmentValidationRules: ValidationChain[] = [
// Validation of attachments being in an Array is performed in './mailOptionsValidation.ts'

// Validate each attachment in the array
check('attachments.*.filename').isString().withMessage('Attachment filename must be a string').escape(),
check('attachments.*.path').optional().isURL().withMessage('Attachment path must be a URL').escape(),
check('attachments.*.content').optional().isString().withMessage('Attachment content must be a string (or Buffer encoded as string).'),
check('attachments.*.cid').optional().isString().withMessage('cid must be a string').escape(),

// Ensure only one of `path` or `content` is present, but not both
check('attachments').custom((attachments) => {
    attachments.forEach((attachment: any) => {
        const hasPath = !!attachment.path;
        const hasContent = !!attachment.content;

        // Ensure exactly one is provided
        if ((hasPath && hasContent) || (!hasPath && !hasContent)) {
            throw new Error('Each attachment must contain either `path` or `content`, but not both or neither.');
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