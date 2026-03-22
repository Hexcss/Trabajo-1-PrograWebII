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
exports.AllExceptionsFilter = void 0;
const common_1 = require("@nestjs/common");
const zod_1 = require("zod");
const logger_service_1 = require("../logger/logger.service");
let AllExceptionsFilter = class AllExceptionsFilter {
    logger;
    constructor(logger) {
        this.logger = logger;
    }
    catch(exception, host) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse();
        const request = ctx.getRequest();
        let status = common_1.HttpStatus.INTERNAL_SERVER_ERROR;
        let messages = ['Internal server error'];
        if (exception instanceof common_1.HttpException) {
            status = exception.getStatus();
            const res = exception.getResponse();
            if (typeof res === 'string') {
                messages = [res];
            }
            else if (typeof res === 'object' && res !== null) {
                const resObj = res;
                const messageField = resObj['message'];
                if (typeof messageField === 'string') {
                    messages = [messageField];
                }
                else if (Array.isArray(messageField) &&
                    messageField.every((m) => typeof m === 'string')) {
                    messages = messageField;
                }
            }
        }
        else if (exception instanceof zod_1.ZodError) {
            status = common_1.HttpStatus.BAD_REQUEST;
            messages = exception.issues.map((issue) => `${issue.path.join('.')}: ${issue.message}`);
        }
        else if (exception instanceof Error) {
            messages = [exception.message];
        }
        this.logger.error({
            event: 'exception',
            status,
            messages,
            path: request.url,
            method: request.method,
            requestId: request.headers['x-request-id'],
            stack: exception instanceof Error ? exception.stack : undefined,
        }, exception instanceof Error ? exception.stack : undefined, 'ExceptionFilter');
        response.status(status).json({
            statusCode: status,
            errors: messages,
            path: request.url,
            timestamp: new Date().toISOString(),
            requestId: request.headers['x-request-id'],
        });
    }
};
exports.AllExceptionsFilter = AllExceptionsFilter;
exports.AllExceptionsFilter = AllExceptionsFilter = __decorate([
    (0, common_1.Catch)(),
    __metadata("design:paramtypes", [logger_service_1.AppLogger])
], AllExceptionsFilter);
//# sourceMappingURL=all-exceptions.filter.js.map