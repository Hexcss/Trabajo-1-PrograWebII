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
exports.CategoriesController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const categories_service_1 = require("./categories.service");
const role_decorator_1 = require("../../common/decorators/role.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const create_category_dto_1 = require("./dto/create-category.dto");
const update_category_dto_1 = require("./dto/update-category.dto");
const public_decorator_1 = require("../../common/decorators/public.decorator");
let CategoriesController = class CategoriesController {
    categories;
    constructor(categories) {
        this.categories = categories;
    }
    async list() {
        return this.categories.list();
    }
    async get(id) {
        return this.categories.getById(id);
    }
    async getNewThumbnail(id) {
        return this.categories.getNewThumbnail(id);
    }
    async create(dto) {
        return this.categories.create(dto);
    }
    async update(id, dto) {
        return this.categories.update(id, dto);
    }
    async remove(id) {
        return this.categories.remove(id);
    }
};
exports.CategoriesController = CategoriesController;
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'List categories with product count and thumbnail' }),
    (0, swagger_1.ApiOkResponse)({ description: 'List of categories' }),
    (0, common_1.Get)(),
    (0, public_decorator_1.Public)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get category by id with product count and thumbnail' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'Category found' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Category not found' }),
    (0, common_1.Get)(':id'),
    (0, public_decorator_1.Public)(),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiOperation)({ summary: 'Get a new random thumbnail for a category' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'New thumbnail generated' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Category not found' }),
    (0, common_1.Get)(':id/thumbnail'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "getNewThumbnail", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Create category (admin only)' }),
    (0, swagger_1.ApiBody)({ type: create_category_dto_1.CreateCategoryDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Category created' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_category_dto_1.CreateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Update category (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: update_category_dto_1.UpdateCategoryDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Category updated' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Category not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_category_dto_1.UpdateCategoryDto]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "update", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Delete category (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'Category deleted' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, swagger_1.ApiNotFoundResponse)({ description: 'Category not found' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], CategoriesController.prototype, "remove", null);
exports.CategoriesController = CategoriesController = __decorate([
    (0, swagger_1.ApiTags)('categories'),
    (0, common_1.Controller)('categories'),
    __metadata("design:paramtypes", [categories_service_1.CategoriesService])
], CategoriesController);
//# sourceMappingURL=categories.controller.js.map