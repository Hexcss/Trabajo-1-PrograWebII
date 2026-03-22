import { ArgumentMetadata, ValidationPipe as NestValidationPipe } from '@nestjs/common';
import { AppLogger } from '../logger/logger.service';
export declare class ValidationPipe extends NestValidationPipe {
    private readonly logger;
    constructor(logger: AppLogger);
    transform(value: unknown, metadata: ArgumentMetadata): Promise<unknown>;
}
