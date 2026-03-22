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
Object.defineProperty(exports, "__esModule", { value: true });
exports.UserSchema = exports.User = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const swagger_1 = require("@nestjs/swagger");
const role_enum_1 = require("../../../common/enums/role.enum");
let User = class User {
    _id;
    email;
    passwordHash;
    role;
    displayName;
    avatarUrl;
    refreshTokenHash;
    emailVerified;
};
exports.User = User;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Unique identifier', type: String }),
    __metadata("design:type", Object)
], User.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Unique email address of the user',
        example: 'user@example.com',
    }),
    (0, mongoose_1.Prop)({ unique: true, required: true, index: true }),
    __metadata("design:type", String)
], User.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'Hashed password (stored securely)',
        example: '$argon2id$v=19$m=19456,t=2,p=1$...',
    }),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", String)
], User.prototype, "passwordHash", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({
        description: 'User role within the system',
        enum: role_enum_1.Role,
        example: role_enum_1.Role.USER,
    }),
    (0, mongoose_1.Prop)({ enum: [role_enum_1.Role.USER, role_enum_1.Role.ADMIN], default: role_enum_1.Role.USER, index: true }),
    __metadata("design:type", String)
], User.prototype, "role", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Display name of the user',
        example: 'Jane Doe',
    }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "displayName", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'URL of the user’s avatar image',
        example: 'https://cdn.example.com/avatars/user123.jpg',
    }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "avatarUrl", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Hashed refresh token (for persistent sessions)',
        example: '$argon2id$v=19$m=19456,t=2,p=1$...',
    }),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], User.prototype, "refreshTokenHash", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({
        description: 'Whether the email is verified',
        example: false,
    }),
    (0, mongoose_1.Prop)({ type: Boolean, default: false }),
    __metadata("design:type", Boolean)
], User.prototype, "emailVerified", void 0);
exports.User = User = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'users' })
], User);
exports.UserSchema = mongoose_1.SchemaFactory.createForClass(User);
exports.UserSchema.index({ createdAt: 1 });
//# sourceMappingURL=user.entity.js.map