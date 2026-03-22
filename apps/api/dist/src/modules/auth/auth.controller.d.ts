import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { ConfigService } from '@nestjs/config';
import type { Response, Request } from 'express';
export declare class AuthController {
    private readonly auth;
    private readonly cfg;
    constructor(auth: AuthService, cfg: ConfigService);
    private isProd;
    private cookieBaseOptions;
    private getClientUrl;
    private resolveServerOrigin;
    register(dto: RegisterDto, res: Response, req: Request): Promise<{
        user: {
            _id: string;
            email: any;
            displayName: any;
            role: any;
            emailVerified: boolean;
            createdAt: any;
            updatedAt: any;
        };
        verificationEmail: {
            attempted: boolean;
            sent: boolean;
            id: string | null;
            error: string | null;
        };
    }>;
    login(dto: LoginDto, res: Response): Promise<{
        user: {
            _id: string;
            email: any;
            displayName: any;
            role: any;
            emailVerified: boolean;
            createdAt: any;
            updatedAt: any;
        };
    }>;
    me(user: any): Promise<{
        sub: any;
        email: any;
        role: any;
    }>;
    logout(res: Response): Promise<{
        success: boolean;
    }>;
    getWsTicket(user: any): Promise<{
        token: string;
    }>;
    verifyEmail(res: Response, token?: string): Promise<void>;
    googleStart(req: Request, res: Response, intent?: 'login' | 'signup'): Promise<void>;
    googleCallback(req: Request, res: Response, code?: string, state?: string): Promise<void>;
    githubStart(req: Request, res: Response, intent?: 'login' | 'signup'): Promise<void>;
    githubCallback(req: Request, res: Response, code?: string, state?: string): Promise<void>;
}
