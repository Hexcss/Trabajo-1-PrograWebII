import { z } from 'zod';
export declare const envSchema: z.ZodObject<{
    PORT: z.ZodDefault<z.ZodCoercedNumber<unknown>>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<{
        development: "development";
        production: "production";
        test: "test";
    }>>;
    LOG_LEVEL: z.ZodDefault<z.ZodEnum<{
        error: "error";
        debug: "debug";
        info: "info";
        warn: "warn";
    }>>;
    CORS_ORIGIN: z.ZodDefault<z.ZodString>;
    MONGO_URI: z.ZodString;
    JWT_ACCESS_SECRET: z.ZodString;
    JWT_REFRESH_SECRET: z.ZodString;
    JWT_ACCESS_EXPIRES: z.ZodDefault<z.ZodUnion<readonly [z.ZodCoercedNumber<unknown>, z.ZodString]>>;
    JWT_REFRESH_EXPIRES: z.ZodDefault<z.ZodUnion<readonly [z.ZodCoercedNumber<unknown>, z.ZodString]>>;
    STORAGE_BUCKET: z.ZodOptional<z.ZodString>;
    GCS_BUCKET: z.ZodOptional<z.ZodString>;
    RESEND_API_KEY: z.ZodOptional<z.ZodString>;
    OAUTH_GOOGLE_CLIENT_ID: z.ZodString;
    OAUTH_GOOGLE_CLIENT_SECRET: z.ZodString;
    OAUTH_GOOGLE_REDIRECT_URI: z.ZodString;
    OAUTH_GITHUB_CLIENT_ID: z.ZodString;
    OAUTH_GITHUB_CLIENT_SECRET: z.ZodString;
    OAUTH_GITHUB_REDIRECT_URI: z.ZodString;
    SUPPORT_WEBHOOK: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export type EnvVars = z.infer<typeof envSchema>;
