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
exports.ReviewSchema = exports.Review = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Review = class Review {
    _id;
    productId;
    userId;
    score;
    comment;
};
exports.Review = Review;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    __metadata("design:type", Object)
], Review.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'User', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Review.prototype, "userId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ minimum: 1, maximum: 5, example: 4.5 }),
    (0, mongoose_1.Prop)({ required: true, min: 1, max: 5 }),
    __metadata("design:type", Number)
], Review.prototype, "score", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)(),
    (0, mongoose_1.Prop)(),
    __metadata("design:type", String)
], Review.prototype, "comment", void 0);
exports.Review = Review = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'reviews' })
], Review);
exports.ReviewSchema = mongoose_1.SchemaFactory.createForClass(Review);
exports.ReviewSchema.index({ productId: 1, userId: 1 }, { unique: true });
exports.ReviewSchema.index({ productId: 1, createdAt: -1 });
//# sourceMappingURL=review.entity.js.map