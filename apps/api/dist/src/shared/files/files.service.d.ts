import { ConfigService } from '@nestjs/config';
import type { EnvVars } from '../../config/env.validation';
export declare class FilesService {
    private readonly config;
    private readonly storage;
    private readonly bucketName;
    constructor(config: ConfigService<EnvVars, true>);
    upload(file: Express.Multer.File, userId: string, folder?: string): Promise<{
        url: string;
        key: string;
        filename: string;
        size: number;
        mimeType: string;
    }>;
    deleteByUrl(url: string): Promise<{
        success: boolean;
    }>;
    getFilenameFromUrl(url: string): string;
    getObjectPathFromUrl(url: string): string;
    private publicUrl;
    private sanitizeBase;
}
