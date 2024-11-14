// External Imports
import express, { Express } from 'express';

// Configuration Imports
import { config } from './config/env';

// Middleware Imports
import { uniqueID } from './middlewares/uniqueID';
import { logger } from './middlewares/logger';
import { corsPolicy } from './middlewares/auth/corsPolicy';
import { httpHeaders } from './middlewares/httpSecurity';
import { authHandler } from './middlewares/auth/authHandler';
import { enforceHttps } from './middlewares/enforceHttps';

// Route Imports
import mailRoutes from './routes/mailRoutes';
import { errorHandler } from './middlewares/errorHandler';

// Create an Express app instance
const app: Express = express();
const PORT: number = config.port;

// Middleware Setup
app.use(uniqueID);
app.use(logger);
app.use(corsPolicy);
app.use(httpHeaders);
app.use(express.json());
app.use(authHandler);
app.use(enforceHttps);
app.use(errorHandler);  // Must be last!

// Route Setup
app.use('/mail', mailRoutes);

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

// Export the Express API
export default app;