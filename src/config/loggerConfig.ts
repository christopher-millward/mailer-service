import winston from 'winston';
import path from 'path';

// Destructure the winston formatting functions for easier readability
const { combine, timestamp, printf } = winston.format;

// Define path to log
const logFilePath: string = path.join(__dirname, '../../logs/access.log');

// Create a logger instance configuration
export const createLogger = (logLevel: string) => {
    return winston.createLogger({
        level: logLevel,
        format: combine(
            timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
            printf(({ timestamp, level, message }) => {
                return `${timestamp} ${level}: ${message}`;
            })
            // Uncomment for colorizing console log in development
            // ,winston.format.colorize({all: true})
        ),
        transports: [
            new winston.transports.File({ filename: logFilePath }),
            // Uncomment for console logging in development
            // new winston.transports.Console()
        ],
    });
};
