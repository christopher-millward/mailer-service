import express, { Express, Request, Response } from 'express';
import { authHandler } from '../../middlewares/auth/authHandler';
import { apiKeyAuth } from '../../middlewares/auth/apiKeyAuth';
import { corsPolicy } from '../../middlewares/auth/corsPolicy';
import request from 'supertest';
import { errorHandler } from '../../middlewares/errorHandler';


jest.mock('../../middlewares/auth/apiKeyAuth');
jest.mock('../../middlewares/auth/corsConfig');

// Helper function to create the test app
const mockApp = () => {
    const app: Express = express();
    app.use(express.json());
    app.use(authHandler);
    app.use(errorHandler);
    app.post('/test', (req: Request, res: Response) => {
        res.status(200).json({ message: 'Success' });
    });
    return app;
};

describe('authHandler middleware integration', () => {

    const app = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
        // Have the mock middleware just return next instead of actually running
        (corsPolicy as jest.Mock).mockImplementation((req, res, next) => next());
        (apiKeyAuth as jest.Mock).mockImplementation((req, res, next) => next());
    });

    it('should apply corsPolicy for request with Origin header', async () => {
        await request(app)
            .post('/test')
            .set('Origin', 'http://example.com');

        expect(corsPolicy).toHaveBeenCalledTimes(1);
    });

    it('should call apiKeyAuth when Origin header is missing', async () => {
        await request(app).post('/test');

        expect(apiKeyAuth).toHaveBeenCalledTimes(1);
    });
    
    it('should call apiKeyAuth when Origin header is empty', async () => {
        await request(app)
            .post('/test')
            .set('Origin', '');

        expect(apiKeyAuth).toHaveBeenCalledTimes(1);
    });

    it('should skip apiKeyAuth when Origin header is present', async () => {
        await request(app)
            .post('/test')
            .set('Origin', 'http://example.com');

        expect(apiKeyAuth).not.toHaveBeenCalled();
    });

    it('should allow the request to proceed if CORS and/or apiKeyAuth pass', async () => {
        const response = await request(app)
            .post('/test')
            .set('Origin', 'http://example.com');

        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    it('should prevent access if apiKeyAuth fails', async () => {
        (apiKeyAuth as jest.Mock).mockImplementation((req, res) => res.status(401).send('Unauthorized'));

        const response = await request(app).post('/test');

        expect(response.status).toBe(401);
        expect(response.text).toBe('Unauthorized');
    });
});