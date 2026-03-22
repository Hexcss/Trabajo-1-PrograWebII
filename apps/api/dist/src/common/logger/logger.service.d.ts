import { LoggerService as NestLoggerService } from '@nestjs/common';
type LogMessage = string | Record<string, unknown> | Error;
export declare class AppLogger implements NestLoggerService {
    private defaultContext;
    private readonly service;
    private readonly revision;
    private readonly configuration;
    private readonly isCloud;
    log(message: LogMessage, context?: string, requestId?: string): void;
    error(message: LogMessage, trace?: string, context?: string, requestId?: string): void;
    warn(message: LogMessage, context?: string, requestId?: string): void;
    debug(message: LogMessage, context?: string, requestId?: string): void;
    verbose(message: LogMessage, context?: string, requestId?: string): void;
    private print;
    private getColor;
}
export {};
