import { Router } from 'express';
import { mailValidationRules, validateRequest } from '../middlewares/validation';
import { sendEmail } from '../controllers/sendMail';

const router: Router = Router();

/**
 * @route POST /mail/send
 * @description Validates and sends an email with the provided details.
 */
router.post('/send', 
  mailValidationRules,
  validateRequest,
  sendEmail
);

export default router;