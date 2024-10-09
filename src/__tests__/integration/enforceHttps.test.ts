import { enforceHttps } from '../../middlewares/enforceHttps';
import express, { Request, Response, Express } from 'express';
import request from 'supertest';

// Mock the config
jest.mock('../../config/env', () => ({
    config: {
        environment: 'production', // Default mock for production, will override in specific tests
    },
}));

describe('enforceHttps Middleware', () => {

    let app: Express;

    beforeEach(() => {
        app = express();
        app.use(enforceHttps) // use middleware
        app.get('/test', (req: Request, res: Response) => {
            res.status(200).json({ message: 'Success' });
        });
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: HTTPS request in production
    // don't know how to simulate HTTPS in test environment
    // it('should response with 200 OK if HTTPS policy used in production', async () => {
    //     const response = await request(app)
    //         .get('/test')
    //         .set('X-Forwarded-Proto', 'https'); // only valid if behind proxy
    //     expect(response.status).toBe(200);
    //     expect(response.body.message).toBe('Success');
    // });

    // Use-case 2: HTTP request in production
    it('should respond with 302 (redirect) if HTTP policy used in production', async () => {
        const response = await request(app)
            .get('/test')
        expect(response.status).toBe(302);
    });

    // Use-case 3: HTTPS request in development

    // Use-case 4: HTTP request from localhost in development

    // Use-case 5: HTTP request in development (non-localhost)
});
