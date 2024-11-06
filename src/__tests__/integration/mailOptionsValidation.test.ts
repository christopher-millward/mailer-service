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
const validText = 'Valid text';
const emptyField = '';
const missingField = undefined;

// Interface to allow fields to be deleted and improperly formatted. Mimics the MailOptions schema.
interface MockOptions {
    from: any;
    to: any;
    cc: any;
    bcc: any;
    subject: any;
    text: any;
    html: any;
    attachments: any;
    unwanted_field: any;
}

// Helper function to create new email body. Used to create a new, fully valid object at the beginning of each
// test. Has the ability to modify one field at a time.
const createMockOptions = (): Partial<MockOptions> =>  {
    return {
        from: validEmail,
        to: [validEmail],
        cc: [validEmail],
        bcc: [validEmail],
        subject: validText,
        text: validText
    };
};

interface Scenario {
    input: Partial<MockOptions>;
    expected_status: number;
    desc: string;
}

// Helper function to generate tests
function createTests(scenario: Scenario, app: Express){
    it(scenario.desc, async ()=>{
        const options: Partial<MockOptions> = updateFields(createMockOptions(), scenario);

        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(scenario.expected_status);
    });
}

// Utility function to update fields
function updateFields(targetObject: Partial<MockOptions>, updates: Scenario): Partial<MockOptions>{
    const modifiedObject = targetObject;

    for (const key in updates.input){
        const typedKey = key as keyof MockOptions;
        updates.input[typedKey] === missingField ? delete modifiedObject[typedKey] : modifiedObject[typedKey] = updates.input[typedKey];
    }
    return modifiedObject;
}


describe('validate FROM field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {from: validEmail},
            expected_status: 200,
            desc: 'Should validate valid email'
        }, 
        {
            input: {from: invalidEmail},
            expected_status: 400,
            desc: 'Should invalidate invalid email'
        },
        {
            input: {from: validEmailArray},
            expected_status: 400,
            desc: 'Should invalidate valid email in array'
        }, 
        {
            input: {from: invalidEmailArray},
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: {from: validEmails},
            expected_status: 400,
            desc: 'Should invalidate valid emails in array'
        }, 
        {
            input: {from: mixedEmails},
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: {from: invalidEmails},
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: {from: emptyField},
            expected_status: 400,
            desc: 'Should invalidate empty field'
        },
        {
            input: {from: missingField},
            expected_status: 400,
            desc: 'Should invalidate missing field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, app))
});

describe('validate TO field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {to: validEmail},
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: {to: invalidEmail},
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: {to: validEmailArray},
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: {to: invalidEmailArray},
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: {to: validEmails},
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: {to: mixedEmails},
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: {to: invalidEmails},
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: {to: emptyField},
            expected_status: 400,
            desc: 'Should invalidate empty TO field'
        },
        {
            input: {to: missingField},
            expected_status: 400,
            desc: 'Should invalidate missing TO field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, app))
});

describe('validate CC field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {cc: validEmail},
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: {cc: invalidEmail},
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: {cc: validEmailArray},
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: {cc: invalidEmailArray},
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: {cc: validEmails},
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: {cc: mixedEmails},
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: {cc: invalidEmails},
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: {cc: emptyField},
            expected_status: 400,
            desc: 'Should invalidate empty CC field'
        },
        {
            input: {cc: missingField},
            expected_status: 200,
            desc: 'Should validate missing CC field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, app))
});

