import type { Response } from 'express';
import { ConfigService } from '@nestjs/config';
export declare function setAuthCookies(res: Response, cfg: ConfigService, tokens: {
    accessToken: string;
    refreshToken: string;
}): void;
export declare function clearAuthCookies(res: Response, cfg: ConfigService): void;
