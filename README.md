# Automated Email Sender (Service)

## General Overview

This is a lightweight email-sending service built with TypeScript, Node.js, and Express. It uses the `nodemailer` library and the SMTP protocol to handle secure, automated email sending. The purpose of this service is to provide an API endpoint that allows developers to automate email workflows in their applications. 

For example, if a user creates a custom intake form, this endpoint can be reached to send a confirmation email to the form's submitter upon form submission.

### Key Features
- **Authentication Options**:
  - **CORS-Based Authentication**: Ensures requests are from trusted clients.
  - **API Key Authentication**: Enables secure access from other server applications.
- **Event Logging**:
  - Logs all HTTP requests and their results.
  - Works in both serverless and stateful server environments.
- **Email Content Validation**:
  - Validates all email fields (`to`, `from`, `subject`, `body`, etc.).
- **Security Enhancements**:
  - Enforces HTTPS protocol.
  - Implements HTTP header security to mitigate risks like XSS, clickjacking, and MIME type sniffing.
- **Rate Limiting**:
  - Protects against DDoS attacks and other malicious activity.
- **Testing Suite**:
  - Comprehensive integration and unit tests for all middleware.

This service is ideal for developers seeking a secure and efficient solution for automating email-sending processes in their applications.

---

## Installation

### Prerequisites
- Node.js (v18.0.0 or higher)
- NPM
- TypeScript compiler

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

4. Compile the TypeScript code (not always required)
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
### Request Headers
### Request Body
### Responses
#### Success
#### Error
### Example useage

---

## Validation and Authentication
[use of CORS and apiKeyAuth]

---

## Lisence

---

## Contact
This project was built independently by Christopher Millward. If you have any questions, please feel free to reach out at cmillwar@uwo.ca.