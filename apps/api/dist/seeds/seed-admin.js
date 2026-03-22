"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const core_1 = require("@nestjs/core");
const users_service_1 = require("../src/modules/users/users.service");
const app_module_1 = require("../src/app.module");
const role_enum_1 = require("../src/common/enums/role.enum");
async function run() {
    const app = await core_1.NestFactory.createApplicationContext(app_module_1.AppModule);
    const users = app.get(users_service_1.UsersService);
    const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@store.local';
    const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
    const displayName = process.env.SEED_ADMIN_DISPLAY_NAME ?? 'Admin';
    const exists = await users.findByEmail(email);
    if (exists) {
        console.log('Admin already exists:', email);
        await app.close();
        return;
    }
    const created = await users.createUser({ email, password, displayName }, role_enum_1.Role.ADMIN);
    console.log('Admin created:', created.email);
    await app.close();
}
run().catch((e) => {
    console.error(e);
    process.exit(1);
});
//# sourceMappingURL=seed-admin.js.map