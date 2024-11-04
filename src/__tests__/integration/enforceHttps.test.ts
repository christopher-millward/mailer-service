import { enforceHttps } from '../../middlewares/enforceHttps';
import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import https from 'https';
import fs from 'fs';
import { join } from 'path';
import { config } from '../../config/env';

// Mock the config
jest.mock('../../config/env', () => ({
    config: {
        environment: 'production', // Default mock for production, will override in specific tests
    },
}));

// Create a self-signed SSL certificate for testing
const createSelfSignedCert = () => {
    const certsDir = join(__dirname, 'test certs');
    if (!fs.existsSync(certsDir)) {
        fs.mkdirSync(certsDir); // Create directory if it does not exist
    }
    
    const { execSync } = require('child_process');
    execSync(`openssl req -x509 -newkey rsa:2048 -keyout "${join(certsDir, 'key.pem')}" -out "${join(certsDir, 'cert.pem')}" -days 365 -nodes -subj "/CN=localhost"`);
};

createSelfSignedCert();

const key = fs.readFileSync(join(__dirname, 'test certs', 'key.pem'));
const cert = fs.readFileSync(join(__dirname, 'test certs', 'cert.pem'));
const httpsAgent = new https.Agent({ca: cert, rejectUnauthorized: false});

describe('enforceHttps Middleware', () => {
    let app: Express;
    let httpsServer: https.Server;

    beforeEach(() => {
        app = express();
        app.use(enforceHttps); // use middleware
        app.post('/test', (req: Request, res: Response) => {
            res.status(200).json({ message: 'Success' });
        });

        httpsServer = https.createServer({key, cert}, app);
    });

    afterEach(() => {
        httpsServer.close();
        jest.clearAllMocks();
    });

    // Use-case 1: HTTPS in production
    it('should call next() and return 200 if the request is HTTPS in production', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');

        const response = await request(httpsServer)
            .post('/test')
            .agent(httpsAgent);

        expect(redirectSpy).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    // Use-case 2: HTTP in production
    it('should call res.redirect() if the request is HTTP in production', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');

        const response = await request(app)
            .post('/test');

        expect(redirectSpy).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(302);
    });
    // Use-case 3: HTTPS from proxy in production
    it('should call next() and return 200 if the request is HTTPS from a proxy in production', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');

        const response = await request(httpsServer)
            .post('/test')
            .set('X-Forwarded-Proto', 'https')
            .agent(httpsAgent);

        expect(redirectSpy).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    // Use-case 4: HTTPS request in development
    it('should call next() and return 200 if the request is HTTPS in development', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');
        config.environment = 'development'

        const response = await request(httpsServer)
            .post('/test')
            .agent(httpsAgent);

        expect(redirectSpy).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    // Use-case 5: HTTP request from localhost in development
    it('should call next() and return 200 if the request is HTTP from localhost in development', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');
        config.environment = 'development';

        const response = await request(app)
            .post('/test')
            .set('Host', 'localhost');

        expect(redirectSpy).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    // Use-case 6: HTTP request in development (non-localhost)
    it('should call res.redirect() if the request is HTTP in development (non-localhost)', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');
        config.environment = 'development';

        const response = await request(app)
            .post('/test')
            .set('Host', 'example.com');

        expect(redirectSpy).toHaveBeenCalledTimes(1);
        expect(response.status).toBe(302);
    });

    // Use-case 7: HTTPS request from proxy in development
    it('should call next() and return 200 if the request is HTTPS from a proxy in development', async () => {
        const redirectSpy = jest.spyOn(express.response, 'redirect');
        config.environment = 'development';

        const response = await request(httpsServer)
            .post('/test')
            .set('X-Forwarded-Proto', 'https')
            .agent(httpsAgent);

        expect(redirectSpy).toHaveBeenCalledTimes(0);
        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });
});
