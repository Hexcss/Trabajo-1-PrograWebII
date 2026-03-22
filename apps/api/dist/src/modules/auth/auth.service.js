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
var AuthService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("../users/users.service");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const argon2_util_1 = require("../../common/crypto/argon2.util");
const node_crypto_1 = require("node:crypto");
const email_service_1 = require("../../shared/email/email.service");
let AuthService = AuthService_1 = class AuthService {
    users;
    jwt;
    cfg;
    email;
    logger = new common_1.Logger(AuthService_1.name);
    constructor(users, jwt, cfg, email) {
        this.users = users;
        this.jwt = jwt;
        this.cfg = cfg;
        this.email = email;
    }
    toSeconds(v, fallbackSeconds) {
        const s = (v ?? '').trim();
        if (!s)
            return fallbackSeconds;
        const asNum = Number(s);
        if (Number.isFinite(asNum))
            return asNum;
        const m = /^(\d+)\s*([smhd])$/i.exec(s);
        if (!m)
            return fallbackSeconds;
        const n = parseInt(m[1], 10);
        const mult = m[2].toLowerCase() === 's' ? 1 : m[2].toLowerCase() === 'm' ? 60 : m[2].toLowerCase() === 'h' ? 3600 : 86400;
        return n * mult;
    }
    async signTokens(user) {
        const payload = { sub: String(user._id), email: user.email, role: user.role, emailVerified: !!user.emailVerified };
        const accessSeconds = this.toSeconds(this.cfg.get('jwt.accessExpires'), 15 * 60);
        const refreshSeconds = this.toSeconds(this.cfg.get('jwt.refreshExpires'), 7 * 86400);
        const accessToken = await this.jwt.signAsync(payload, {
            secret: this.cfg.getOrThrow('jwt.accessSecret'),
            expiresIn: accessSeconds,
        });
        const refreshToken = await this.jwt.signAsync(payload, {
            secret: this.cfg.getOrThrow('jwt.refreshSecret'),
            expiresIn: refreshSeconds,
        });
        return { accessToken, refreshToken };
    }
    publicUser(u) {
        return {
            _id: String(u._id),
            email: u.email,
            displayName: u.displayName,
            role: u.role,
            emailVerified: !!u.emailVerified,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        };
    }
    async verifyToken(token, isRefresh = false) {
        if (!token) {
            this.logger.warn('No token provided for verification');
            throw new common_1.UnauthorizedException('Token is missing');
        }
        const secret = isRefresh
            ? this.cfg.getOrThrow('jwt.refreshSecret')
            : this.cfg.getOrThrow('jwt.accessSecret');
        try {
            const decoded = await this.jwt.verifyAsync(token, { secret });
            this.logger.debug(`Token verified (${isRefresh ? 'refresh' : 'access'}): sub=${decoded?.sub}, role=${decoded?.role}`);
            return decoded;
        }
        catch (err) {
            this.logger.error(`Token verification failed: ${err?.name ?? 'Error'} - ${err?.message ?? ''}`);
            if (err?.name === 'TokenExpiredError')
                throw new common_1.UnauthorizedException('Token expired');
            if (err?.name === 'JsonWebTokenError')
                throw new common_1.UnauthorizedException('Invalid token');
            throw new common_1.BadRequestException('Could not verify token');
        }
    }
    async refreshWithToken(refreshToken) {
        const decoded = await this.verifyToken(refreshToken, true);
        const userPayload = { _id: decoded.sub, email: decoded.email, role: decoded.role, emailVerified: !!decoded.emailVerified };
        const tokens = await this.signTokens(userPayload);
        return { ...tokens, user: this.publicUser(userPayload) };
    }
    async register(email, password, displayName) {
        const normEmail = email.trim().toLowerCase();
        const user = await this.users.createUser({ email: normEmail, password, displayName });
        const tokens = await this.signTokens(user);
        return { user: this.publicUser(user), ...tokens };
    }
    async login(email, password) {
        const normEmail = email.trim().toLowerCase();
        const user = await this.users.findByEmail(normEmail);
        if (!user)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const ok = await (0, argon2_util_1.verifyHash)(user.passwordHash, password);
        if (!ok)
            throw new common_1.UnauthorizedException('Invalid credentials');
        const tokens = await this.signTokens(user);
        return { user: this.publicUser(user), ...tokens };
    }
    async logout() {
        return { success: true };
    }
    async createWsTicket(user) {
        const payload = {
            sub: user.sub,
            email: user.email,
            role: user.role,
            aud: 'ws',
            typ: 'ws',
            jti: (0, node_crypto_1.randomUUID)(),
        };
        return this.jwt.signAsync(payload, {
            secret: this.cfg.getOrThrow('jwt.accessSecret'),
            expiresIn: 60,
        });
    }
    generateStrongPassword(len = 32) {
        return (0, node_crypto_1.randomBytes)(len).toString('base64url');
    }
    getEmailVerifySecret() {
        return this.cfg.get('jwt.emailVerifySecret') || this.cfg.getOrThrow('jwt.accessSecret');
    }
    async maybeSendEmailVerification(user, serverOrigin) {
        const apiKey = this.cfg.get('RESEND_API_KEY') ?? '';
        if (!apiKey) {
            return { attempted: false, sent: false, id: null, error: null };
        }
        const token = await this.jwt.signAsync({ sub: String(user._id), email: user.email, typ: 'email_verify' }, { secret: this.getEmailVerifySecret(), expiresIn: this.toSeconds(this.cfg.get('email.verifyExpires') ?? '2d', 172800) });
        const verifyUrl = `${serverOrigin.replace(/\/+$/, '')}/auth/verify-email?token=${encodeURIComponent(token)}`;
        return this.email.sendEmailVerification({
            to: user.email,
            link: verifyUrl,
            displayName: user.displayName || user.email,
        });
    }
    async verifyEmailToken(token) {
        const decoded = await this.jwt.verifyAsync(token, { secret: this.getEmailVerifySecret() });
        if (!decoded?.sub || decoded?.typ !== 'email_verify')
            throw new common_1.UnauthorizedException('Invalid token');
        const user = await this.users.findByEmail(decoded.email);
        if (!user || String(user._id) !== String(decoded.sub))
            throw new common_1.UnauthorizedException('Invalid token');
        if (!user.emailVerified) {
            if (typeof this.users.updateById === 'function') {
                await this.users.updateById(String(user._id), { emailVerified: true });
            }
            else if (typeof this.users.markEmailVerified === 'function') {
                await this.users.markEmailVerified(String(user._id));
            }
        }
        return true;
    }
    async oauthLoginOrSignup(provider, profile, intent) {
        const email = (profile.email || '').trim().toLowerCase();
        if (!email) {
            throw new common_1.UnauthorizedException(`No email returned by ${provider}. Please make your email visible/verified in ${provider}.`);
        }
        const existing = await this.users.findByEmail(email);
        if (existing) {
            const tokens = await this.signTokens(existing);
            return { user: this.publicUser(existing), ...tokens };
        }
        if (intent === 'login') {
            throw new common_1.NotFoundException('Account not found. Please sign up first.');
        }
        const password = this.generateStrongPassword(36);
        const created = await this.users.createUser({
            email,
            password,
            displayName: profile.displayName || email.split('@')[0],
        });
        const tokens = await this.signTokens(created);
        return { user: this.publicUser(created), ...tokens };
    }
    async handleGoogleCode(code, redirectUri, intent) {
        const clientId = this.cfg.getOrThrow('oauth.google.clientId');
        const clientSecret = this.cfg.getOrThrow('oauth.google.clientSecret');
        const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                code,
                client_id: clientId,
                client_secret: clientSecret,
                redirect_uri: redirectUri,
                grant_type: 'authorization_code',
            }),
        });
        if (!tokenRes.ok) {
            const errTxt = await tokenRes.text().catch(() => '');
            throw new common_1.UnauthorizedException(`Google token exchange failed: ${errTxt}`);
        }
        const tokenJson = await tokenRes.json();
        const accessToken = tokenJson.access_token;
        if (!accessToken)
            throw new common_1.UnauthorizedException('No access token from Google');
        const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!infoRes.ok) {
            const errTxt = await infoRes.text().catch(() => '');
            throw new common_1.UnauthorizedException(`Google userinfo failed: ${errTxt}`);
        }
        const info = await infoRes.json();
        const profile = {
            providerId: String(info.sub),
            email: info.email,
            displayName: info.name,
        };
        return this.oauthLoginOrSignup('google', profile, intent);
    }
    async handleGithubCode(code, redirectUri, intent) {
        const clientId = this.cfg.getOrThrow('oauth.github.clientId');
        const clientSecret = this.cfg.getOrThrow('oauth.github.clientSecret');
        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
            method: 'POST',
            headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
            body: JSON.stringify({
                client_id: clientId,
                client_secret: clientSecret,
                code,
                redirect_uri: redirectUri,
            }),
        });
        if (!tokenRes.ok) {
            const errTxt = await tokenRes.text().catch(() => '');
            throw new common_1.UnauthorizedException(`GitHub token exchange failed: ${errTxt}`);
        }
        const tokenJson = await tokenRes.json();
        const accessToken = tokenJson.access_token;
        if (!accessToken)
            throw new common_1.UnauthorizedException('No access token from GitHub');
        const userRes = await fetch('https://api.github.com/user', {
            headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
        });
        if (!userRes.ok) {
            const errTxt = await userRes.text().catch(() => '');
            throw new common_1.UnauthorizedException(`GitHub user API failed: ${errTxt}`);
        }
        const user = await userRes.json();
        let email;
        try {
            const emailsRes = await fetch('https://api.github.com/user/emails', {
                headers: { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json' },
            });
            if (emailsRes.ok) {
                const emails = await emailsRes.json();
                const primary = emails.find((e) => e.primary && e.verified) || emails.find((e) => e.verified) || emails[0];
                email = primary?.email;
            }
        }
        catch { }
        const profile = {
            providerId: String(user.id),
            email: email || user.email || undefined,
            displayName: user.name || user.login || undefined,
        };
        return this.oauthLoginOrSignup('github', profile, intent);
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = AuthService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [users_service_1.UsersService,
        jwt_1.JwtService,
        config_1.ConfigService,
        email_service_1.EmailService])
], AuthService);
//# sourceMappingURL=auth.service.js.map