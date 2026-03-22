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
exports.OrdersController = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const create_order_dto_1 = require("./dto/create-order.dto");
const update_order_dto_1 = require("./dto/update-order.dto");
const swagger_1 = require("@nestjs/swagger");
const role_decorator_1 = require("../../common/decorators/role.decorator");
const role_enum_1 = require("../../common/enums/role.enum");
const user_decorator_1 = require("../../common/decorators/user.decorator");
let OrdersController = class OrdersController {
    orders;
    constructor(orders) {
        this.orders = orders;
    }
    async create(dto, user) {
        return this.orders.create(dto, user);
    }
    async my(user, limit, page) {
        return this.orders.listMine(user?.sub, { limit, page });
    }
    async list(limit, page) {
        return this.orders.listAll({ limit, page });
    }
    async get(id, user) {
        return this.orders.getById(id, user);
    }
    async update(id, dto) {
        return this.orders.updateStatus(id, dto);
    }
};
exports.OrdersController = OrdersController;
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Create order from cart items' }),
    (0, swagger_1.ApiBody)({ type: create_order_dto_1.CreateOrderDto }),
    (0, swagger_1.ApiCreatedResponse)({ description: 'Order created' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_order_dto_1.CreateOrderDto, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "create", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'List my orders' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiOkResponse)({ description: 'My orders' }),
    (0, common_1.Get)('my'),
    __param(0, (0, user_decorator_1.CurrentUser)()),
    __param(1, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(2, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "my", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'List all orders (admin only)' }),
    (0, swagger_1.ApiQuery)({ name: 'limit', required: false, type: Number }),
    (0, swagger_1.ApiQuery)({ name: 'page', required: false, type: Number }),
    (0, swagger_1.ApiOkResponse)({ description: 'All orders' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Get)(),
    __param(0, (0, common_1.Query)('limit', new common_1.ParseIntPipe({ optional: true }))),
    __param(1, (0, common_1.Query)('page', new common_1.ParseIntPipe({ optional: true }))),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Number]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "list", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Get order by id (admin or owner)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiOkResponse)({ description: 'Order found' }),
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, user_decorator_1.CurrentUser)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "get", null);
__decorate([
    (0, swagger_1.ApiCookieAuth)('accessToken'),
    (0, swagger_1.ApiOperation)({ summary: 'Update order status (admin only)' }),
    (0, swagger_1.ApiParam)({ name: 'id', type: String }),
    (0, swagger_1.ApiBody)({ type: update_order_dto_1.UpdateOrderDto }),
    (0, swagger_1.ApiOkResponse)({ description: 'Order updated' }),
    (0, swagger_1.ApiUnauthorizedResponse)({ description: 'Unauthorized' }),
    (0, swagger_1.ApiForbiddenResponse)({ description: 'Forbidden' }),
    (0, role_decorator_1.MinRole)(role_enum_1.RoleLevel.ADMIN),
    (0, common_1.Put)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, update_order_dto_1.UpdateOrderDto]),
    __metadata("design:returntype", Promise)
], OrdersController.prototype, "update", null);
exports.OrdersController = OrdersController = __decorate([
    (0, swagger_1.ApiTags)('orders'),
    (0, common_1.Controller)('orders'),
    __metadata("design:paramtypes", [orders_service_1.OrdersService])
], OrdersController);
//# sourceMappingURL=orders.controller.js.map