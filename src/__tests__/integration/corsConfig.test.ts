import { corsPolicy } from '../../middlewares/auth/corsPolicy';
import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import { mockErrorHandler } from '../testUtilities/mockErrorHandler';

// Mock config for CORS allowed origins
jest.mock('../../config/env', () => ({
    config: {
        trustedOrigins: ['https://allowed-origin1.com', 'https://allowed-origin2.com'],
    },
}));

describe('CORS Middleware', () => {
    const app = express();
    app.use(corsPolicy);
    app.use(mockErrorHandler);
    // Route that uses the corsPolicy middleware
    app.options('/test'); // Handle OPTIONS requests for preflight
    app.post('/test', (req: Request, res: Response) => {
        res.status(200).json({ message: 'Access granted' });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: Valid Origin in first position (origin 1)
    it('should allow access from a valid origin (origin 1)', async () => {
        const response = await request(app)
            .post('/test')
            .set('Origin', 'https://allowed-origin1.com');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
        expect(response.headers['access-control-allow-origin']).toBe('https://allowed-origin1.com');
    });

    // Use-case 2: Valid Origin in n-th position (origin 2)
    it('should allow access from a valid origin (origin 2)', async () => {
        const response = await request(app)
            .post('/test')
            .set('Origin', 'https://allowed-origin2.com');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
        expect(response.headers['access-control-allow-origin']).toBe('https://allowed-origin2.com');
    });

    // Use-case 3: Invalid Origin
    it('should block access from an invalid origin', async () => {
        const response = await request(app)
            .post('/test')
            .set('Origin', 'https://invalid-origin.com');

        expect(response.status).toBe(403);
        expect(response.body.message).toBe('Unauthorized Access: untrusted origin');
    });

    // Use-case 4: No Origin Header
    it('should pass to next middleware (apiKey auth) when no origin header is provided', async () => {
        const response = await request(app)
            .post('/test');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Access granted');
    });

    // Use-case 5: Sending preflight request from valid origin
    it('should handle preflight request from a valid origin', async () => {
        const response = await request(app)
            .options('/test')
            .set('Origin', 'https://allowed-origin1.com');

        expect(response.status).toBe(204);
        expect(response.headers['access-control-allow-origin']).toBe('https://allowed-origin1.com');
        expect(response.headers['access-control-allow-methods']).toBe('POST,OPTIONS');
    });

    // Use-case 6: Sending a GET request from a valid origin
    it('should return 404 if an unauthorized method is sent (even from a valid origin)', async () => {
        const response = await request(app)
            .get('/test')
            .set('Origin', 'https://allowed-origin2.com');

        expect(response.status).toBe(404);
    });

    // Use-case 7: Sending a PUT request from a valid origin
    it('should return 404 if an unauthorized method is sent (even from a valid origin)', async () => {
        const response = await request(app)
            .put('/test')
            .set('Origin', 'https://allowed-origin1.com');

        expect(response.status).toBe(404);
    });

    // Use-case 8: Sending a DELETE request from a valid origin
    it('should return 404 if an unauthorized method is sent (even from a valid origin)', async () => {
        const response = await request(app)
            .delete('/test')
            .set('Origin', 'https://allowed-origin1.com');

        expect(response.status).toBe(404);
    });
});
