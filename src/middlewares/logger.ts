import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import path from 'path';
import { MailOptions } from '../schema/mailOptions';


// Destructure the winston formatting functions for easier readability
const { combine, timestamp, printf, colorize } = winston.format;

// Define path to log
const relPath: string = '../../logs/access.log';
const absPath: string = path.join(__dirname, relPath);

// Create a logger instance
const loggerInstance = winston.createLogger({
    level: 'info',
    format: combine(
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        printf(({ timestamp, level, message }) => {
            return `${timestamp} ${level}: ${message}`;
        }),
        // colorize({all: true})   // Can uncomment during development
    ),
    transports: [
        new winston.transports.File({ filename: absPath}),
        // new winston.transports.Console()     // Can uncomment during development
    ]
});

/**
 * @description Middleware for logging HTTP(S) requests and API activity. Logs the request ID, method, url, status code, 
 *              referrer, IP address, HTTP version, date and response time.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function.
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    const emailDetials: MailOptions = req.body;

    // Get the response body to log messge
    // THIS ISN'T WORKING AS EXPECTED -> RETURNING [Object Object].
    // MAKE SURE YOU'RE ONLY LOGGING THE RESPONSE MSG!
    let responseBody: JSON;
    captureJsonResponse(res, (body)=>{responseBody = body});
    
    
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
            `Sender Email: ${emailDetials.from}`,           // sender email
            `Recipient emails: ${emailDetials.to}`,         // recipient email
            `Email subject line: ${emailDetials.subject}`,  // subject line
            `Response Message: ${responseBody}`             // response message
        ].join(' | ');

        loggerInstance.info(logMessage);
    });

    next();
};

/**
 * @description Intercepts and captures the JSON response body so it can be read. This 
 *              function wraps the `res.json` method to intercept the response payload
 *              and passes it to a provided callback function. This is useful for logging or
 *              further processing the response body before it is sent to the client.
 *
 * @param {Request} res - Express response object where JSON response will be captured.
 * @param {Function} callback - Function to be called with the JSON response body. Typically used for logging.
 */
function captureJsonResponse(res: Response, callback: (body: JSON) => void): void {
    // Preserve the original res.json method
    const originalJson = res.json.bind(res);

    // Override res.json to capture the response body
    res.json = (body: JSON) => {
        callback(body); // Call the callback with the intercepted response body
        return originalJson(body); // Execute original res.json with the captured body
    };
}

