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
var AuthorizationGuard_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthorizationGuard = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
;
const public_decorator_1 = require("../decorators/public.decorator");
const role_decorator_1 = require("../decorators/role.decorator");
const role_enum_1 = require("../enums/role.enum");
let AuthorizationGuard = AuthorizationGuard_1 = class AuthorizationGuard {
    reflector;
    logger = new common_1.Logger(AuthorizationGuard_1.name);
    constructor(reflector) {
        this.reflector = reflector;
    }
    canActivate(context) {
        const isPublic = this.reflector.getAllAndOverride(public_decorator_1.IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (isPublic)
            return true;
        const requiredLevel = this.reflector.getAllAndOverride(role_decorator_1.MIN_ROLE_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);
        if (!requiredLevel)
            return true;
        const req = context.switchToHttp().getRequest();
        const user = req.user;
        const meta = `method=${req.method} path=${req.originalUrl ?? req.url}`;
        if (!user) {
            this.logger.warn(`No authenticated user on request (${meta})`);
            throw new common_1.UnauthorizedException('Missing authenticated user');
        }
        if (!user.role) {
            this.logger.warn(`Authenticated user has no role (${meta}) sub=${user.sub ?? 'n/a'}`);
            throw new common_1.ForbiddenException('No role found on user');
        }
        const currentLevel = role_enum_1.RoleLevelMap[user.role];
        if (currentLevel === undefined) {
            this.logger.warn(`Unknown role "${user.role}" (${meta}) sub=${user.sub ?? 'n/a'}`);
            throw new common_1.ForbiddenException('Invalid user role');
        }
        if (currentLevel < requiredLevel) {
            this.logger.warn(`Access denied: role=${user.role}(${currentLevel}) < required(${requiredLevel}) (${meta}) sub=${user.sub ?? 'n/a'}`);
            throw new common_1.ForbiddenException('Insufficient role');
        }
        this.logger.debug(`Access granted: role=${user.role}(${currentLevel}) >= required(${requiredLevel}) (${meta}) sub=${user.sub ?? 'n/a'}`);
        return true;
    }
};
exports.AuthorizationGuard = AuthorizationGuard;
exports.AuthorizationGuard = AuthorizationGuard = AuthorizationGuard_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [core_1.Reflector])
], AuthorizationGuard);
//# sourceMappingURL=authorization.guard.js.map