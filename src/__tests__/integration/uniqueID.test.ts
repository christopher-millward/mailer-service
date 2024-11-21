import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import { uniqueID } from '../../middlewares/uniqueID';
import { mockErrorHandler } from '../testUtilities/mockErrorHandler';
import {validate as uuidValidate } from 'uuid';

// Helper function to create a test app
const mockApp = () => {
    const app: Express = express();
    app.use(uniqueID);
    app.use(mockErrorHandler);
    app.post('/test', (req: Request, res: Response) => {
        res.status(200).json({ id: req.id });  // send back response ID
    });
    return app;
};

describe('UniqueID Middleware Integration Tests', () => {
    const app: Express =  mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should assign a unique ID to each request', async () => {
        const response = await request(app).post('/test');

        expect(response.status).toBe(200);
        expect(response.body.id).toBeDefined(); // Ensure ID is present
        expect(typeof response.body.id).toBe('string'); // Ensure ID is a string
    });

    it('should assign a different ID for each request', async () => {
        const response1 = await request(app).post('/test');
        const response2 = await request(app).post('/test');

        expect(response1.body.id).not.toBe(response2.body.id); // IDs should differ
    });

    it('should assign a valid UUID v4 format as the ID', async () => {
        const response = await request(app).post('/test');
        
        expect(uuidValidate(response.body.id)).toBe(true);
    });
});
