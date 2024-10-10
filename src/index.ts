// External Imports
import express, { Express } from 'express';

// Configuration Imports
import { config } from './config/env';

// Middleware Imports
import { logger } from './middlewares/logger';
import { httpHeaders } from './middlewares/httpSecurity';
import { authHandler } from './middlewares/auth/authHandler';
import { enforceHttps } from './middlewares/enforceHttps';

// Route Imports
import mailRoutes from './routes/mailRoutes';

// Create an Express app instance
const app: Express = express();
const PORT: number = config.port;

// Middleware Setup
app.use(logger)
app.use(httpHeaders);
app.use(express.json());
app.use(authHandler);
app.use(enforceHttps);

// Route Setup
app.use('/mail', mailRoutes);

//********* JUST FOR QUICK REST TESTING - DELETE PRIOR TO SHIPPING ***********/
import {Request, Response} from 'express';
import { mailOptionsValidationRules} from './middlewares/validation/mailOptionsValidation';
import { attachmentValidationRules } from './middlewares/validation/attachmentValidation';
import { validateRequest } from './middlewares/validation/validationRequest';
app.post('/test', 
    mailOptionsValidationRules,
    // attachmentValidationRules,
    validateRequest,(req: Request, res: Response) => {
    res.status(200).json({ message: 'Success' });
});
//****************************************************************************/

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the Express API
export default app;