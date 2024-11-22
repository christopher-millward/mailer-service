import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import { rateLimiter } from '../../middlewares/rateLimiter';
import { config } from '../../config/env';
import { mockErrorHandler } from '../testUtilities/mockErrorHandler';

// Helper function to create the test app
const mockApp = () => {
    const app: Express = express();
    app.use(express.json());
    app.use(rateLimiter);
    app.use(mockErrorHandler);
    config.environment === 'development' ? app.set('trust proxy', true): null; // allow for detection of XFF header in testing
    app.post('/send', (req: Request, res: Response) => {
        res.status(200).json({ message: 'Email sent' });
    });
    return app;
};

const suppressProxyError = () => {
    const originalConsoleError = console.error; // Save the original implementation
    jest.spyOn(console, 'error').mockImplementation((message, ...args) => {
        if (message.code == 'ERR_ERL_PERMISSIVE_TRUST_PROXY') {
            return; // supress error
        }
        // Log all others
        originalConsoleError(message, ...args);
    });
};


describe('Rate Limiter Middleware Integration Tests', () => {
    let app: Express;
    // Make sure these are the same as the rateLimiter
    const windowMS: number = 15*60*1000;    // limit window (in ms)
    const max_requests: number = 100;       // max number of requests allowed within window
    const less_than_max: number = 5;        // a small number that's 1 < x < max_requests (for simulating multiple good reqs)
    
    beforeAll(() => {
        app = mockApp();
        suppressProxyError();
    });

    beforeEach(() => {
        jest.clearAllMocks(); // Clear any previous mocks between tests
    });

    // Use-case 1: Request made within rate limit
    it('should allow a request within the rate limit', async () => {
        const response = await request(app).post('/send');
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Email sent');
    });

    // Use-case 2: Multiple requests within rate limit
    it('should allow multiple requests within the rate limit', async () => {
        for (let i = 0; i < less_than_max; i++) {
            const response = await request(app).post('/send');
            expect(response.status).toBe(200);
            expect(response.body.message).toBe('Email sent');
        }
    });

    // Use-case 3: Exceeding the rate limit
    it('should block requests after exceeding the rate limit', async () => {
        for (let i = 0; i < max_requests; i++) { //goes to one more than max
            await request(app).post('/send');
        }

        const response = await request(app).post('/send');
        expect(response.status).toBe(429);
        expect(response.text).toBe('Too many requests from this IP, please try again later.');
    });

    // Use-case 4: One IP exceeded limit, another IP still within their range
    it('should block one IP that exceeded the limit but allow another IP', async () => {
        const ip1 = '123.123.123.1'
        const ip2 = '123.123.123.2'

        // Simulate max requests from the first IP
        for (let i = 0; i < max_requests; i++) {
            await request(app).post('/send').set('X-Forwarded-For', ip1);
        }

        // First IP should be blocked
        const response1 = await request(app).post('/send').set('x-Forwarded-For', ip1);
        expect(response1.status).toBe(429);
        expect(response1.text).toBe('Too many requests from this IP, please try again later.');

        // Second IP should still be allowed
        const response2 = await request(app).post('/send').set('X-Forwarded-For', ip2);
        expect(response2.status).toBe(200);
        expect(response2.body.message).toBe('Email sent');
    });

    // Use-case 5: Requests after the rate limit window reset
    it('should reset the rate limit after the window has passed', async () => {
        // Simulate 100 requests to reach the limit
        for (let i = 0; i < max_requests; i++) {
            await request(app).post('/send');
        }

        // Block the next request (since limit is exceeded)
        const blockedResponse = await request(app).post('/send');
        expect(blockedResponse.status).toBe(429);

        // Simulate waiting for the rate limit window to pass
        jest.useFakeTimers(); // Mock the passage of time
        jest.advanceTimersByTime(windowMS+1); // Move time forward to window reset

        const resetResponse = await request(app).post('/send');
        expect(resetResponse.status).toBe(200);
        expect(resetResponse.body.message).toBe('Email sent');

        jest.useRealTimers(); // Restore real timers
    });

    // Use-case 6: Make sure the proper rate limiting headers are set
    it('should set proper rate limiting headers', async () => {
        const response = await request(app).post('/send');
        
        // Check that standard rate limit headers are included
        expect(response.headers['ratelimit-limit']).toBeDefined();
        expect(response.headers['ratelimit-remaining']).toBeDefined();
        expect(response.headers['ratelimit-reset']).toBeDefined();
    });
});
