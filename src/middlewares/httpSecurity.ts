import { Request, Response, NextFunction } from 'express';
import helmet from 'helmet';
/**
 * @description Helmet configuration for securing the application by setting various HTTP headers.
 * It includes protections against XSS, Clickjacking, and MIME type sniffing.
 * Content Security Policy (CSP) restricts resource loading from specified sources.
 * 
 * - XSS protection is enabled via the legacy XSS filter.
 * - MIME type sniffing is disabled to prevent browsers from interpreting files incorrectly.
 * - Frameguard is set to deny to prevent Clickjacking attacks by disallowing the page in frames.
 */
const helmetConfig = helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'"],
            styleSrc: ["'self'"],
            imgSrc: ["'self'", 'data:'],
            connectSrc: ["'self'"],
            fontSrc: ["'self'"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
    xssFilter: true, // Enable XSS filter
    noSniff: true, // Disable MIME type sniffing
    frameguard: { action: 'deny' }, // Prevent clickjacking by not allowing the page to be loaded in a frame
    strictTransportSecurity:{
        maxAge:3600*24*30, // 30 days
        preload:true
    }
});

/**
 * @description Custom middleware function to help secure the application from common web vulnerabilities.
 * It applies all custom security configurations.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Passes control to the next middleware or route handler.
 */
export const httpHeaders = (req: Request, res: Response, next: NextFunction) => {
    helmetConfig(req, res, next);
};
