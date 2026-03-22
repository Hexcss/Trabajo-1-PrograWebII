"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const env_validation_1 = require("./config/env.validation");
const app_config_1 = require("./config/app.config");
const logger_service_1 = require("./common/logger/logger.service");
const database_module_1 = require("./shared/database/database.module");
const users_module_1 = require("./modules/users/users.module");
const health_module_1 = require("./modules/health/health.module");
const products_module_1 = require("./modules/products/products.module");
const auth_module_1 = require("./modules/auth/auth.module");
const core_module_1 = require("./shared/core/core.module");
const categories_module_1 = require("./modules/categories/categories.module");
const reviews_module_1 = require("./modules/reviews/reviews.module");
const discount_module_1 = require("./modules/discounts/discount.module");
const files_module_1 = require("./shared/files/files.module");
const orders_module_1 = require("./modules/orders/orders.module");
const email_module_1 = require("./shared/email/email.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                ignoreEnvFile: false,
                load: [app_config_1.appConfig],
                validate: (config) => {
                    const parsed = env_validation_1.envSchema.safeParse(config);
                    if (!parsed.success) {
                        throw new Error('Invalid environment variables:\n' +
                            JSON.stringify(parsed.error.format(), null, 2));
                    }
                    return parsed.data;
                },
            }),
            core_module_1.CoreModule,
            health_module_1.HealthModule,
            database_module_1.DatabaseModule,
            email_module_1.EmailModule,
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            files_module_1.FilesModule,
            categories_module_1.CategoriesModule,
            products_module_1.ProductsModule,
            reviews_module_1.ReviewsModule,
            discount_module_1.DiscountsModule,
            orders_module_1.OrdersModule
        ],
        providers: [logger_service_1.AppLogger],
        exports: [logger_service_1.AppLogger],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map