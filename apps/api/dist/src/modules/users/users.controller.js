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
exports.UsersController = void 0;
const common_1 = require("@nestjs/common");
const users_service_1 = require("./users.service");
const update_user_dto_1 = require("./dto/update-user.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
const create_user_dto_1 = require("./dto/create-user.dto");
const role_decorator_1 = require("../../common/decorators/role.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const class_validator_1 = require("class-validator");
const swagger_1 = require("@nestjs/swagger");
class AdminCreateUserDto extends create_user_dto_1.CreateUserDto {
    role;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    __metadata("design:type", String)
], AdminCreateUserDto.prototype, "role", void 0);
class AdminUpdateUserDto extends update_user_dto_1.UpdateUserDto {
    role;
}
__decorate([
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(role_enum_1.Role),
    __metadata("design:type", String)
], AdminUpdateUserDto.prototype, "role", void 0);
let UsersController = class UsersController {
    users;
    constructor(users) {
        this.users = users;
    }
    async me(user) {
        const found = await this.users.findById(user.sub);
        if (!found)
            return null;
        return {
            _id: found._id,
            email: found.email,
            displayName: found.displayName,
            role: found.role,
            createdAt: found.createdAt,
            avatarUrl: found.avatarUrl
        };
    }
    async updateMe(user, dto) {
        return this.users.updateProfile(user.sub, dto);
    }
    async list(q, role, limit, page) {
        return this.users.list({ q, role, limit, page });
    }
    async getById(id) {
        return this.users.findById(id);
    }
    async adminCreate(dto) {
        return this.users.createUser(dto, dto.role ?? role_enum_1.Role.USER);
    }
    async adminUpdate(id, dto) {
        return this.users.adminUpdateUser(id, dto);
    }
    async adminDelete(id) {
        return this.users.remove(id);
    }
};
exports.UsersController = UsersController;
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get current user profile' }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                email: { type: 'string', format: 'email' },
                displayName: { type: 'string', nullable: true },
                role: { type: 'string', enum: ['user', 'admin'] },
                createdAt: { type: 'string', format: 'date-time' },
            },
            nullable: true,
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, common_1.Get)('me'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "me", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Update current user profile' }),
    (0, swagger_1.ApiBody)({ type: update_user_dto_1.UpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({
        schema: {
            type: 'object',
            properties: {
                _id: { type: 'string' },
                email: { type: 'string', format: 'email' },
                displayName: { type: 'string', nullable: true },
                role: { type: 'string', enum: ['user', 'admin'] },
                createdAt: { type: 'string', format: 'date-time' },
                avatarUrl: { type: 'string', format: 'uri', nullable: true },
            },
        },
    }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, common_1.Patch)('me'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, update_user_dto_1.UpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "updateMe", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'List users (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'q', required: false, type: String }),
    (0, swagger_1.ApiQuery)({ name: 'role', required: false, enum: role_enum_1.Role }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiOkResponse)({ description: 'User list' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('q')),
    __param(1, (0, common_1.Query)('role')),
    __param(2, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(3, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user by id (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'User found' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "getById", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Create user (admin only)' }),
    (0, swagger_1.ApiBody)({ type: AdminCreateUserDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'User created' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [AdminCreateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adminCreate", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: AdminUpdateUserDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'User updated' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, AdminUpdateUserDto]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adminUpdate", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete user (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'User deleted' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'User not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], UsersController.prototype, "adminDelete", null);
exports.UsersController = UsersController = __decorate([
    (0, swagger_1.ApiTags)('users'),
    (0, common_1.Controller)('users'),
    __metadata("design:paramtypes", [users_service_1.UsersService])
], UsersController);
//# sourceMappingURL=users.controller.js.map