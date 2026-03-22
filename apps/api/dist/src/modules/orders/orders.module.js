"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrdersModule = void 0;
const common_1 = require("@nestjs/common");
const orders_service_1 = require("./orders.service");
const orders_controller_1 = require("./orders.controller");
const mongoose_1 = require("@nestjs/mongoose");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const discount_entity_1 = require("../discounts/entities/discount.entity");
const config_1 = require("@nestjs/config");
const email_module_1 = require("../../shared/email/email.module");
let OrdersModule = class OrdersModule {
};
exports.OrdersModule = OrdersModule;
exports.OrdersModule = OrdersModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule,
            email_module_1.EmailModule,
            mongoose_1.MongooseModule.forFeature([
                { name: order_entity_1.Order.name, schema: order_entity_1.OrderSchema },
                { name: product_entity_1.Product.name, schema: product_entity_1.ProductSchema },
                { name: discount_entity_1.Discount.name, schema: discount_entity_1.DiscountSchema },
            ]),
        ],
        controllers: [orders_controller_1.OrdersController],
        providers: [orders_service_1.OrdersService],
        exports: [orders_service_1.OrdersService],
    })
], OrdersModule);
//# sourceMappingURL=orders.module.js.map