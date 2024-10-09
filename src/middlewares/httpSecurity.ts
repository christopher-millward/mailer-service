import { Request, Response, NextFunction } from 'express';
import helmet, { HelmetOptions } from 'helmet';
/**
 * @description Helmet configuration for securing the application by setting various HTTP headers.
 * It includes protections against XSS, Clickjacking, and MIME type sniffing.
 * Content Security Policy (CSP) restricts resource loading from specified sources.
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: { //changing some of the defaults to really restrict
            styleSrc: ["'self'"],
            imgSrc: ["'self'"],
            connectSrc: ["'self'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    xFrameOptions: { action: 'deny' }, // Prevent clickjacking by not allowing the page to be loaded in a frame
    strictTransportSecurity:{   //enforce HTTPS
        maxAge:3600*24*365, // 365 days
        preload:true
    }
} as HelmetOptions);

/**
 * @description Middleware to help secure the application from common web vulnerabilities. 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Passes control to the next middleware or route handler.
 */
export const httpHeaders = (req: Request, res: Response, next: NextFunction) => {
    helmetConfig(req, res, next);
};