describe('validate BCC field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {bcc: validEmail},
            expected_status: 400,
            desc: 'Should invalidate valid email not in array'
        }, 
        {
            input: {bcc: invalidEmail},
            expected_status: 400,
            desc: 'Should invalidate invalid email not in array'
        },{
            input: {bcc: validEmailArray},
            expected_status: 200,
            desc: 'Should validate valid email in array'
        }, 
        {
            input: {bcc: invalidEmailArray},
            expected_status: 400,
            desc: 'Should invalidate invalid email in array'
        }, 
        {
            input: {bcc: validEmails},
            expected_status: 200,
            desc: 'Should validate valid emails in array'
        }, 
        {
            input: {bcc: mixedEmails},
            expected_status: 400,
            desc: 'Should invalidate mixed emails in array'
        }, 
        {
            input: {bcc: invalidEmails},
            expected_status: 400,
            desc: 'Should invalidate invalid emails in array'
        },
        {
            input: {bcc: emptyField},
            expected_status: 400,
            desc: 'Should invalidate empty BCC field'
        },
        {
            input: {bcc: missingField},
            expected_status: 200,
            desc: 'Should validate missing BCC field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario) => createTests(scenario, app))
});

describe('validate subject field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {subject: validText},
            expected_status: 200,
            desc: 'Should validate valid subject field'
        }, 
        {
            input: {subject: emptyField},
            expected_status: 400,
            desc: 'Should invalidate invalid empty subject field'
        },
        {
            input: {subject: missingField},
            expected_status: 400,
            desc: 'Should invalidate invalid missing subject field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, app))
});

describe('validate text field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });
    //Define test cases
    const scenarios: Scenario[] = [
        {
            input: {text: validText},
            expected_status: 200,
            desc: 'Should validate valid text field'
        }, 
        {
            input: {text: emptyField},
            expected_status: 200,
            desc: 'Should invalidate invalid empty text field'
        },
        {
            input: {text: missingField},
            expected_status: 400,
            desc: 'Should invalidate invalid missing text field'
        }
    ]
    // Run tests
    scenarios.forEach((scenario)=>createTests(scenario, app))
});

describe('validate HTML field', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Define test cases
    const scenarios: Scenario[] = [
        {
            input: {html: validText, text: missingField},
            expected_status: 200,
            desc: 'Should allow non-html content to be passed as HTML'
            // Since HTML is sent as String during transport, the validation middleware
            // only checks if it's a valid string.
        },
        {
            input: {html: emptyField, text: missingField},
            expected_status: 400,
            desc: 'Should invalidate empty HTML'
        }, 
        {
            input: {html: missingField, text: validText},
            expected_status: 200,
            desc: 'Should allow missing HTML'
        }
    ];

    // Run tests
    scenarios.forEach((scenario) => createTests(scenario, app));
});

describe('validate the ensurance of only text or html fields present', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Define test cases for text and html fields
    const scenarios: Scenario[] = [
        {
            input: {
                text: validText,
                html: validText
            },
            expected_status: 400,
            desc: 'Should invalidate presence of both text and html'
        },
        {
            input: {
                text: validText,
                html: missingField
            },
            expected_status: 200,
            desc: 'Should validate presence of text only'
        },
        {
            input: {
                text: missingField,
                html: validText
            },
            expected_status: 200,
            desc: 'Should validate presence of html only'
        },
        {
            input: {
                text: missingField,
                html: emptyField
            },
            expected_status: 400,
            desc: 'Should invalidate missing text and empty html'
        },
        {
            input: {
                text: emptyField,
                html: missingField
            },
            expected_status: 400,
            desc: 'Should invalidate empty text and missing html'
        },
        {
            input: {
                text: emptyField,
                html: emptyField
            },
            expected_status: 400,
            desc: 'Should invalidate empty text and html'
        },
        {
            input: {
                text: missingField,
                html: missingField
            },
            expected_status: 400,
            desc: 'Should invalidate absence of both text and html'
        }
    ];
    // Run tests
    scenarios.forEach((scenario) => createTests(scenario, app));
});

describe('Detect the presence of unwanted fields', () => {
    const app: Express = mockApp();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should invalidate the addition of an unwanted field', async()=>{
        const options: Partial<MockOptions> = createMockOptions();
        options.unwanted_field = 'unwanted data'

        const res = await request(app)
            .post('/send')
            .send(options);

        expect(res.status).toBe(400);
    });
});