import morgan from 'morgan';
import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';

// Create a write stream (in append mode) for logging to a file
const relPath: string = '../../logs/access.log' // relative path to where the log is stored
const logStream = fs.createWriteStream(path.join(__dirname, relPath), { flags: 'a' });

// Configure morgan
const morganConfig = morgan((tokens, req: Request, res: Response) => {
    return [
        tokens.method(req, res),                // method
        tokens.url(req, res),                   // request url
        tokens.status(req, res),                // status code
        tokens.referrer(req, res),              // referrer 
        tokens['remote-addr'](req, res),        // IP address
        tokens.req(req, res, 'header-name'),    // request header
        tokens['http-version'](req, res),       // http version
        tokens.date(req, res, 'web'),           // Date and time
        tokens['response-time'](req, res), '(ms)'
    ].join(' '); // Join the logged items with spaces
}, { stream: logStream }); // Log to the specified stream

/**
 * @description Middleware for logging HTTP requests using Morgan. Logs the request method, status code, IP address, url, date and time, 
 *              and response time into a local file.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function.
 */
export const logger = (req: Request, res: Response, next: NextFunction) => {
    morganConfig(req, res, next);
};