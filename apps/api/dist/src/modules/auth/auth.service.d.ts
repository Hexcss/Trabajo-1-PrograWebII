import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Role } from '../../common/enums/role.enum';
import { EmailService } from '../../shared/email/email.service';
type Tokens = {
    accessToken: string;
    refreshToken: string;
};
type OAuthIntent = 'login' | 'signup';
export declare class AuthService {
    private readonly users;
    private readonly jwt;
    private readonly cfg;
    private readonly email;
    private readonly logger;
    constructor(users: UsersService, jwt: JwtService, cfg: ConfigService, email: EmailService);
    private toSeconds;
    private signTokens;
    private publicUser;
    verifyToken(token: string, isRefresh?: boolean): Promise<any>;
    refreshWithToken(refreshToken: string): Promise<Tokens & {
        user: any;
    }>;
    register(email: string, password: string, displayName: string): Promise<{
        accessToken: string;
        refreshToken: string;
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
    login(email: string, password: string): Promise<{
        accessToken: string;
        refreshToken: string;
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
    logout(): Promise<{
        success: boolean;
    }>;
    createWsTicket(user: {
        sub: string;
        email: string;
        role: Role;
    }): Promise<string>;
    private generateStrongPassword;
    private getEmailVerifySecret;
    maybeSendEmailVerification(user: {
        _id: any;
        email: string;
        displayName?: string;
    }, serverOrigin: string): Promise<{
        attempted: boolean;
        sent: boolean;
        id: string | null;
        error: string | null;
    }>;
    verifyEmailToken(token: string): Promise<boolean>;
    private oauthLoginOrSignup;
    handleGoogleCode(code: string, redirectUri: string, intent: OAuthIntent): Promise<{
        accessToken: string;
        refreshToken: string;
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
    handleGithubCode(code: string, redirectUri: string, intent: OAuthIntent): Promise<{
        accessToken: string;
        refreshToken: string;
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
}
export {};
