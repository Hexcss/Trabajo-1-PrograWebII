"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CoreModule = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const throttler_1 = require("@nestjs/throttler");
const authentication_guard_1 = require("../../common/guards/authentication.guard");
const all_exceptions_filter_1 = require("../../common/filters/all-exceptions.filter");
const logging_interceptor_1 = require("../../common/interceptors/logging.interceptor");
const class_validator_1 = require("class-validator");
const users_module_1 = require("../../modules/users/users.module");
const auth_module_1 = require("../../modules/auth/auth.module");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../../common/logger/logger.service");
const authorization_guard_1 = require("../../common/guards/authorization.guard");
let CoreModule = class CoreModule {
    moduleRef;
    constructor(moduleRef) {
        this.moduleRef = moduleRef;
    }
    onModuleInit() {
        (0, class_validator_1.useContainer)(this.moduleRef, { fallbackOnErrors: true });
    }
};
exports.CoreModule = CoreModule;
exports.CoreModule = CoreModule = __decorate([
    (0, common_1.Global)(),
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            throttler_1.ThrottlerModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (cfg) => [
                    {
                        ttl: Number(cfg.get('RATE_LIMIT_TTL_MS') ?? 60_000),
                        limit: Number(cfg.get('RATE_LIMIT_LIMIT') ?? 500),
                    },
                ],
            }),
            (0, common_1.forwardRef)(() => users_module_1.UsersModule),
            (0, common_1.forwardRef)(() => auth_module_1.AuthModule),
        ],
        providers: [
            logger_service_1.AppLogger,
            {
                provide: core_1.APP_PIPE,
                useFactory: () => new common_1.ValidationPipe({
                    whitelist: true,
                    forbidNonWhitelisted: false,
                    transform: true,
                    transformOptions: { enableImplicitConversion: true },
                    validationError: { target: false, value: false },
                    stopAtFirstError: false,
                }),
            },
            { provide: core_1.APP_GUARD, useClass: throttler_1.ThrottlerGuard },
            { provide: core_1.APP_GUARD, useClass: authentication_guard_1.AuthenticationGuard },
            { provide: core_1.APP_GUARD, useClass: authorization_guard_1.AuthorizationGuard },
            { provide: core_1.APP_INTERCEPTOR, useClass: logging_interceptor_1.LoggingInterceptor },
            { provide: core_1.APP_FILTER, useClass: all_exceptions_filter_1.AllExceptionsFilter },
        ],
    }),
    __metadata("design:paramtypes", [core_1.ModuleRef])
], CoreModule);
//# sourceMappingURL=core.module.js.map