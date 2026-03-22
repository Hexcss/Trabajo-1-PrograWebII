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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const common_1 = require("@nestjs/common");
const auth_service_1 = require("./auth.service");
const register_dto_1 = require("./dto/register.dto");
const login_dto_1 = require("./dto/login.dto");
const config_1 = require("@nestjs/config");
const cookie_util_1 = require("../../common/utils/cookie.util");
const user_decorator_1 = require("../../common/decorators/user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
const authentication_guard_1 = require("../../common/guards/authentication.guard");
const swagger_1 = require("@nestjs/swagger");
const crypto_1 = require("crypto");
let AuthController = class AuthController {
    auth;
    cfg;
    constructor(auth, cfg) {
        this.auth = auth;
        this.cfg = cfg;
    }
    isProd() {
        const v = (this.cfg.get('NODE_ENV') || process.env.NODE_ENV || '').toLowerCase();
        return v === 'production';
    }
    cookieBaseOptions() {
        return {
            httpOnly: true,
            sameSite: 'lax',
            secure: this.isProd(),
            path: '/',
            maxAge: 10 * 60 * 1000,
        };
    }
    getClientUrl() {
        const explicit = this.cfg.get('clientUrl');
        if (explicit)
            return explicit;
        const origins = (this.cfg.get('CORS_ORIGIN') ?? '')
            .split(',')
            .map((s) => s.trim())
            .filter(Boolean);
        return origins[0] || 'http://localhost:5173';
    }
    resolveServerOrigin(req) {
        const xfProto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const xfHost = req.headers['x-forwarded-host'] || req.get('host');
        const host = xfHost || this.cfg.get('publicHost');
        const proto = xfProto || 'http';
        return `${proto}://${host}`;
    }
    async register(dto, res, req) {
        const result = await this.auth.register(dto.email, dto.password, dto.displayName);
        (0, cookie_util_1.setAuthCookies)(res, this.cfg, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
        const origin = this.resolveServerOrigin(req);
        const verificationEmail = await this.auth.maybeSendEmailVerification(result.user, origin);
        return { user: result.user, verificationEmail };
    }
    async login(dto, res) {
        const result = await this.auth.login(dto.email, dto.password);
        (0, cookie_util_1.setAuthCookies)(res, this.cfg, {
            accessToken: result.accessToken,
            refreshToken: result.refreshToken,
        });
        return { user: result.user };
    }
    async me(user) {
        return { sub: user.sub, email: user.email, role: user.role };
    }
    async logout(res) {
        await this.auth.logout();
        (0, cookie_util_1.clearAuthCookies)(res, this.cfg);
        return { success: true };
    }
    async getWsTicket(user) {
        const token = await this.auth.createWsTicket(user);
        return { token };
    }
    async verifyEmail(res, token) {
        if (!token)
            throw new common_1.BadRequestException('Missing token');
        await this.auth.verifyEmailToken(token);
        const url = this.getClientUrl() + '/market';
        return res.redirect(303, url);
    }
    async googleStart(req, res, intent = 'login') {
        const origin = this.resolveServerOrigin(req);
        const redirectUri = `${origin}/auth/oauth/google/callback`;
        const clientId = this.cfg.getOrThrow('oauth.google.clientId');
        const scope = encodeURIComponent('openid email profile');
        const state = (0, crypto_1.randomBytes)(16).toString('hex');
        const url = `https://accounts.google.com/o/oauth2/v2/auth` +
            `?client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&response_type=code` +
            `&scope=${scope}` +
            `&access_type=online` +
            `&include_granted_scopes=true` +
            `&state=${encodeURIComponent(state)}`;
        res.cookie('oauth_state', state, this.cookieBaseOptions());
        res.cookie('oauth_intent', intent, this.cookieBaseOptions());
        return res.redirect(url);
    }
    async googleCallback(req, res, code, state) {
        const savedState = req.cookies?.['oauth_state'];
        const intent = req.cookies?.['oauth_intent'] || 'login';
        res.clearCookie('oauth_state');
        res.clearCookie('oauth_intent');
        if (!code || !state || !savedState || savedState !== state) {
            throw new common_1.BadRequestException('Invalid OAuth state');
        }
        const origin = this.resolveServerOrigin(req);
        const redirectUri = `${origin}/auth/oauth/google/callback`;
        const { accessToken, refreshToken } = await this.auth.handleGoogleCode(code, redirectUri, intent);
        (0, cookie_util_1.setAuthCookies)(res, this.cfg, { accessToken, refreshToken });
        return res.redirect(303, this.getClientUrl() + '/');
    }
    async githubStart(req, res, intent = 'login') {
        const origin = this.resolveServerOrigin(req);
        const redirectUri = `${origin}/auth/oauth/github/callback`;
        const clientId = this.cfg.getOrThrow('oauth.github.clientId');
        const scope = encodeURIComponent('read:user user:email');
        const state = (0, crypto_1.randomBytes)(16).toString('hex');
        const url = `https://github.com/login/oauth/authorize` +
            `?client_id=${encodeURIComponent(clientId)}` +
            `&redirect_uri=${encodeURIComponent(redirectUri)}` +
            `&scope=${scope}` +
            `&state=${encodeURIComponent(state)}`;
        res.cookie('oauth_state', state, this.cookieBaseOptions());
        res.cookie('oauth_intent', intent, this.cookieBaseOptions());
        return res.redirect(url);
    }
    async githubCallback(req, res, code, state) {
        const savedState = req.cookies?.['oauth_state'];
        const intent = req.cookies?.['oauth_intent'] || 'login';
        res.clearCookie('oauth_state');
        res.clearCookie('oauth_intent');
        if (!code || !state || !savedState || savedState !== state) {
            throw new common_1.BadRequestException('Invalid OAuth state');
        }
        const origin = this.resolveServerOrigin(req);
        const redirectUri = `${origin}/auth/oauth/github/callback`;
        const { accessToken, refreshToken } = await this.auth.handleGithubCode(code, redirectUri, intent);
        (0, cookie_util_1.setAuthCookies)(res, this.cfg, { accessToken, refreshToken });
        return res.redirect(303, this.getClientUrl() + '/');
    }
};
exports.AuthController = AuthController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Register user and set auth cookies' }),
    (0, swagger_1.ApiBody)({ type: register_dto_1.RegisterDto }),
    (0, swagger_1.ApiCreatedResponse)({
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        displayName: { type: 'string', nullable: true },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        emailVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
                verificationEmail: {
                    type: 'object',
                    properties: {
                        attempted: { type: 'boolean' },
                        sent: { type: 'boolean' },
                        id: { type: 'string', nullable: true },
                        error: { type: 'string', nullable: true },
                    }
                }
            },
        },
    }),
    (0, public_decorator_1.Public)(),
    (0, common_1.Post)('register'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __param(2, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [register_dto_1.RegisterDto, Object, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "register", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Login and set auth cookies' }),
    (0, swagger_1.ApiBody)({ type: login_dto_1.LoginDto }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                user: {
                    type: 'object',
                    properties: {
                        _id: { type: 'string' },
                        email: { type: 'string', format: 'email' },
                        displayName: { type: 'string', nullable: true },
                        role: { type: 'string', enum: ['user', 'admin'] },
                        emailVerified: { type: 'boolean' },
                        createdAt: { type: 'string', format: 'date-time' },
                        updatedAt: { type: 'string', format: 'date-time' },
                    },
                },
            },
        },
    }),
    (0, public_decorator_1.Public)(),
    (0, common_1.HttpCode)(200),
    (0, common_1.Post)('login'),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [login_dto_1.LoginDto, Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "login", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current session payload' }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                sub: { type: 'string' },
                email: { type: 'string', format: 'email' },
                role: { type: 'string', enum: ['user', 'admin'] },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, common_1.Get)('me'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "me", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Logout and clear cookies' }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: { success: { type: 'boolean' } },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, common_1.UseGuards)(authentication_guard_1.AuthenticationGuard),
    (0, common_1.Post)('logout'),
    __param(0, (0, common_1.Res)({ passthrough: true })),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "logout", null);
__decorate([
    (0, common_1.Get)('ws-ticket'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "getWsTicket", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('verify-email'),
    __param(0, (0, common_1.Res)()),
    __param(1, (0, common_1.Query)('token')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "verifyEmail", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('oauth/google/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('intent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleStart", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('oauth/google/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('code')),
    __param(3, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "googleCallback", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('oauth/github/start'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('intent')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubStart", null);
__decorate([
    (0, public_decorator_1.Public)(),
    (0, common_1.Get)('oauth/github/callback'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Res)()),
    __param(2, (0, common_1.Query)('code')),
    __param(3, (0, common_1.Query)('state')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object, String, String]),
    __metadata("design:returntype", Promise)
], AuthController.prototype, "githubCallback", null);
exports.AuthController = AuthController = __decorate([
    (0, swagger_1.ApiTags)('auth'),
    (0, common_1.Controller)('auth'),
    __metadata("design:paramtypes", [auth_service_1.AuthService,
        config_1.ConfigService])
], AuthController);
//# sourceMappingURL=auth.controller.js.map