import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';

/**
 * @description Middleware to assign a unique ID to each request. The intention is 
 *              to use this ID to identify events in the log. It will also be sent
 *              on the response body for the client to use for cross-referencing.
 * 
 * @param {Request} req - Express request object.
 * @param {Response} res - Express response object.
 * @param {NextFunction} next - Express next middleware function.
 * @returns {void} Calls the next middleware function.
 */
export const uniqueID = (req: Request, res: Response, next: NextFunction) => {
    req.id = uuidv4();
    next();
};