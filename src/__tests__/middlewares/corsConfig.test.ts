import { corsPolicy } from '../../middlewares/corsConfig';
import { Request, Response, NextFunction } from 'express';
import cors from 'cors';

// Mock config for CORS allowed origins
jest.mock('../../config/env', () => ({
    config: {
        trustedOrigins: 'https://allowed-origin1.com, https://allowed-origin2.com',
    },
}));

// Create mock Request, Response, and Next objects
const mockRequest = (origin?: string, method: string = 'POST'): Request => ({
    headers: { origin },
    method,
} as unknown as Request);

const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    res.setHeader = jest.fn(); // Mock setHeader
    res.getHeader = jest.fn(); // Optional: if used by CORS
    res.headersSent = false;   // Optional: to simulate Express behavior
    res.end = jest.fn();       // Mock when ending preflight
    return res;
};

const next = jest.fn() as NextFunction;

describe('CORS Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: Valid Origin in first position
    it('should call next() if the origin is valid', () => {
        const req = mockRequest('https://allowed-origin1.com');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Use-case 2: Valid Origin in n-th position
    it('should call next() if the origin is valid', () => {
        const req = mockRequest('https://allowed-origin2.com');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Use-case 3: Invalid Origin
    it('should return 403 if the origin is not allowed', () => {
        const req = mockRequest('https://disallowed-origin.com');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Blocked by CORS policy.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 4: No Origin Header
    it('should return 403 if there is no origin header', () => {
        const req = mockRequest();
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Blocked by CORS policy.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 5: Sending preflight request from valid origin
    it('should call next() if a preflight request is sent from a valid origin', () => {
        const req = mockRequest('https://allowed-origin1.com', 'OPTIONS');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(204);
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 6: Sending a GET request from a valid origin
    it('should return 403 if a GET request is sent (even from a valid origin)', () => {
        const req = mockRequest('https://allowed-origin1.com', 'GET');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Blocked by CORS policy.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 7: Sending a PUT request from a valid origin
    it('should return 403 if a PUT request is sent (even from a valid origin)', () => {
        const req = mockRequest('https://allowed-origin1.com', 'PUT');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Blocked by CORS policy.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 8: Sending a DELETE request from a valid origin
    it('should return 403 if a DELETE request is sent (even from a valid origin)', () => {
        const req = mockRequest('https://allowed-origin1.com', 'DELETE');
        const res = mockResponse();

        corsPolicy(req, res, next);

        expect(res.status).toHaveBeenCalledWith(403);
        expect(res.json).toHaveBeenCalledWith({ message: 'Blocked by CORS policy.' });
        expect(next).not.toHaveBeenCalled();
    });
});
