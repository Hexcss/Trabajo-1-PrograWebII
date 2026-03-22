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
exports.ProductsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const product_entity_1 = require("./entities/product.entity");
const review_entity_1 = require("../reviews/entities/review.entity");
const discount_entity_1 = require("../discounts/entities/discount.entity");
let ProductsService = class ProductsService {
    productModel;
    reviewModel;
    discountModel;
    constructor(productModel, reviewModel, discountModel) {
        this.productModel = productModel;
        this.reviewModel = reviewModel;
        this.discountModel = discountModel;
    }
    async list(query) {
        const { q, category, categoryId, limit = 20, page = 1, sort = 'new' } = query;
        const filter = {};
        if (q)
            filter.name = { $regex: q, $options: 'i' };
        if (category)
            filter.category = category;
        if (categoryId)
            filter.categoryId = new mongoose_2.Types.ObjectId(categoryId);
        const sortOption = {};
        switch (sort) {
            case 'priceAsc':
                sortOption.price = 1;
                break;
            case 'priceDesc':
                sortOption.price = -1;
                break;
            case 'rating':
                sortOption.avgRating = -1;
                sortOption.reviewCount = -1;
                break;
            case 'new':
            default:
                sortOption.createdAt = -1;
                break;
        }
        const now = new Date();
        const pipeline = [
            { $match: filter },
            {
                $lookup: {
                    from: 'reviews',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'reviews',
                },
            },
            {
                $lookup: {
                    from: 'discounts',
                    localField: '_id',
                    foreignField: 'productId',
                    as: 'discounts',
                },
            },
            {
                $addFields: {
                    avgRating: { $ifNull: [{ $avg: '$reviews.score' }, null] },
                    reviewCount: { $size: '$reviews' },
                    activeDiscounts: {
                        $filter: {
                            input: '$discounts',
                            as: 'd',
                            cond: {
                                $and: [{ $lte: ['$$d.startDate', now] }, { $gte: ['$$d.endDate', now] }],
                            },
                        },
                    },
                },
            },
            {
                $addFields: {
                    bestDiscount: { $max: '$activeDiscounts.discountPercent' },
                },
            },
            {
                $addFields: {
                    activeDiscount: {
                        $first: {
                            $filter: {
                                input: '$activeDiscounts',
                                as: 'd',
                                cond: { $eq: ['$$d.discountPercent', '$bestDiscount'] },
                            },
                        },
                    },
                },
            },
            {
                $project: {
                    reviews: 0,
                    discounts: 0,
                    activeDiscounts: 0,
                    bestDiscount: 0,
                },
            },
            { $sort: sortOption },
        ];
        const paginatedPipeline = [
            ...pipeline,
            {
                $facet: {
                    metadata: [{ $count: 'total' }],
                    items: [{ $skip: (page - 1) * limit }, { $limit: limit }],
                },
            },
            {
                $project: {
                    items: 1,
                    total: { $arrayElemAt: ['$metadata.total', 0] },
                },
            },
        ];
        const result = await this.productModel.aggregate(paginatedPipeline).exec();
        const { items = [], total = 0 } = result[0] || {};
        return {
            total,
            page,
            limit,
            items: items.map((item) => ({
                ...item,
                avgRating: item.avgRating ? Number(item.avgRating.toFixed(2)) : null,
            })),
        };
    }
    async getById(id) {
        const item = await this.productModel.findById(id).lean().exec();
        if (!item)
            throw new common_1.NotFoundException('Product not found');
        const [ratingAgg, discountAgg] = await Promise.all([
            this.reviewModel
                .aggregate([
                { $match: { productId: new mongoose_2.Types.ObjectId(id) } },
                { $group: { _id: '$productId', avg: { $avg: '$score' }, count: { $sum: 1 } } },
            ])
                .exec(),
            this.discountModel
                .aggregate([
                {
                    $match: {
                        productId: new mongoose_2.Types.ObjectId(id),
                        startDate: { $lte: new Date() },
                        endDate: { $gte: new Date() },
                    },
                },
                { $sort: { discountPercent: -1 } },
                { $limit: 1 },
            ])
                .exec(),
        ]);
        const rating = ratingAgg[0] ? Number(ratingAgg[0].avg.toFixed(2)) : null;
        const reviewCount = ratingAgg[0]?.count ?? 0;
        const discount = discountAgg[0]
            ? {
                discountPercent: discountAgg[0].discountPercent,
                startDate: discountAgg[0].startDate,
                endDate: discountAgg[0].endDate,
            }
            : null;
        return { ...item, avgRating: rating, reviewCount, activeDiscount: discount };
    }
    async topRated(limit = 10) {
        const groups = await this.reviewModel
            .aggregate([
            { $group: { _id: '$productId', avg: { $avg: '$score' }, count: { $sum: 1 } } },
            { $sort: { avg: -1, count: -1 } },
            { $limit: limit },
        ])
            .exec();
        if (groups.length === 0)
            return [];
        const ids = groups.map((g) => g._id);
        const productDocs = await this.productModel
            .find({ _id: { $in: ids } })
            .lean()
            .exec();
        const productMap = new Map(productDocs.map((p) => [String(p._id), p]));
        const now = new Date();
        const discounts = await this.discountModel
            .aggregate([
            {
                $match: {
                    productId: { $in: ids },
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                },
            },
            { $sort: { discountPercent: -1 } },
            {
                $group: {
                    _id: '$productId',
                    discountPercent: { $first: '$discountPercent' },
                    startDate: { $first: '$startDate' },
                    endDate: { $first: '$endDate' },
                },
            },
        ])
            .exec();
        const discountMap = new Map(discounts.map((d) => [String(d._id), { discountPercent: d.discountPercent, startDate: d.startDate, endDate: d.endDate }]));
        const ordered = groups
            .map((g) => {
            const prod = productMap.get(String(g._id));
            if (!prod)
                return null;
            const d = discountMap.get(String(g._id));
            return {
                ...prod,
                avgRating: Number(g.avg.toFixed(2)),
                reviewCount: g.count,
                activeDiscount: d ? { discountPercent: d.discountPercent, startDate: d.startDate, endDate: d.endDate } : null,
            };
        })
            .filter(Boolean);
        return ordered;
    }
    async create(dto, userId) {
        const payload = { ...dto };
        if (dto.categoryId)
            payload.categoryId = new mongoose_2.Types.ObjectId(dto.categoryId);
        const created = new this.productModel({
            ...payload,
            createdBy: userId ? new mongoose_2.Types.ObjectId(userId) : undefined,
        });
        return created.save();
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.categoryId)
            payload.categoryId = new mongoose_2.Types.ObjectId(dto.categoryId);
        const updated = await this.productModel.findByIdAndUpdate(id, { $set: payload }, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Product not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.productModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Product not found');
        return { success: true };
    }
};
exports.ProductsService = ProductsService;
exports.ProductsService = ProductsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(product_entity_1.Product.name)),
    __param(1, (0, mongoose_1.InjectModel)(review_entity_1.Review.name)),
    __param(2, (0, mongoose_1.InjectModel)(discount_entity_1.Discount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model])
], ProductsService);
//# sourceMappingURL=products.service.js.map