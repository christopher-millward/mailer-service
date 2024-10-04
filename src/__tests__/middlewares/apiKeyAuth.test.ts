import { apiKeyAuth } from '../../middlewares/apiKeyAuth';
import { Request, Response, NextFunction } from 'express';

// Mock config for API key
jest.mock('../../config/env', () => ({
    config: {
        apiKeys: 'valid-api-key1, valid-api-key2',
    },
}));

// Create mock Request, Response, and Next objects for the function to interact with
const mockRequest = (headers: Record<string, string | undefined>): Request => ({
    headers,
} as unknown as Request);

const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    return res;
};

const next = jest.fn() as NextFunction;


describe('API Key Authentication Middleware', () => {

    // Clear all mocks between tests
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: Valid API key in first position
    it('should call next() if a valid API key is provided', () => {
        const req = mockRequest({ 'x-api-key': 'valid-api-key1' });
        const res = mockResponse();

        apiKeyAuth(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Use-case 2: Valid API key in n-th position
    it('should call next() if a valid API key is provided', () => {
        const req = mockRequest({ 'x-api-key': 'valid-api-key2' });
        const res = mockResponse();

        apiKeyAuth(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });
    // Use-case 3: Missing API key
    it('should return 401 for missing/undefined API key', () => {
        const req = mockRequest({});  // No API key in headers
        const res = mockResponse();

        apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 4: Invalid API key
    it('should return 401 for an invalid API key', () => {
        const req = mockRequest({ 'x-api-key': 'invalid-api-key' });
        const res = mockResponse();

        apiKeyAuth(req, res, next);

        expect(res.status).toHaveBeenCalledWith(401);
        expect(res.json).toHaveBeenCalledWith({ message: 'Unauthorized access.' });
        expect(next).not.toHaveBeenCalled();
    });
});