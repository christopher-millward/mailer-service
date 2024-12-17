import 'express';

/**
 * @description Extends the Express Request interface to include a custom `id` property.
 *              This is used to attach a unique identifier to each incoming request for
 *              tracing purposes.
 */
declare global {
    namespace Express {
        /**
         * @description Custom properties added to the Express Request object.
         */
        interface Request {
            /**
             * @property {string | undefined} id -  A unique identifier for the request, assigned by 
             *                                      middleware in'src/middlewares/uniqueID.ts'.
             */
            id?: string;
        }
    }
}
