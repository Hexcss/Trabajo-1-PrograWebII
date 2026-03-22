"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getLevelFromRole = exports.RoleLevelMap = exports.RoleLevel = exports.Role = void 0;
var Role;
(function (Role) {
    Role["USER"] = "user";
    Role["ADMIN"] = "admin";
})(Role || (exports.Role = Role = {}));
var RoleLevel;
(function (RoleLevel) {
    RoleLevel[RoleLevel["ADMIN"] = 100] = "ADMIN";
    RoleLevel[RoleLevel["USER"] = 10] = "USER";
})(RoleLevel || (exports.RoleLevel = RoleLevel = {}));
exports.RoleLevelMap = {
    user: RoleLevel.USER,
    admin: RoleLevel.ADMIN,
};
const getLevelFromRole = (roleString) => {
    return exports.RoleLevelMap[roleString];
};
exports.getLevelFromRole = getLevelFromRole;
//# sourceMappingURL=role.enum.js.map