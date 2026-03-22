"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MinRole = exports.MIN_ROLE_KEY = void 0;
const common_1 = require("@nestjs/common");
exports.MIN_ROLE_KEY = 'minRole';
const MinRole = (level) => (0, common_1.SetMetadata)(exports.MIN_ROLE_KEY, level);
exports.MinRole = MinRole;
//# sourceMappingURL=role.decorator.js.map