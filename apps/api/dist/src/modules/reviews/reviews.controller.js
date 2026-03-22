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
exports.ReviewsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const reviews_service_1 = require("./reviews.service");
const role_decorator_1 = require("../../common/decorators/role.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const create_review_dto_1 = require("./dto/create-review.dto");
const update_review_dto_1 = require("./dto/update-review.dto");
const user_decorator_1 = require("../../common/decorators/user.decorator");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let ReviewsController = class ReviewsController {
    reviews;
    constructor(reviews) {
        this.reviews = reviews;
    }
    async list(productId, page, limit, userId) {
        const p = Math.max(1, parseInt(page ?? '1', 10) || 1);
        const l = Math.min(100, Math.max(1, parseInt(limit ?? '10', 10) || 10));
        return this.reviews.listByProduct(productId, p, l, userId);
    }
    async create(dto, user) {
        return this.reviews.create(dto, user?.sub);
    }
    async update(id, dto, user) {
        return this.reviews.update(id, dto, user?.sub, user?.role);
    }
    async remove(id, user) {
        return this.reviews.remove(id, user?.sub, user?.role);
    }
};
exports.ReviewsController = ReviewsController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List reviews by product' }),
    (0, swagger_1.ApiQuery)({ name: 'productId', type: String, required: true }),
    (0, swagger_1.ApiQuery)({ name: 'page', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'limit', type: Number, required: false }),
    (0, swagger_1.ApiQuery)({ name: 'userId', type: String, required: false }),
    (0, swagger_1.ApiOkResponse)({ description: 'List of reviews' }),
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Query)('productId')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __param(3, (0, common_1.Query)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, String]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Create review (one per product)' }),
    (0, swagger_1.ApiBody)({ type: create_review_dto_1.CreateReviewDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Review created' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.USER),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_review_dto_1.CreateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Update review (owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: update_review_dto_1.UpdateReviewDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Review updated' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Review not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.USER),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __param(2, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_review_dto_1.UpdateReviewDto, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete review (owner or admin)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'Review deleted' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Review not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.USER),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], ReviewsController.prototype, "remove", null);
exports.ReviewsController = ReviewsController = __decorate([
    (0, swagger_1.ApiTags)('reviews'),
    (0, common_1.Controller)('reviews'),
    __metadata("design:paramtypes", [reviews_service_1.ReviewsService])
], ReviewsController);
//# sourceMappingURL=reviews.controller.js.map