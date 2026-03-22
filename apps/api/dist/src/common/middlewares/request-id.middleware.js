"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requestIdMiddleware = requestIdMiddleware;
const uuid_1 = require("uuid");
function requestIdMiddleware(req, _res, next) {
    if (!req.headers['x-request-id']) {
        req.headers['x-request-id'] = (0, uuid_1.v4)();
    }
    next();
}
//# sourceMappingURL=request-id.middleware.js.map