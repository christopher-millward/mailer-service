import express, { Request, Response, NextFunction } from 'express';
import request from 'supertest';
import { errorHandler } from '../../middlewares/errorHandler';
import { ResponseError } from '../../types/responseError';
import { errorLogger } from '../../middlewares/logging/errorLogger';

// Mock the error logger to avoid actual logging during tests
jest.mock('../../middlewares/logging/errorLogger');

describe('Error Handler Middleware Integration Tests', () => {
    const app = express();
    app.use(errorHandler);

    // Simulate a route that throws an error
    app.post('/test-error', (req: Request, res: Response, next: NextFunction) => {
        const error: ResponseError = new Error('Test error');
        error.status = 400;
        next(error);
    });

    // Simulate a route that triggers an unexpected error
    app.post('/test-unknown-error', (req: Request, res: Response, next: NextFunction) => {
        throw new Error('Unexpected error');
    });

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
     */

    // USe-case 1: No error thrown

    // Use-case 2: Custom error with a defined status and message
    it('should handle a custom error and return the defined status and message', async () => {
        const response = await request(app).post('/test-error');

        expect(response.status).toBe(400);
        expect(response.body.message).toBe('Test error');
        expect(errorLogger).toHaveBeenCalledTimes(1);
    });

    // Use-case 3: Unknown error without a defined status and message
    it('should handle an unknown error and return status 500 with a default message', async () => {
        const response = await request(app).post('/test-unknown-error');

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Unknown error.');
        expect(errorLogger).toHaveBeenCalledTimes(1);
    });

    // // Use-case 4: Validation error with additional error details
    // it('should include validation error details when provided', async () => {
    //     app.post('/test-validation-error', (req: Request, res: Response, next: NextFunction) => {
    //         const error: ResponseError = new Error('Validation error');
    //         error.status = 422;
    //         error.errors = ['Field "name" is required', 'Field "email" must be valid'];
    //         next(error);
    //     });

    //     const response = await request(app).post('/test-validation-error');

    //     expect(response.status).toBe(422);
    //     expect(response.body.message).toBe('Validation error');
    //     expect(response.body.errors).toEqual([
    //         'Field "name" is required',
    //         'Field "email" must be valid',
    //     ]);
    //     expect(errorLogger).toHaveBeenCalledTimes(1);
    //     expect(errorLogger).toHaveBeenCalledWith(
    //         expect.any(Request),
    //         expect.any(Response),
    //         expect.any(Function),
    //         'Validation error'
    //     );
    // });

});
