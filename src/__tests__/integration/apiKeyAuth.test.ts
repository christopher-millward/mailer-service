import express, { Request, Response } from 'express';
import request from 'supertest';
import { apiKeyAuth } from '../../middlewares/apiKeyAuth';

// Mock the config for API key
jest.mock('../../config/env', () => ({
    config: {
        apiKeys: ['valid-api-key1', 'valid-api-key2'],
    },
}));


describe('API Key Authentication Middleware Integration Tests', () => {
    let app: express.Application;

    // Setup a simple Express app with the apiKeyAuth middleware
    beforeAll(() => {
        app = express();
        // Route that uses the apiKeyAuth middleware
        app.get('/test', apiKeyAuth, (req: Request, res: Response) => {
            res.status(200).json({ message: 'Access granted' });
        });
    });

    afterEach(() => {
        jest.clearAllMocks(); // Clear any previous mocks between tests
    });

    // Use-case 1: Valid API key in the first position
    it('should allow access when a valid API key is provided (first position)', async () => {
        const response = await request(app)
            .get('/test')
            .set('x-api-key', 'valid-api-key1');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
    });

    // Use-case 2: Valid API key in the n-th position
    it('should allow access when a valid API key is provided (second position)', async () => {
        const response = await request(app)
            .get('/test')
            .set('x-api-key', 'valid-api-key2');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
    });

    // Use-case 3: Missing API key
    it('should return 401 when API key is missing', async () => {
        const response = await request(app)
            .get('/test');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized access.');
    });

    // Use-case 4: Invalid API key
    it('should return 401 when an invalid API key is provided', async () => {
        const response = await request(app)
            .get('/test')
            .set('x-api-key', 'invalid-api-key');

        expect(response.status).toBe(401);
        expect(response.body.message).toBe('Unauthorized access.');
    });
});