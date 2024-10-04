import { enforceHttps } from './enforceHttps';
import { Request, Response, NextFunction } from 'express';

// Mock the config
jest.mock('../config/env', () => ({
    config: {
        environment: 'production', // Default mock for production, will override in specific tests
    },
}));

// Create mock Request, Response, and NextFunction objects for testing
const mockRequest = (secure: boolean, host: string): Request => ({
    secure,
    headers: {
        host,
    },
    url: '/test-url',
} as unknown as Request);

const mockResponse = (): Response => {
    const res = {} as Response;
    res.redirect = jest.fn().mockReturnThis();
    return res;
};

const next = jest.fn() as NextFunction;


describe('enforceHttps Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: HTTPS request in production
    it('should call next() for HTTPS requests in production', () => {
        const req = mockRequest(true, 'www.example.com');
        const res = mockResponse();

        enforceHttps(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    // Use-case 2: HTTP request in production
    it('should redirect to HTTPS for HTTP requests in production', () => {
        const req = mockRequest(false, 'www.example.com');
        const res = mockResponse();

        enforceHttps(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('https://www.example.com/test-url');
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 3: HTTPS request in development
    it('should call next() for HTTPS requests in development', () => {
        jest.mocked(require('../config/env').config).environment = 'development';
        const req = mockRequest(true, 'localhost:3000');
        const res = mockResponse();

        enforceHttps(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    // Use-case 4: HTTP request from localhost in development
    it('should call next() for HTTP requests from localhost in development', () => {
        jest.mocked(require('../config/env').config).environment = 'development';
        const req = mockRequest(false, 'localhost:3000');
        const res = mockResponse();

        enforceHttps(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.redirect).not.toHaveBeenCalled();
    });

    // Use-case 5: HTTP request in development (non-localhost)
    it('should redirect to HTTPS for HTTP requests from non-localhost in development', () => {
        jest.mocked(require('../config/env').config).environment = 'development';
        const req = mockRequest(false, 'www.example.com');
        const res = mockResponse();

        enforceHttps(req, res, next);

        expect(res.redirect).toHaveBeenCalledWith('https://www.example.com/test-url');
        expect(next).not.toHaveBeenCalled();
    });
});
