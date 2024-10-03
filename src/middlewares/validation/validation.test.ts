import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { validateRequest } from './validationRequest';

// Mock the validator library
jest.mock('express-validator', () => ({
check: () => ({
    isEmail: jest.fn().mockReturnThis(),
    withMessage: jest.fn().mockReturnThis(),
    notEmpty: jest.fn().mockReturnThis(),
    escape: jest.fn().mockReturnThis(),
}),
validationResult: jest.fn(),
}));

// Create mock Request, Response, and Next objects for the function to interact with
const mockRequest = (body: object) => ({ body } as unknown as Request);
const mockResponse = () => {
const res = {} as Response;
res.status = jest.fn().mockReturnThis();
res.json = jest.fn();
return res;
};
const next = jest.fn() as NextFunction;


describe('Validation Middleware Tests', () => {

// Clear all mocks between tests
beforeEach(() => {
    jest.clearAllMocks();
});

/**
 * @description Helper function to mock validationResult for valid and invalid cases.
 * @param {boolean} isEmpty - Whether the request contains validation errors.
 * @param {any[]} errors - (Optional) An array of errors expected from the validation process.
 */
const mockValidationResult = (isEmpty: boolean, errors: any[] = []) => {
    (validationResult as unknown as jest.Mock).mockReturnValueOnce({
    isEmpty: jest.fn().mockReturnValue(isEmpty),
    array: jest.fn().mockReturnValue(errors),
    });
};

// Happy Test (all good)
it('should call next() when all fields are valid', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: 'Valid Subject',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(true); // No validation errors

    validateRequest(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
});

// Test mixed valid/invalid fields
it('should return 400 and validation error for invalid email', () => {
    const req = mockRequest({
    to: 'invalid-email',
    subject: 'Valid Subject',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Invalid email address' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Invalid email address' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 and validation error for empty subject', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: '',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Subject cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Subject cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 and validation error for empty text', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: 'Valid Subject',
    text: '',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Message cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Message cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 with multiple validation errors for invalid email and empty text', () => {
    const req = mockRequest({
    to: 'invalid-email',
    subject: 'Valid Subject',
    text: '',
    });
    const res = mockResponse();

    mockValidationResult(false, [
    { msg: 'Invalid email address' },
    { msg: 'Message cannot be empty' },
    ]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [
        { msg: 'Invalid email address' },
        { msg: 'Message cannot be empty' },
    ],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 with multiple validation errors for invalid email and empty subject', () => {
    const req = mockRequest({
    to: 'invalid-email',
    subject: '',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [
    { msg: 'Invalid email address' },
    { msg: 'Subject cannot be empty' },
    ]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [
        { msg: 'Invalid email address' },
        { msg: 'Subject cannot be empty' },
    ],
    });
    expect(next).not.toHaveBeenCalled();
});

// SQL injection
it('should return 400 when SQL injection attempt is made in email field', () => {
    const req = mockRequest({
    to: "valid@example.com'; DROP TABLE users;--",
    subject: 'Valid Subject',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Invalid email address' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Invalid email address' }],
    });
    expect(next).not.toHaveBeenCalled();
});
it('should return 400 when SQL injection attempt is made in subject field', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: "Test'; DROP TABLE users;--",
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Subject cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Subject cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 when SQL injection attempt is made in text field', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: 'Valid Subject',
    text: "Test'; DROP TABLE users;--",
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Message cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Message cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});

// XSS injection
it('should return 400 when XSS injection is attempted in email field', () => {
    const req = mockRequest({
    to: '<script>alert("XSS")</script>@example.com',
    subject: 'Valid subject',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Invalid email address' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Invalid email address' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 when XSS injection is attempted in subject field', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: '<script>alert("XSS")</script>',
    text: 'Valid message content',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Subject cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Subject cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});

it('should return 400 when XSS injection is attempted in text field', () => {
    const req = mockRequest({
    to: 'valid@example.com',
    subject: 'Valid Subject',
    text: '<script>alert("XSS")</script>',
    });
    const res = mockResponse();

    mockValidationResult(false, [{ msg: 'Message cannot be empty' }]);

    validateRequest(req, res, next);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
    errors: [{ msg: 'Message cannot be empty' }],
    });
    expect(next).not.toHaveBeenCalled();
});
});
