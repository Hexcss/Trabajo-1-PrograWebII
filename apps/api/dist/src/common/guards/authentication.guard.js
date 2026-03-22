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
var AuthenticationGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthenticationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const public_decorator_1 = require("../decorators/public.decorator");
const auth_service_1 = require("../../modules/auth/auth.service");
const config_1 = require("@nestjs/config");
const cookie_util_1 = require("../utils/cookie.util");
let AuthenticationGuard = AuthenticationGuard_1 = class AuthenticationGuard {
    reflector;
    auth;
    cfg;
    logger = new common_1.Logger(AuthenticationGuard_1.name);
    atName;
    rtName;
    debugEnabled;
    constructor(reflector, auth, cfg) {
        this.reflector = reflector;
        this.auth = auth;
        this.cfg = cfg;
        this.atName = 'accessToken';
        this.rtName = 'refreshToken';
        const env = this.cfg.get('NODE_ENV');
        const flag = this.cfg.get('LOG_AUTH_DEBUG');
        this.debugEnabled = env !== 'production' || flag === 'true';
    }
    async canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const http = context.switchToHttp();
        const req = http.getRequest();
        const res = http.getResponse();
        const cookies = req.cookies ?? {};
        const at = cookies[this.atName];
        const rt = cookies[this.rtName];
        const meta = this.buildMeta(req);
        if (at) {
            try {
                const payload = await this.auth.verifyToken(at, false);
                req.user = payload;
                if (this.debugEnabled)
                    this.logger.debug(`auth ok via access token sub=${payload?.sub ?? 'n/a'} ${meta}`);
                return true;
            }
            catch (e) {
                this.logger.warn(`access token rejected reason=${e?.message ?? 'unknown'} ${meta}`);
            }
        }
        else {
            if (this.debugEnabled)
                this.logger.debug(`no access token cookie ${meta}`);
        }
        if (rt) {
            try {
                if (this.debugEnabled)
                    this.logger.debug(`attempting refresh ${meta}`);
                const { accessToken, refreshToken } = await this.auth.refreshWithToken(rt);
                (0, cookie_util_1.setAuthCookies)(res, this.cfg, { accessToken, refreshToken });
                const payload = await this.auth.verifyToken(accessToken, false);
                req.user = payload;
                if (this.debugEnabled)
                    this.logger.debug(`auth ok via refresh sub=${payload?.sub ?? 'n/a'} ${meta}`);
                return true;
            }
            catch (e) {
                this.logger.error(`refresh failed reason=${e?.message ?? 'unknown'} ${meta}`);
            }
        }
        else {
            if (this.debugEnabled)
                this.logger.debug(`no refresh token cookie ${meta}`);
        }
        this.logger.warn(`unauthorized ${meta}`);
        throw new common_1.UnauthorizedException({ message: 'Unauthorized' });
    }
    buildMeta(req) {
        const rid = req.headers['x-request-id'] || req.id || '-';
        const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            (req.socket && req.socket.remoteAddress) ||
            req.ip ||
            '-';
        const m = req.method || '-';
        const p = req.originalUrl || req.url || '-';
        return `rid=${rid} m=${m} p=${p} ip=${ip}`;
    }
};
exports.AuthenticationGuard = AuthenticationGuard;
exports.AuthenticationGuard = AuthenticationGuard = AuthenticationGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector,
        auth_service_1.AuthService,
        config_1.ConfigService])
], AuthenticationGuard);
//# sourceMappingURL=authentication.guard.js.map