import express, { Request, Response, Express } from 'express';
import request from 'supertest';
import { validationHandler } from '../../middlewares/validation/validationHandler';

// Helper function to create the test app
const mockApp = () => {
    const app: Express = express();
    app.use(express.json());
    app.post('/send', validationHandler, (req: Request, res: Response) => {
        res.status(200).json({ message: 'Validation passed' });
    });
    return app;
};

// Define all valid/ invalid fields
const validEmail = 'test@example.com';
const invalidEmail = 'invalid-email';
const validEmailArray = [validEmail];
const invalidEmailArray = [invalidEmail];
const validEmails = [validEmail, 'test2@example.com'];
const mixedEmails = [validEmail, invalidEmail];
const invalidEmails = [invalidEmail, invalidEmail];
const validText = 'Valid text'
const emptyField = '';
const missingField = undefined;
const sqlInjection = "' OR 1=1 -- ";
const xssInjection = '<script>alert("XSS")</script>';

// Interface to allow fields to be deleted and improperly formatted. Mimics the MailOptions schema.
interface MockOptions{
    from: any;
    to: any;
    cc: any;
    bcc: any;
    subject: any;
    text: any;
    html: any;
    attachments: any;
}

// Helper function to create new email body. Used to create a new, fully valid object at the beginning of each
// test. Has the ability to modify one field at a time.
const createMockOptions = () =>  {
    return {
        from: validEmail,
        to: [validEmail],
        cc: [validEmail],
        bcc: [validEmail],
        subject: validText,
        text: validText
    } as MockOptions
}

// Interface for test parameters
interface Scenario {
    input: any,                 // the value to be assigned during the test
    expected_status: number,    // espected HTTP status code
    desc: string                // the description of the test behaviour (to be a parameter in the it() function)
}

// Helper function to generate tests
function createTests(scenario: Scenario, field: keyof MockOptions, app: Express){
    it(scenario.desc, async ()=>{
        const options: MockOptions = createMockOptions();
        options[field] = scenario.input;

        const res = await request(app)
            .post('/send')
            .send(options)

        expect(res.status).toBe(scenario.expected_status)
        // Could come back to add comparisson of response message.
    })
}

describe('validate FROM field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: validEmail,
            expected_status: 200,
            desc: 'Should validate valid email'
        }, 
        {
            input: invalidEmail,
            expected_status: 400,
            desc: 'Should invalidate invalid email'
        },{
            input: validEmailArray,
            expected_status: 400,
            desc: 'Should invalidate valid email in array'
        }, 
        {
            input: invalidEmailArray,
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: validEmails,
            expected_status: 400,
            desc: 'Should invalidate valid emails in array'
        }, 
        {
            input: mixedEmails,
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: invalidEmails,
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: emptyField,
            expected_status: 400,
            desc: 'Should invalidate empty TO field'
        },
        {
            input: missingField,
            expected_status: 400,
            desc: 'Should invalidate missing TO field'
        },
        {
            input: sqlInjection,
            expected_status: 400,
            desc: 'Should invalidate SQL injection (invalid email)'
        },
        {
            input: xssInjection,
            expected_status: 400,
            desc: 'Should invalidate XXS injection (invalid email)'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, 'from', app))
});

describe('validate TO field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: validEmail,
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: invalidEmail,
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: validEmailArray,
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: invalidEmailArray,
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: validEmails,
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: mixedEmails,
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: invalidEmails,
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: emptyField,
            expected_status: 400,
            desc: 'Should invalidate empty TO field'
        },
        {
            input: missingField,
            expected_status: 400,
            desc: 'Should invalidate missing TO field'
        },
        {
            input: sqlInjection,
            expected_status: 400,
            desc: 'Should invalidate SQL injection (invalid email)'
        },
        {
            input: xssInjection,
            expected_status: 400,
            desc: 'Should invalidate XXS injection (invalid email)'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, 'to', app))
});

describe('validate CC field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: validEmail,
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: invalidEmail,
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: validEmailArray,
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: invalidEmailArray,
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: validEmails,
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: mixedEmails,
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: invalidEmails,
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: emptyField,
            expected_status: 400,
            desc: 'Should invalidate empty CC field'
        },
        {
            input: missingField,
            expected_status: 200,
            desc: 'Should validate missing CC field'
        },
        {
            input: sqlInjection,
            expected_status: 400,
            desc: 'Should invalidate SQL injection (invalid email)'
        },
        {
            input: xssInjection,
            expected_status: 400,
            desc: 'Should invalidate XXS injection (invalid email)'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, 'cc', app))
});

describe('validate BCC field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: validEmail,
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: invalidEmail,
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: validEmailArray,
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: invalidEmailArray,
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: validEmails,
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: mixedEmails,
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: invalidEmails,
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: emptyField,
            expected_status: 400,
            desc: 'Should invalidate empty CC field'
        },
        {
            input: missingField,
            expected_status: 200,
            desc: 'Should validate missing CC field'
        },
        {
            input: sqlInjection,
            expected_status: 400,
            desc: 'Should invalidate SQL injection (invalid email)'
        },
        {
            input: xssInjection,
            expected_status: 400,
            desc: 'Should invalidate XXS injection (invalid email)'
        }
    ]
    // Run tests
    scenarios.forEach((scenario) => createTests(scenario, 'bcc', app))
});

describe('validate subject field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: validText,
            expected_status: 200,
            desc: 'Should validate valid subject field'
        }, 
        {
            input: emptyField,
            expected_status: 400,
            desc: 'Should invalidate invalid empty subject field'
        },
        {
            input: missingField,
            expected_status: 400,
            desc: 'Should invalidate invalid missing subject field'
        },
        {
            input: sqlInjection,
            expected_status: 200,
            desc: 'Should validate escaped SQL injection'
        },
        {
            input: xssInjection,
            expected_status: 200,
            desc: 'Should validate escaped XXS injection'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, 'subject', app))
});

describe('validate text field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    //Define test cases
    const scenarios: Scenario[] = [
        {
            input: validText,
            expected_status: 200,
            desc: 'Should validate valid text field'
        }, 
        {
            input: emptyField,
            expected_status: 200,
            desc: 'Should invalidate invalid empty text field'
        },
        {
            input: missingField,
            expected_status: 400,
            desc: 'Should invalidate invalid missing text field'
        },
        {
            input: sqlInjection,
            expected_status: 200,
            desc: 'Should validate escaped SQL injection in text field'
        },
        {
            input: xssInjection,
            expected_status: 200,
            desc: 'Should validate escaped XXS injection in text field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, 'text', app))
});