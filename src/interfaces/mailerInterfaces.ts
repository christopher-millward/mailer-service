/**
 * Options for the email to be sent.
 * @interface
 * @param {string} MailOptions.to the email address of the recipient.
 * @param {string} MailOptions.subject the subject line of the email.
 * @param {string} MailOptions.text (Optional) the body text of the email.
 * @param {string} MailOptions.html (Optional) the body of the email in html format.
 * 
 * @link https://nodemailer.com/message/ for all options.
 */
export interface MailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
}