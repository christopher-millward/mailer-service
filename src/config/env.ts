import dotenv from 'dotenv';
dotenv.config();

export const config = {
  smtpHost: process.env.SMTP_HOST as string,
  smtpPort: parseInt(process.env.SMTP_PORT as string, 10),
  smtpUser: process.env.SMTP_USER as string,
  smtpPass: process.env.SMTP_PASS as string,
  apiKey: process.env.API_KEY as string,
  port: process.env.PORT ? parseInt(process.env.PORT, 10) : 3000 as number,
  environment: process.env.NODE_ENV as string
};
