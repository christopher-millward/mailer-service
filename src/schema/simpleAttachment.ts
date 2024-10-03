/**
 * Represents an Attachment object for the email. 
 * This structure handles three situations:
 *  a) The attachment is hosted on a CDN and can be accessed publicly.
 *  b) The attachment is uploaded as binary and sent as a multipart/form-data.
 * @interface
 * @param {string} SimpleAttachment.filename The name of the attached file. Unicode is allowed. 
 * @param {string} SimpleAttachment.path (Optional) The URL to the file (if available publically).
 * @param {Buffer | string} SimpleAttachment.content The file's Buffer or string (base64 encoding) (if uploaded from disk).
 * @param {string} SimpleAttachment.cid (Optional) The content id for using inline images in HTML message.
 * 
 * @link https://nodemailer.com/message/attachments/ for more details.
 */
export interface SimpleAttachment {
    filename: string;
    path?: string;
    content?: Buffer | string;
    cid?: string;
}
