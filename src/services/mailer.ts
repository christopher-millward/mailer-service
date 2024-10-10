import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import {MailOptions} from '../schema/mailOptions'

/**
 * @class MailerService
 * @description Handles email sending operations.
 */
class MailerService {
    private transporter: Transporter;

    /**
     * @constructor
     * @description Initializes the mailer service with the necessary transporter configuration.
     */
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: config.smtpHost,
            port: config.smtpPort,
            secure: true,
            auth: {
                user: config.smtpUser,
                pass: config.smtpPass
            },
            // dkim: {          // CONFIGURE DKIM
            //   domainName: 'yourdomain.com',
            //   keySelector: 'default',
            //   privateKey: fs.readFileSync('private.key', 'utf8'),
            // }
        });
    }

    /**
     * @method sendEmail
     * @description Sends an email with the provided options. Since all data is already validated in
     *              other middleware, it can be passed here directly.
     * @param {MailOptions} reqOptions - The email details received (as the request body). Should be of type MailOptions.
     * @returns {Promise<void>} - Resolves when the email is sent successfully, rejects on failure.
     */
    async sendEmail(reqOptions: MailOptions): Promise<void> {

        const emailOptions: MailOptions = {
            from: reqOptions.from,
            to: reqOptions.to,
            subject: reqOptions.subject,
            cc: reqOptions.cc,
            bcc: reqOptions.bcc,
            text: reqOptions.text,
            html: reqOptions.html,
            attachments: reqOptions.attachments
        };

        // Handle Development Environment (don't send emails)
        if (config.environment === 'development') {
            console.log('Mail Options:', emailOptions);
            return;
        }

        try {
            const info = await this.transporter.sendMail(emailOptions);
            console.log("Message sent: %s", info.messageId);
        } catch (error) {
            console.error("Error sending email:", error);
            throw new Error("Email sending failed");
        }
    }
}

export const mailerService = new MailerService();
