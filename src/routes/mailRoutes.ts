import { Router } from 'express';
import { sendEmail } from '../controllers/sendMail';
import { rateLimiter } from '../middlewares/rateLimiter';
import { validationHandler } from '../middlewares/validation/validationHandler';

const router: Router = Router();

/**
 * @route POST /mail/send
 * @description Validates and sends an email with the provided details.
 */
router.post('/send', 
    validationHandler,
    rateLimiter,
    sendEmail
);

export default router;