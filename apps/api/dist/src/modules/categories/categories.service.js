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
exports.CategoriesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const category_entity_1 = require("./entities/category.entity");
const product_entity_1 = require("../products/entities/product.entity");
let CategoriesService = class CategoriesService {
    categoryModel;
    productModel;
    constructor(categoryModel, productModel) {
        this.categoryModel = categoryModel;
        this.productModel = productModel;
    }
    async sampleCategoryThumbnail(categoryObjectId) {
        const filter = {
            categoryId: categoryObjectId,
            imageUrl: { $exists: true, $nin: [null, ''] },
        };
        const total = await this.productModel.countDocuments(filter).exec();
        if (!total)
            return null;
        const skip = Math.floor(Math.random() * total);
        const doc = await this.productModel
            .findOne(filter)
            .skip(skip)
            .select({ _id: 0, imageUrl: 1 })
            .lean()
            .exec();
        return doc?.imageUrl ?? null;
    }
    async list() {
        const items = await this.categoryModel.find().sort({ name: 1 }).lean().exec();
        if (items.length === 0)
            return [];
        const ids = items.map((i) => i._id);
        const counts = await this.productModel
            .aggregate([
            { $match: { categoryId: { $in: ids } } },
            { $group: { _id: '$categoryId', count: { $sum: 1 } } },
        ])
            .exec();
        const countMap = new Map(counts.map((c) => [String(c._id), c.count]));
        const thumbMap = new Map();
        await Promise.all(ids.map(async (oid) => {
            const t = await this.sampleCategoryThumbnail(oid);
            thumbMap.set(String(oid), t);
        }));
        return items.map((i) => ({
            ...i,
            productCount: countMap.get(String(i._id)) ?? 0,
            thumbnail: thumbMap.get(String(i._id)) ?? null,
        }));
    }
    async getById(id) {
        const item = await this.categoryModel.findById(id).lean().exec();
        if (!item)
            throw new common_1.NotFoundException('Category not found');
        const oid = new mongoose_2.Types.ObjectId(id);
        const [productCount, thumbnail] = await Promise.all([
            this.productModel.countDocuments({ categoryId: oid }).exec(),
            this.sampleCategoryThumbnail(oid),
        ]);
        return { ...item, productCount, thumbnail };
    }
    async getNewThumbnail(id) {
        const exists = await this.categoryModel.exists({ _id: id });
        if (!exists)
            throw new common_1.NotFoundException('Category not found');
        const oid = new mongoose_2.Types.ObjectId(id);
        const thumbnail = await this.sampleCategoryThumbnail(oid);
        return { categoryId: id, thumbnail };
    }
    async create(dto) {
        const created = new this.categoryModel(dto);
        return created.save();
    }
    async update(id, dto) {
        const updated = await this.categoryModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Category not found');
        return updated;
    }
    async remove(id) {
        const deleted = await this.categoryModel.findByIdAndDelete(id).exec();
        if (!deleted)
            throw new common_1.NotFoundException('Category not found');
        return { success: true };
    }
};
exports.CategoriesService = CategoriesService;
exports.CategoriesService = CategoriesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(category_entity_1.Category.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_entity_1.Product.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model])
], CategoriesService);
//# sourceMappingURL=categories.service.js.map