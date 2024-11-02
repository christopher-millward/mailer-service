import { enforceHttps } from '../../middlewares/enforceHttps';
import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import https from 'https';
import fs from 'fs';
import { join } from 'path';

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

    // Use-case 1: HTTPS request in production
    it('should response with 200 OK if HTTPS policy used in production', async () => {
        const httpsAgent = new https.Agent({
            ca: cert,
            rejectUnauthorized: false
        });

        const response = await request(httpsServer)
            .post('/test')
            .set('X-Forwarded-Proto', 'https')
            .agent(httpsAgent);


        expect(response.status).toBe(200);
        expect(response.body.message).toBe('Success');
    });

    // Use-case 2: HTTP request in production
    it('should respond with 302 (redirect) if HTTP policy used in production', async () => {
        const response = await request(app)
            .post('/test');

        expect(response.status).toBe(302);
    });

    // Use-case 3: HTTPS request in development

    // Use-case 4: HTTP request from localhost in development

    // Use-case 5: HTTP request in development (non-localhost)
});
