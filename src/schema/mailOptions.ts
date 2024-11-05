import { SimpleAttachment } from "./simpleAttachment";

/**
 * Options for the email to be sent.
 * @interface
 * @param {string} MailOptions.from The email address of the sender.
 * @param {string[]} MailOptions.to An array of recipients email addresses that will appear on the To: field.
 * @param {string} MailOptions.subject The subject line of the email.
 * @param {string[]} MailOptions.cc (Optional) An array of recipients email addresses that will appear on the Cc: field.
 * @param {string[]} MailOptions.bcc (Optional) An array of recipients email addresses that will appear on the Bcc: field.
 * @param {string} MailOptions.text (Optional) The body text of the email.
 * @param {string} MailOptions.html (Optional) The body of the email in html format.
 * @param {SimpleAttachment} MailOptions.attachments (Optional) An array of SimpleAttachment objects to be attached to the email.
 * 
 * @link https://nodemailer.com/message/ for more details.
 */
export interface MailOptions {
    from: string;
    to: string[];
    subject: string;
    cc?: string[];
    bcc?: string[];
    text?: string;
    html?: string;
    attachments?: SimpleAttachment[];
}

/**
 * List of keys in MailOptions. Since interfaces do not exist at runtime, this list may be used 
 * to validate/ ensure that all incoming keys are present/valid in the MailOptions schema. 
 */
export const MailOptionsKeys = ['from', 'to', 'subject', 'cc', 'bcc', 'text', 'html', 'attachments'];