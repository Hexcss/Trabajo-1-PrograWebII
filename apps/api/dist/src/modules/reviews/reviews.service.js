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
exports.ReviewsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const review_entity_1 = require("./entities/review.entity");
const role_enum_1 = require("../../common/enums/role.enum");
const toObjectId = (v) => (v && mongoose_2.Types.ObjectId.isValid(v) ? new mongoose_2.Types.ObjectId(v) : null);
let ReviewsService = class ReviewsService {
    reviewModel;
    constructor(reviewModel) {
        this.reviewModel = reviewModel;
    }
    async listByProduct(productId, page = 1, limit = 10, userId) {
        const pid = toObjectId(productId);
        if (!pid)
            return { items: [], total: 0, page, limit };
        const match = { productId: pid };
        const uid = toObjectId(userId);
        if (uid)
            match.userId = uid;
        const pipeline = [
            { $match: match },
            { $sort: { createdAt: -1 } },
            {
                $facet: {
                    items: [
                        { $skip: Math.max(0, (page - 1) * limit) },
                        { $limit: Math.max(1, Math.min(limit, 100)) },
                        {
                            $lookup: {
                                from: 'users',
                                localField: 'userId',
                                foreignField: '_id',
                                as: 'user',
                            },
                        },
                        { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
                        {
                            $project: {
                                _id: 1,
                                productId: 1,
                                userId: 1,
                                score: 1,
                                comment: 1,
                                createdAt: 1,
                                updatedAt: 1,
                                user: {
                                    _id: '$user._id',
                                    displayName: '$user.displayName',
                                    email: '$user.email',
                                    avatarUrl: '$user.avatarUrl',
                                },
                            },
                        },
                    ],
                    total: [{ $count: 'count' }],
                },
            },
            {
                $project: {
                    items: 1,
                    total: { $ifNull: [{ $arrayElemAt: ['$total.count', 0] }, 0] },
                },
            },
        ];
        const [res] = await this.reviewModel.aggregate(pipeline).exec();
        return {
            items: res?.items ?? [],
            total: res?.total ?? 0,
            page,
            limit,
        };
    }
    async getOneEnriched(id) {
        const pipeline = [
            { $match: { _id: typeof id === 'string' ? new mongoose_2.Types.ObjectId(id) : id } },
            {
                $lookup: {
                    from: 'users',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user',
                },
            },
            { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
            {
                $project: {
                    _id: 1,
                    productId: 1,
                    userId: 1,
                    score: 1,
                    comment: 1,
                    createdAt: 1,
                    updatedAt: 1,
                    user: {
                        _id: '$user._id',
                        displayName: '$user.displayName',
                        email: '$user.email',
                        avatarUrl: '$user.avatarUrl',
                    },
                },
            },
        ];
        const [doc] = await this.reviewModel.aggregate(pipeline).exec();
        return doc ?? null;
    }
    async create(dto, userId) {
        const existing = await this.reviewModel.findOne({
            productId: new mongoose_2.Types.ObjectId(dto.productId),
            userId: new mongoose_2.Types.ObjectId(userId),
        });
        if (existing)
            throw new common_1.ConflictException('You already reviewed this product');
        try {
            const created = await this.reviewModel.create({
                productId: new mongoose_2.Types.ObjectId(dto.productId),
                userId: new mongoose_2.Types.ObjectId(userId),
                score: dto.score,
                comment: dto.comment,
            });
            const enriched = await this.getOneEnriched(created._id);
            return enriched ?? created;
        }
        catch (e) {
            if (e?.code === 11000)
                throw new common_1.ConflictException('You already reviewed this product');
            throw e;
        }
    }
    async update(id, dto, actorId, actorRole) {
        const doc = await this.reviewModel.findById(id).lean();
        if (!doc)
            throw new common_1.NotFoundException('Review not found');
        const isOwner = doc.userId?.toString() === actorId;
        const isAdmin = actorRole === role_enum_1.RoleLevel.ADMIN;
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException('Cannot edit this review');
        const updated = await this.reviewModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
        const enriched = await this.getOneEnriched(updated._id);
        return enriched ?? updated;
    }
    async remove(id, actorId, actorRole) {
        const doc = await this.reviewModel.findById(id).lean();
        if (!doc)
            throw new common_1.NotFoundException('Review not found');
        const isOwner = doc.userId?.toString() === actorId;
        const isAdmin = actorRole === role_enum_1.RoleLevel.ADMIN;
        if (!isOwner && !isAdmin)
            throw new common_1.ForbiddenException('Cannot delete this review');
        await this.reviewModel.findByIdAndDelete(id).exec();
        return { success: true };
    }
};
exports.ReviewsService = ReviewsService;
exports.ReviewsService = ReviewsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(review_entity_1.Review.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], ReviewsService);
//# sourceMappingURL=reviews.service.js.map