import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthService } from '../../modules/auth/auth.service';
import { ConfigService } from '@nestjs/config';
export declare class AuthenticationGuard implements CanActivate {
    private readonly reflector;
    private readonly auth;
    private readonly cfg;
    private readonly logger;
    private readonly atName;
    private readonly rtName;
    private readonly debugEnabled;
    constructor(reflector: Reflector, auth: AuthService, cfg: ConfigService);
    canActivate(context: ExecutionContext): Promise<boolean>;
    private buildMeta;
}
