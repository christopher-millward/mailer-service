import express, { Express, Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from '../../middlewares/errorHandler';
import { errorLogger } from '../../middlewares/logging/errorLogger';
import { ResponseError } from '../../types/responseError';

// Mock the error logger to avoid actual logging during tests
jest.mock('../../middlewares/logging/errorLogger', ()=>({
    errorLogger: jest.fn(),
}));

// Helper function to create a test app
const mockApp = () => {
    const app: Express = express();
    app.use(errorHandler);

    // Simulate route that throws an error
    app.post('/test', (req: Request, res: Response, next: NextFunction) => {
        const error: ResponseError = new Error('Test error') as ResponseError;
        error.status = 400;
        error.errors = undefined;
        next(error);
    });

    return app;
};

describe('Error Handler Middleware Integration Tests', () => {
    const app: Express = mockApp();

    afterEach(() => {
        jest.clearAllMocks();
    });

    /***
     * Want to make sure: 
     * 1. errorHAndler is only called when error is provided.
     * 2. Assigns a default error code when appropropriate
     * 3. Assigns a default message when appropriate
     * 4. Logs errors when appropriate
     * 5. Sends validation errors when appropriate.
     * 6. Properly formats validation errors
     * 
     * ^^ Many of these should be unit tests, not integration tests??
     */


});