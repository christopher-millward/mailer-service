# Automated Email Sender (Service)

## General Overview

This is a lightweight email-sending service built with TypeScript, Node.js, and Express. It uses the `nodemailer` library and the SMTP protocol to handle secure, automated email sending. The purpose of this service is to provide an API endpoint that allows developers to automate email workflows in their applications.

For example, if a user creates a custom intake form, this endpoint can be reached to send a confirmation email to the form's submitter upon form submission.

### Key Features
* **Authentication Options**:
  * **CORS-Based Authentication**: Ensures requests are from trusted clients.
  * **API Key Authentication**: Enables secure access from other server applications.
* **Event Logging**:
  * Logs all HTTP requests and their results.
  * Works in both serverless and stateful server environments.
* **Email Content Validation**:
  * Validates all email fields (`to`, `from`, `subject`, `body`, etc.).
* **Security Enhancements**:
  * Enforces HTTPS protocol.
  * Implements HTTP header security to mitigate risks like XSS, clickjacking, and MIME type sniffing.
* **Rate Limiting**:
  * Protects against DDoS attacks and other malicious activity.
* **Testing Suite**:
  * Comprehensive integration and unit tests for all middleware.

This service is ideal for developers seeking a secure and efficient solution for automating email-sending processes in their applications.

---

## Installation

### Prerequisites
* Node.js (v18.0.0 or higher)
* NPM
* TypeScript compiler

### Setup Instructions
1. Clone the repository:
   ```bash
   git clone https://github.com/christopher-millward/mailer-service
   cd mailer-service
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Create a `.env` file in the root directory and configure the environment variables (see the **Environment Configuration** section for required variables).

4. Compile the TypeScript code (Not always required)
    ```bash
    npm run build
    ```

5. Push to your desired hosting service.

Note: remember to always test code before (and during) production. 
  * A development server can be started up with hot-reloading by running
      ```bash
      npm run dev
      ```
  * The full testing suite can be executed by running 
      ```bash
      jest
      ```
  
---

## Environment Configuration

### Required `.env` Variables
Many of the configuration variables are stored as environment variables. The following variables must be included in order for the app to run:

```plaintext
SMTP_HOST           # SMTP server address
SMTP_PORT           # SMTP server port (default is 465 for SSL)
SMTP_USER           # SMTP username for authentication
SMTP_PASS           # SMTP password for authentication
API_KEYS            # Comma-separated list of valid API keys for server-to-server authentication
TRUSTED_ORIGINS     # Comma-separated list of CORS-allowed client origins
NODE_ENV            # Application environment. Accepted are 'production', 'development', and 'test'
PORT                # Port on which the server will run
```

Note:
* **SMTP Configuration**: Ensure the `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, and `SMTP_PASS` values correspond to your SMTP provider's settings.
* **API Keys**: Define keys for server-to-server authentication, as needed.
* **CORS Origins**: Use the `TRUSTED_ORIGINS` variable to specify the domains allowed to send requests to this service.
* **NODE_ENV**: Set to production when deploying to a live environment.
---

## API Usage

### Endpoint
`POST /mailer/send`

This is the only endpoint available in the API.

### Request Headers
* **Content-Type**: `application/json` (Required)<br>
  Specifies the format of the request body.  

* **x-api-key**: `string` (Required only if the request is not from a client)<br>
  API key for authenticating server-born requests. Ensure the key matches one of the allowed keys configured in the environment variables.


### Request Body
The request body must adhere to the `MailOptions` schema.

**MailOptions**:
* **from**: `string` (Required)  
  The email address of the sender.  

* **to**: `string[]` (Required)  
  An array of recipient email addresses that will appear in the "To" field.  

* **subject**: `string` (Required)  
  The subject line of the email.  

* **cc**: `string[]` (Optional)  
  An array of email addresses to include in the "Cc" field.  

* **bcc**: `string[]` (Optional)  
  An array of email addresses to include in the "Bcc" field.  

* **text**: `string` (Optional)  
  The plain text body of the email.  

* **html**: `string` (Optional)  
  The HTML body of the email.  

* **attachments**: `SimpleAttachment[]` (Optional)  
  An array of attachments to include with the email.  

**SimpleAttachment**:
* **filename**: `string` (Required)  
  The name of the file to attach.  

* **href**: `string` (Optional)  
  A publicly accessible URL for the file, if available.  

* **content**: `Buffer | string` (Optional)  
  The file content, either as a buffer or a base64-encoded string.  

* **cid**: `string` (Optional)  
  The content ID for using the attachment as an inline image in the HTML body.

Note:
  * One of the `text` or `html` fields is required in the request body, but will throw an error if both are present.
  * One of the `href` or `content` fields is required in each attachment object, but will throw and error if both are present.

---

### Example Usage

#### **Sending Request using JavaScript**
```javascript
const emailData = {
    from: "sender@example.com",
    to: ["recipient1@example.com", "recipient2@example.com"],
    subject: "Test Email",
    html: "<p>Hello! This is a <b>test email</b> sent via the API.</p>",
    attachments: [
        {
            filename: "example.txt",
            content: "SGVsbG8gd29ybGQ=" // Base64 encoded content
        }
    ]
};

async function sendEmail() {
    try {
        const response = await fetch("https://example-domain.com/mailer/send", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-api-key": "trusted-api-key"  // required if sent from backend
            },
            body: JSON.stringify(emailData)
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Email sent successfully:", data);
    } catch (error) {
        console.error("Error sending email:", error);
    }
}

sendEmail();
```

### Responses

#### Success
* **Status Code**: `200 OK`  
  **Response Body**:
  ```json
  {
      "message": "Email sent successfully",
      "details": {
          "messageId": "uniqueMessageId123",
          "response": "250 OK"
      }
  }
  ```

#### Errors
* **Status Code**: `400 Bad Request`<br>
  **Description**: Invalid request body, missing required fields, malformed data.

* **Status Code**: `401 Unauthorized`<br>
  **Description**: Invalid or missing API key in the x-api-key header.

* **Status Code**: `500 Internal Server Error`<br>
  **Description**: Server-side issue occurred while processing the email request.

---

## Lisence

---

## Contact
This project was built independently by Christopher Millward. If you have any questions, please feel free to reach out at cmillwar@uwo.ca.