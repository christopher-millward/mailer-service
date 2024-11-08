/**
 * Represents an Attachment object for the email. 
 * This structure handles two situations:
 *  a) The attachment is hosted on a CDN and can be accessed publicly.
 *  b) The attachment is uploaded from disk and sent as a buffer.
 * @interface
 * @param {string} SimpleAttachment.filename The name of the attached file. Unicode is allowed. 
 * @param {string} SimpleAttachment.href (Optional) The URL to the file (if available publically).
 * @param {Buffer | string} SimpleAttachment.content The file's Buffer or string (base64 encoding) (if uploaded from disk).
 * @param {string} SimpleAttachment.cid (Optional) The content id for using inline images in HTML message.
 * 
 * @link https://nodemailer.com/message/attachments/ for more details.
 */
export interface SimpleAttachment {
    filename: string;
    href?: string;
    content?: Buffer | string;
    cid?: string;
}


/**
 * List of keys in SimpleAttachment. Since interfaces do not exist at runtime, this list may be used 
 * to validate/ ensure that all incoming keys are present/valid in the SimpleAttachment schema. 
 */
export const SimpleAttachmentKeys = ['filename', 'href', 'content', 'cid']; 