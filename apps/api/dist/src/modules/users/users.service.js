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
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const user_entity_1 = require("./entities/user.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const argon2_util_1 = require("../../common/crypto/argon2.util");
let UsersService = class UsersService {
    userModel;
    constructor(userModel) {
        this.userModel = userModel;
    }
    async findByEmail(email) {
        return this.userModel.findOne({ email }).exec();
    }
    async findById(id) {
        return this.userModel.findById(id).exec();
    }
    async createUser(dto, role = role_enum_1.Role.USER) {
        const exists = await this.findByEmail(dto.email);
        if (exists)
            throw new common_1.ConflictException('Email already registered');
        const passwordHash = await (0, argon2_util_1.hashString)(dto.password);
        const created = new this.userModel({
            email: dto.email,
            passwordHash,
            displayName: dto.displayName,
            role,
        });
        return created.save();
    }
    async updateProfile(userId, dto) {
        const updated = await this.userModel
            .findByIdAndUpdate(userId, { $set: dto }, { new: true })
            .select('_id email displayName role createdAt avatarUrl')
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return updated;
    }
    async adminUpdateUser(id, dto) {
        const update = { ...dto };
        if (dto.role)
            update.role = dto.role;
        const updated = await this.userModel
            .findByIdAndUpdate(id, { $set: update }, { new: true })
            .select('_id email displayName role createdAt avatarUrl')
            .exec();
        if (!updated)
            throw new common_1.NotFoundException('User not found');
        return updated;
    }
    async remove(id) {
        const res = await this.userModel.deleteOne({ _id: id }).exec();
        if (res.deletedCount === 0)
            throw new common_1.NotFoundException('User not found');
        return { success: true };
    }
    async list(params) {
        const limit = Math.max(1, Math.min(200, Number(params.limit ?? 20)));
        const page = Math.max(1, Number(params.page ?? 1));
        const filter = {};
        if (params.q) {
            filter.$or = [
                { email: { $regex: params.q, $options: 'i' } },
                { displayName: { $regex: params.q, $options: 'i' } },
            ];
        }
        if (params.role)
            filter.role = params.role;
        const [items, total] = await Promise.all([
            this.userModel
                .find(filter)
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .select('_id email displayName role createdAt avatarUrl')
                .exec(),
            this.userModel.countDocuments(filter).exec(),
        ]);
        return { items, total, page, limit };
    }
    async setRefreshToken(userId, refreshToken) {
        if (!refreshToken) {
            await this.userModel.updateOne({ _id: userId }, { $unset: { refreshTokenHash: 1 } }).exec();
            return;
        }
        const hash = await (0, argon2_util_1.hashString)(refreshToken);
        await this.userModel.updateOne({ _id: userId }, { $set: { refreshTokenHash: hash } }).exec();
    }
    async validateRefreshToken(userId, refreshToken) {
        const user = await this.findById(userId);
        if (!user?.refreshTokenHash)
            return false;
        return (0, argon2_util_1.verifyHash)(user.refreshTokenHash, refreshToken);
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [Function])
], UsersService);
//# sourceMappingURL=users.service.js.map