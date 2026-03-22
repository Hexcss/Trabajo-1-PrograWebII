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
exports.DiscountsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const discount_entity_1 = require("./entities/discount.entity");
let DiscountsService = class DiscountsService {
    discountModel;
    constructor(discountModel) {
        this.discountModel = discountModel;
    }
    async list(productId) {
        const filter = {};
        if (productId)
            filter.productId = new mongoose_2.Types.ObjectId(productId);
        return this.discountModel.find(filter).sort({ startDate: -1 }).lean().exec();
    }
    async getById(id) {
        const item = await this.discountModel.findById(id).lean().exec();
        if (!item)
            throw new common_1.NotFoundException('Discount not found');
        return item;
    }
    async create(dto) {
        const created = new this.discountModel({
            productId: new mongoose_2.Types.ObjectId(dto.productId),
            discountPercent: dto.discountPercent,
            startDate: new Date(dto.startDate),
            endDate: new Date(dto.endDate),
        });
        return created.save();
    }
    async update(id, dto) {
        const payload = { ...dto };
        if (dto.productId)
            payload.productId = new mongoose_2.Types.ObjectId(dto.productId);
        if (dto.startDate)
            payload.startDate = new Date(dto.startDate);
        if (dto.endDate)
            payload.endDate = new Date(dto.endDate);
        const updated = await this.discountModel.findByIdAndUpdate(id, { $set: payload }, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Discount not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.discountModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Discount not found');
        return { success: true };
    }
    async findActiveForProducts(productIds, now) {
        const rows = await this.discountModel
            .aggregate([
            {
                $match: {
                    productId: { $in: productIds },
                    startDate: { $lte: now },
                    endDate: { $gte: now },
                },
            },
            {
                $sort: { discountPercent: -1 },
            },
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
        return new Map(rows.map(r => [String(r._id), { discountPercent: r.discountPercent, startDate: r.startDate, endDate: r.endDate }]));
    }
};
exports.DiscountsService = DiscountsService;
exports.DiscountsService = DiscountsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(discount_entity_1.Discount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], DiscountsService);
//# sourceMappingURL=discounts.service.js.map