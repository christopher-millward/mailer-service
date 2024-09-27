// External Imports
import express, { Express } from 'express';

// Configuration Imports
import { config } from './config/env';

// Middleware Imports
import { httpHeaders } from './middlewares/httpSecurity';
import { apiKeyAuth } from './middlewares/auth';

// Route Imports
import mailRoutes from './routes/mailRoutes';

// Create an Express app instance
const app: Express = express();
const PORT: number = config.port;

// Middleware Setup
app.use(httpHeaders);
app.use(express.json());
app.use(apiKeyAuth);

// Route Setup
app.use('/mail', mailRoutes);

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// Export the Express API
export default app;