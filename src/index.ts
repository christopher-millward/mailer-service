// External Imports
import express, { Express } from 'express';

// Configuration Imports
import { config } from './config/env';

// Middleware Imports
import { uniqueID } from './middlewares/uniqueID';
import { successLogger } from './middlewares/logging/successLogger';
import { corsPolicy } from './middlewares/auth/corsPolicy';
import { httpHeaders } from './middlewares/httpSecurity';
import { authHandler } from './middlewares/auth/authHandler';
import { enforceHttps } from './middlewares/enforceHttps';
import { errorHandler } from './middlewares/errorHandler';

// Route Imports
import mailRoutes from './routes/mailRoutes';

// Create an Express app instance
const app: Express = express();
const PORT: number = config.port;

// Middleware Setup
app.use(uniqueID);
app.use(successLogger);
app.use(corsPolicy);
app.use(httpHeaders);
app.use(express.json());
app.use(authHandler);
app.use(enforceHttps);
app.use(errorHandler);  // Must be last!

// Route Setup
app.use('/mailer', mailRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the Express API
export default app;