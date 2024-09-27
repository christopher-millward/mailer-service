import { Request, Response } from 'express';
import { mailerService } from '../services/mailer';
import { MailOptions } from '../schema/mailerInterfaces';

/**
 * @description Sends an email with the provided details.
 * @param {Request} req Express Request object containing the email details in the body.
 * @param {Response} res Express Response object.
 * @returns {Promise<void>} Sends a response indicating success or failure of the email sending operation.
 */
export const sendEmail = async (req: Request<{}, MailOptions>, res: Response) => {
  const { to, subject, text, html }: MailOptions = req.body;

  try {
    await mailerService.sendEmail({ to, subject, text, html });
    res.status(200).send("Email sent successfully");
  } catch (error) {
    res.status(500).send("Failed to send email");
  }
};