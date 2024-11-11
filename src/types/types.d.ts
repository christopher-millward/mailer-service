import { Request } from 'express';

/**
 * @description Modifying the Request object such that it accepts an 'id' attribute.
 *              This allows us to better log the activity within the server.
 */
declare module 'express-serve-static-core' {
    interface Request {
        id?: string; 
    }
}
