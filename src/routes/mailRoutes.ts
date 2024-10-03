import { Router } from 'express';
import { sendEmail } from '../controllers/sendMail';
import { mailOptionsValidationRules } from '../middlewares/validation/mailOptionsValidation';
import { attachmentValidationRules } from '../middlewares/validation/attachmentValidation';
import { validateRequest } from '../middlewares/validation/validationRequest';
import { rateLimiter } from '../middlewares/rateLimiter';

const router: Router = Router();

/**
 * @route POST /mail/send
 * @description Validates and sends an email with the provided details.
 */
router.post('/send', 
    mailOptionsValidationRules,
    attachmentValidationRules,
    validateRequest,
    rateLimiter,
    sendEmail
);

export default router;