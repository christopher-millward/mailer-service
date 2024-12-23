import express, {Express, Request, Response} from 'express';
import { validationHandler } from '../../middlewares/validation/validationHandler';
import request from 'supertest';
import { mockErrorHandler } from '../testUtilities/mockErrorHandler';

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
    href?: any,
    cid?: any, 
    content?: any,
    unwanted_field?: any
}

// Helper function to create the test app
const mockApp = () => {
    const app: Express = express();
    app.use(express.json());
    app.use(validationHandler);
    app.use(mockErrorHandler);
    app.post('/send', (req: Request, res: Response) => {
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
    href:'http://example.com/file.txt',
    cid: 'content-id'
});
const createAttachmentWithContent = (): MockSimpleAttachment => ({
    filename: 'test.txt',
    content: 'Sample Content',
    cid: 'content-id'
});

describe('Attachment Validation Middleware', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Since this suite applies validationHandler instead of attachmentValidation, it
    // also inherently tests the conditional call to the attachmentValidation middleware.
    
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
        const buffer: Buffer = Buffer.from('Hello, world!');
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        attachment.content = buffer.toString('base64');
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);
            
        expect(res.status).toBe(200);
    });

    it('should return 400 if `content` is a Buffer that is not properly encoded', async () => {
        const buffer: Buffer = Buffer.from('Hello, world!');
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        attachment.content = buffer;
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);
        
        expect(res.status).toBe(400);
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

    it('should return 400 if attachment is both `href` and `content`', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithContent();
        attachment.href = 'http://example.com/file.txt'
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Each attachment must contain either `href` or `content`, but not both or neither.');
        
    });

    it('should return 400 if both `href` and `content` are missing', async () => {
        const options: MockMailOptions = createMailOptions();
        const attachment = createAttachmentWithPath();
        delete attachment.href 
        options.attachments = [attachment];
        
        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
        expect(res.body.errors[0].msg).toBe('Each attachment must contain either `href` or `content`, but not both or neither.');
        
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
});