import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';
import {MailOptions} from '../schema/mailerInterfaces';

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
      }
    });
  }
 
  /**
   * @method sendEmail
   * @description Sends an email with the provided options.
   * @param {MailOptions} mailOptions - The email details to be sent. Should be of type MailOptions.
   * @returns {Promise<void>} - Resolves when the email is sent successfully, rejects on failure.
   */
  async sendEmail({ to, subject, text, html }: MailOptions): Promise<void> {
    const emailOptions = {
      from: `"Your Service" <${config.smtpUser}>`,
      to,
      subject,
      text,
      html,
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
