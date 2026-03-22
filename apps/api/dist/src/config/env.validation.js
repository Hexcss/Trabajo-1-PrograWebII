"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.envSchema = void 0;
const zod_1 = require("zod");
const ttlSchema = zod_1.z.union([
    zod_1.z.coerce.number().int().positive(),
    zod_1.z.string().regex(/^\d+(ms|s|m|h|d)?$/i),
]);
exports.envSchema = zod_1.z.object({
    PORT: zod_1.z.coerce.number().int().positive().default(4000),
    NODE_ENV: zod_1.z.enum(['development', 'production', 'test']).default('development'),
    LOG_LEVEL: zod_1.z.enum(['debug', 'info', 'warn', 'error']).default('info'),
    CORS_ORIGIN: zod_1.z.string().default(''),
    MONGO_URI: zod_1.z.string().min(1),
    JWT_ACCESS_SECRET: zod_1.z.string().min(1),
    JWT_REFRESH_SECRET: zod_1.z.string().min(1),
    JWT_ACCESS_EXPIRES: ttlSchema.default('15m'),
    JWT_REFRESH_EXPIRES: ttlSchema.default('7d'),
    STORAGE_BUCKET: zod_1.z.string().optional(),
    GCS_BUCKET: zod_1.z.string().optional(),
    RESEND_API_KEY: zod_1.z.string().optional(),
    OAUTH_GOOGLE_CLIENT_ID: zod_1.z.string().min(1),
    OAUTH_GOOGLE_CLIENT_SECRET: zod_1.z.string().min(1),
    OAUTH_GOOGLE_REDIRECT_URI: zod_1.z.string().url(),
    OAUTH_GITHUB_CLIENT_ID: zod_1.z.string().min(1),
    OAUTH_GITHUB_CLIENT_SECRET: zod_1.z.string().min(1),
    OAUTH_GITHUB_REDIRECT_URI: zod_1.z.string().url(),
    SUPPORT_WEBHOOK: zod_1.z.string().url().optional(),
});
//# sourceMappingURL=env.validation.js.map