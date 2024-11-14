import { Request, Response, NextFunction } from 'express';
import { createLogger } from '../../config/loggerConfig';
import { MailOptions } from '../../schema/mailOptions';

/**
 * General function to log the details of requests (both success and failure).
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @param {string} logLevel - The log level to use for the logger.
 * @param {string} additionalMessage - Additional message for the logger.
 * @returns {void} Calls the next middleware function.
 */
export const baseLogger = (req: Request, res: Response, next: NextFunction, logLevel: string, additionalMessage: string = '') => {
    const startTime = Date.now();
    const emailDetails: MailOptions = req.body;

    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logMessage = [
            `[Request ID: ${req.id}]`,                      // unique ID
            `Method: ${req.method}`,                        // method
            `URL: ${req.url}`,                              // request url
            `Status: ${res.statusCode}`,                    // status code
            `Referrer: ${req.get('referrer') || '-'}`,      // referrer
            `Remote Addr: ${req.ip}`,                       // IP address
            `HTTP Version: ${req.httpVersion}`,             // HTTP version
            `Date: ${new Date().toISOString()}`,            // date
            `Response Time: ${duration} ms`,                // response time
            `Sender Email: ${emailDetails.from}`,           // sender email
            `Recipient emails: ${emailDetails.to}`,         // recipient email
            `Email subject line: ${emailDetails.subject}`,  // subject line
            // `Response Message: ${responseBody}`,            // response message
            additionalMessage                               // additional log message
        ].join(' | ');

        const logger = createLogger(logLevel);

        // Conditionally log as 'error' or as 'info' (default)
        logLevel=='error'? logger.error(logMessage): logger.info(logMessage);
    });
};

