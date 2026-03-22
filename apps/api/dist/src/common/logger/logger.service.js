"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppLogger = void 0;
const common_1 = require("@nestjs/common");
let AppLogger = class AppLogger {
    defaultContext = 'App';
    service = process.env.K_SERVICE || 'local-service';
    revision = process.env.K_REVISION || 'local-revision';
    configuration = process.env.K_CONFIGURATION || 'local-config';
    isCloud = process.env.NODE_ENV === 'prod' || process.env.NODE_ENV === 'demo';
    log(message, context, requestId) {
        this.print('INFO', message, context, undefined, requestId);
    }
    error(message, trace, context, requestId) {
        this.print('ERROR', message, context, trace, requestId);
    }
    warn(message, context, requestId) {
        this.print('WARNING', message, context, undefined, requestId);
    }
    debug(message, context, requestId) {
        this.print('DEBUG', message, context, undefined, requestId);
    }
    verbose(message, context, requestId) {
        this.print('DEBUG', message, context, undefined, requestId);
    }
    print(severity, message, context, trace, requestId) {
        let formattedMessage;
        let stack;
        let extra;
        if (typeof message === 'string') {
            formattedMessage = message;
        }
        else if (message instanceof Error) {
            formattedMessage = message.message;
            stack = message.stack;
        }
        else {
            formattedMessage = JSON.stringify(message);
            extra = message;
        }
        const payload = {
            severity,
            message: formattedMessage,
            context: context || this.defaultContext,
            timestamp: new Date().toISOString(),
            trace,
            requestId,
            labels: {
                serviceContext: context || this.defaultContext,
                runtime: {
                    service: this.service,
                    revision: this.revision,
                    configuration: this.configuration,
                },
            },
            ...(extra ? { extra } : {}),
        };
        if (this.isCloud) {
            process.stdout.write(JSON.stringify(payload) + '\n');
        }
        else {
            const color = this.getColor(severity);
            const output = [
                `${color}${severity.padEnd(7)}\x1b[0m`,
                `[${payload.timestamp}]`,
                `[${payload.context}]`,
                `(${payload.requestId || 'no-reqid'})`,
                `→ ${payload.message}`,
            ].join(' ');
            process.stdout.write(output + '\n');
            if (trace) {
                process.stdout.write(`   \x1b[90m${trace}\x1b[0m\n`);
            }
            if (stack) {
                process.stdout.write(`   \x1b[90m${stack}\x1b[0m\n`);
            }
        }
    }
    getColor(severity) {
        switch (severity) {
            case 'ERROR':
                return '\x1b[31m';
            case 'WARNING':
                return '\x1b[33m';
            case 'INFO':
                return '\x1b[36m';
            case 'DEBUG':
                return '\x1b[35m';
            default:
                return '\x1b[0m';
        }
    }
};
exports.AppLogger = AppLogger;
exports.AppLogger = AppLogger = __decorate([
    (0, common_1.Injectable)()
], AppLogger);
//# sourceMappingURL=logger.service.js.map