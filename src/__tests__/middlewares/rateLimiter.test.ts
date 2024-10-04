import { rateLimiter } from '../../middlewares/rateLimiter';
import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';

// Mock the rate limit function from 'express-rate-limit'
jest.mock('express-rate-limit', () => jest.fn(() => 
    (req: Request, res: Response, next: NextFunction) => next()));

// Mock Request, Response, and NextFunction objects for testing
const mockRequest = (): Request => ({
    ip: '127.0.0.1', // Mock an IP address for rate-limiting purposes
} as unknown as Request);

const mockResponse = (): Response => {
    const res = {} as Response;
    res.status = jest.fn().mockReturnThis();
    res.json = jest.fn();
    res.setHeader = jest.fn();
    return res;
};

const next = jest.fn() as NextFunction;


describe('Rate Limiter Middleware', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Use-case 1: First request within rate limit
    it('should call next() on the first request within rate limit', () => {
        const req = mockRequest();
        const res = mockResponse();

        // Mocking the rate limiter function to call next()
        const mockLimiter = jest.fn((req: Request, res: Response, next: NextFunction) => next());
        (rateLimit as jest.Mock).mockReturnValueOnce(mockLimiter);

        rateLimiter(req, res, next);

        expect(next).toHaveBeenCalled();
        expect(res.status).not.toHaveBeenCalled();
    });

    // Use-case 2: Subsequent requests within rate limit
    it('should call next() on multiple requests within the rate limit', () => {
        const req = mockRequest();
        const res = mockResponse();

        // Mocking the rate limiter function to call next()
        const mockLimiter = jest.fn((req: Request, res: Response, next: NextFunction) => next());
        (rateLimit as jest.Mock).mockReturnValue(mockLimiter);

        rateLimiter(req, res, next);
        rateLimiter(req, res, next);

        expect(next).toHaveBeenCalledTimes(2);
        expect(res.status).not.toHaveBeenCalled();
    });

    // Use-case 3: Exceeding the rate limit
    it('should return 429 Too Many Requests if rate limit is exceeded', () => {
        const req = mockRequest();
        const res = mockResponse();

        // Mocking the rate limiter function to return a rate limit error
        const mockLimiter = jest.fn((req: Request, res: Response, next: NextFunction) => {
            res.status(429).json({ message: 'Too many requests from this IP, please try again later.' });
        });
        (rateLimit as jest.Mock).mockReturnValueOnce(mockLimiter);

        rateLimiter(req, res, next);

        expect(res.status).toHaveBeenCalledWith(429);
        expect(res.json).toHaveBeenCalledWith({ message: 'Too many requests from this IP, please try again later.' });
        expect(next).not.toHaveBeenCalled();
    });

    // Use-case 4: Requests after the rate limit window reset
    it('should fail the second request due to rate limit and allow the third request after window resets', () => {
        jest.useFakeTimers(); // Enable fake timers

        const req = mockRequest();
        const res = mockResponse();

        // Mock rate limiter for the first request (allow)
        const mockLimiter = jest.fn((req: Request, res: Response, next: NextFunction) => next());
        (rateLimit as jest.Mock).mockReturnValue(mockLimiter);

        // First request - Should pass (last available request in the rate limit window)
        rateLimiter(req, res, next);
        expect(next).toHaveBeenCalledTimes(1); // First request should call next()
        expect(res.status).not.toHaveBeenCalled(); // No error should have been sent yet

        // Mock rate limiter for the second request (fail due to exceeding the limit)
        const mockLimiterExceed = jest.fn((req: Request, res: Response, next: NextFunction) => {
            res.status(429).json({ message: 'Too many requests from this IP, please try again later.' });
        });
        (rateLimit as jest.Mock).mockReturnValueOnce(mockLimiterExceed);

        // Second request - Should fail (exceeds the rate limit)
        rateLimiter(req, res, next);
        expect(next).toHaveBeenCalledTimes(1); // Next should not be called again
        expect(res.status).toHaveBeenCalledWith(429); // Should return 429 error
        expect(res.json).toHaveBeenCalledWith({ message: 'Too many requests from this IP, please try again later.' });

        // Fast-forward the timer by 15 minutes (the rate limit window)
        jest.advanceTimersByTime(15 * 60 * 1000);

        // Mock rate limiter for the third request (allow after window reset)
        const mockLimiterAfterReset = jest.fn((req: Request, res: Response, next: NextFunction) => next());
        (rateLimit as jest.Mock).mockReturnValueOnce(mockLimiterAfterReset);

        // Third request - Should pass after window reset
        rateLimiter(req, res, next);
        expect(next).toHaveBeenCalledTimes(2); // Next should be called again after reset
        expect(res.status).not.toHaveBeenCalled(); // No error on third request

        jest.useRealTimers(); // Restore real timers after the test
    });

    // Use-case 5: Proper rate limiting headers are set
    it('should return correct rate limiting headers in the response', () => {
        const req = mockRequest();
        const res = mockResponse();

        // Mocking the rate limiter function to call next()
        const mockLimiter = jest.fn((req: Request, res: Response, next: NextFunction) => next());
        (rateLimit as jest.Mock).mockReturnValueOnce(mockLimiter);

        rateLimiter(req, res, next);

        expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Limit', expect.anything());
        expect(res.setHeader).toHaveBeenCalledWith('RateLimit-Remaining', expect.anything());
        expect(next).toHaveBeenCalled();
    });
});
