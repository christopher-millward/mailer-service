import { ResponseError } from "../types/responseError";
import { config } from "./env";
import { CorsOptions } from "cors";


// List of trusted origins allowed to access the server.
// This list is configured in the environment file.
const allowedOrigins: string[] = config.trustedOrigins;

/**
 * Configuration options for CORS (Cross-Origin Resource Sharing).
 * Specifies allowed origins, HTTP methods, credentials policy, and preflight cache duration.
 * @type {CorsOptions}
 */
export const corsOptions: CorsOptions = {
    origin: (
        origin: string | undefined, callback: (err: Error | null, allow?: boolean | string) => void) => {
        if (!origin) {
            // Allow requests without an origin header (server-to-server request).
            // Will pass to the API-key middleware for further auth
            callback(null, true);
        } else if (allowedOrigins.includes(origin)) {
            // Allow requests from trusted origins
            callback(null, origin);
        } else {
            // Block requests from untrusted origins.
            const error: ResponseError = new Error("Unauthorized Access: untrusted origin");
            error.status = 502;
            callback(error, false);
        }
    },
    methods: ['POST', 'OPTIONS'],   //Allowed methods
    credentials: false, // Do not require user authentication.
    maxAge: 60 * 15 // Preflight cache duration.
};