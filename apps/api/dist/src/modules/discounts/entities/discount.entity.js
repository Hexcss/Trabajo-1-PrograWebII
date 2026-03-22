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
exports.DiscountSchema = exports.Discount = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const swagger_1 = require("@nestjs/swagger");
let Discount = class Discount {
    _id;
    productId;
    discountPercent;
    startDate;
    endDate;
};
exports.Discount = Discount;
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    __metadata("design:type", Object)
], Discount.prototype, "_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ type: String }),
    (0, mongoose_1.Prop)({ type: mongoose_2.SchemaTypes.ObjectId, ref: 'Product', required: true, index: true }),
    __metadata("design:type", mongoose_2.Types.ObjectId)
], Discount.prototype, "productId", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ example: 10, minimum: 0, maximum: 100 }),
    (0, mongoose_1.Prop)({ required: true, min: 0, max: 100 }),
    __metadata("design:type", Number)
], Discount.prototype, "discountPercent", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Discount.prototype, "startDate", void 0);
__decorate([
    (0, swagger_1.ApiProperty)(),
    (0, mongoose_1.Prop)({ required: true }),
    __metadata("design:type", Date)
], Discount.prototype, "endDate", void 0);
exports.Discount = Discount = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true, collection: 'discounts' })
], Discount);
exports.DiscountSchema = mongoose_1.SchemaFactory.createForClass(Discount);
exports.DiscountSchema.index({ productId: 1, startDate: 1, endDate: 1 });
//# sourceMappingURL=discount.entity.js.map