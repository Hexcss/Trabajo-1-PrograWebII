"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const core_1 = require("@nestjs/core");
const app_module_1 = require("./app.module");
const logging_interceptor_1 = require("./common/interceptors/logging.interceptor");
const all_exceptions_filter_1 = require("./common/filters/all-exceptions.filter");
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const swagger_1 = require("@nestjs/swagger");
const logger_service_1 = require("./common/logger/logger.service");
const request_id_middleware_1 = require("./common/middlewares/request-id.middleware");
const validation_pipe_1 = require("./common/pipes/validation.pipe");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const fs_1 = require("fs");
const path_1 = require("path");
const config_1 = require("@nestjs/config");
async function bootstrap() {
    const app = await core_1.NestFactory.create(app_module_1.AppModule, { bufferLogs: true, logger: ['error', 'warn', 'log', 'debug'] });
    const cfg = app.get(config_1.ConfigService);
    const logger = app.get(logger_service_1.AppLogger);
    app.useLogger(logger);
    app.use(request_id_middleware_1.requestIdMiddleware);
    app.use((0, helmet_1.default)());
    const origins = cfg.get('corsOrigins') ?? [];
    app.enableCors({
        origin: (origin, cb) => {
            if (!origin)
                return cb(null, true);
            const allowed = origins.length > 0 ? origins : ['http://localhost:5173', 'https://store.hexcss.com'];
            if (allowed.includes(origin))
                return cb(null, true);
            return cb(new Error(`Not allowed by CORS: ${origin}`), false);
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    });
    app.use((0, cookie_parser_1.default)());
    app.use((0, morgan_1.default)('combined', {
        stream: {
            write: (message) => logger.log(message.trim(), 'HTTP'),
        },
    }));
    app.useGlobalInterceptors(new logging_interceptor_1.LoggingInterceptor(logger));
    app.useGlobalFilters(new all_exceptions_filter_1.AllExceptionsFilter(logger));
    app.useGlobalPipes(new validation_pipe_1.ValidationPipe(logger));
    const swaggerConfig = new swagger_1.DocumentBuilder()
        .setTitle('API Template')
        .setDescription('Reusable NestJS API template for microservices')
        .setVersion('1.0')
        .build();
    const swaggerDoc = swagger_1.SwaggerModule.createDocument(app, swaggerConfig);
    swagger_1.SwaggerModule.setup('docs', app, swaggerDoc);
    if (process.env.NODE_ENV !== 'production') {
        const docsDir = (0, path_1.join)(process.cwd(), 'docs');
        (0, fs_1.mkdirSync)(docsDir, { recursive: true });
        const docsPath = (0, path_1.join)(docsDir, 'openapi.json');
        (0, fs_1.writeFileSync)(docsPath, JSON.stringify(swaggerDoc, null, 2));
        logger.log(`Swagger JSON exported to ${docsPath}`, 'Bootstrap');
    }
    else {
        logger.log('Production mode: Swagger JSON file not generated', 'Bootstrap');
    }
    const port = process.env.PORT ?? 3000;
    await app.listen(port);
    logger.log(`Server running on http://localhost:${port}`, 'Bootstrap');
    logger.log(`Docs at /docs (UI active even in prod)`, 'Bootstrap');
}
void bootstrap();
//# sourceMappingURL=main.js.map