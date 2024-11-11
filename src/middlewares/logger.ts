import winston from 'winston';
import { Request, Response, NextFunction } from 'express';
import path from 'path';


// Destructure the winston formatting functions for easier readability
const { combine, timestamp, printf, colorize } = winston.format;

const relPath: string = '../../logs/access.log'; // relative path to where the log is stored
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
 * @description Middleware for logging HTTP requests and API activity. Logs the request ID, method, url, status code, 
 *              referrer, IP address, HTTP version, date and response time.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function.
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
    const startTime = Date.now();
    
    res.on('finish', () => {
        const duration = Date.now() - startTime;
        const logMessage = [
            `[Request ID: ${req.id}]`,                  // unique ID
            `Method: ${req.method}`,                    // method
            `URL: ${req.url}`,                          // request url
            `Status: ${res.statusCode}`,                // status code
            `Referrer: ${req.get('referrer') || '-'}`,  // referrer
            `Remote Addr: ${req.ip}`,                   // IP address
            `HTTP Version: ${req.httpVersion}`,         // HTTP version
            `Date: ${new Date().toISOString()}`,        // date
            `Response Time: ${duration} ms`             // response time
        ].join(' | ');

        loggerInstance.info(logMessage);
    });

    next();
};