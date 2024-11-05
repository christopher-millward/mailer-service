import express, {Express, Request, Response} from 'express';
import { validationHandler } from '../../middlewares/validation/validationHandler';
import request from 'supertest';
import path from 'path';
import fs from 'fs';

// Mock the interfaces to allow typing while also sending incorrect data
interface MockMailOptions{
    from: string,
    to: string[],
    subject: string,
    text:string,
    attachments?: any
}
interface MockSimpleAttachment {
    filename?: any,
    path?: any,
    cid?: any, 
    content?: any,
    unwanted_field?: any
}

// Helper function to create the test app
const mockApp = () => {
    const app: Express = express();
    app.use(express.json());
    app.post('/send', validationHandler, (req: Request, res: Response) => {
        res.status(200).json({ message: 'Validation passed' });
    });
    return app;
};

// Helper function to create a baseline request object
const createMailOptions = (): MockMailOptions=> {
    return {
        from: 'test@example.com',
        to: ['recipient@example.com'],
        subject: 'Test Email',
        text: 'Hello, World!'
    }
};

// Helper functions to create valid attachments
const createAttachmentWithPath = (): MockSimpleAttachment => ({
    filename: 'test.txt',
    path:'http://example.com/file.txt',
    cid: 'content-id'
});
const createAttachmentWithContent = (): MockSimpleAttachment => ({
    filename: 'test.txt',
    content: 'Sample Content',
    cid: 'content-id'
});

// Access the test files
const testFilesDir = path.resolve(__dirname, 'test files');
const testFiles = fs.readdirSync(testFilesDir);

describe('Attachment Validation Middleware', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should pass if attachment is fully valid', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);
        expect(res.status).toBe(200);
    });
    
    it('should return 400 if `filename` is missing', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        
        delete attachment.filename;
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Attachment filename must be a string');
    });

    it('should pass if `cid` is missing', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        
        delete attachment.cid;
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(200);
    });

    it('should pass if `content` is a String', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(200);
    });

    it('should pass if `content` is a Buffer', async () => {
        const buffer: Buffer = fs.readFileSync(path.join(testFilesDir, testFiles[0]));
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        attachment.content = buffer.toString('base64'); // required transfer format
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);
            
        expect(res.status).toBe(200);
    });
    
    it('should return 400 if `content` is not string or buffer', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        
        attachment.content = [1, 2, 3, 4]
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
    });

    it('should return 400 if attachment is both `path` and `content`', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        attachment.path = 'http://example.com/file.txt'
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Each attachment must contain either `path` or `content`, but not both or neither.');
        
    });

    it('should return 400 if both `path` and `content` are missing', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        delete attachment.path 
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Each attachment must contain either `path` or `content`, but not both or neither.');
        
    });

    it('should return 400 if random fields are added to attachment obj', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        attachment.unwanted_field = 'test' 
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Attachment contains an invalid field: unwanted_field');
        
    });

    it('should pass if empty array of attachments in request body', async () => {
        const options: MockMailOptions = createMailOptions();
        options.attachments = []

        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(200);
    });

    it('should pass if sending 2 valid attachments', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment1 = createAttachmentWithPath();
        const attachment2 = createAttachmentWithContent();
        options.attachments = [attachment1, attachment2];
        
        const res = await request(app)
            .post('/send')
            .send(options);
    
        expect(res.status).toBe(200);
    });
    
    it('should return 400 if sending 3 attachments: 2 valid and 1 invalid', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment1 = createAttachmentWithPath();
        const attachment2 = createAttachmentWithContent();
        const attachment3 = createAttachmentWithPath();
        delete attachment3.filename; // Making it invalid
    
        options.attachments = [attachment1, attachment2, attachment3];
        
        const res = await request(app)
            .post('/send')
            .send(options);
    
        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Attachment filename must be a string');
    });

    it('should pass if an array of multiple (5) attachments of varying filetype', async () => {
        const attachments: MockSimpleAttachment[] = testFiles.slice(0, 5).map((file) => {
            const attachment = createAttachmentWithContent();
            const buffer = fs.readFileSync(path.join(testFilesDir, file));
            attachment.content = buffer.toString('base64'); // required transport format
            return attachment
        });

        const options: MockMailOptions = createMailOptions();
        options.attachments = attachments;

        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(200);
    });
});