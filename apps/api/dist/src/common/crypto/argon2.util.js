"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = hashString;
exports.verifyHash = verifyHash;
const argon2 = __importStar(require("argon2"));
const ARGON2_TYPES = {
    argon2i: argon2.argon2i,
    argon2d: argon2.argon2d,
    argon2id: argon2.argon2id,
};
const parseNum = (v, d) => Number.isFinite(Number(v)) ? Number(v) : d;
function getOptions() {
    const typeStr = (process.env.ARGON2_TYPE ?? 'argon2id').toLowerCase();
    const type = typeStr === 'argon2i' ? argon2.argon2i :
        typeStr === 'argon2d' ? argon2.argon2d :
            argon2.argon2id;
    return {
        type,
        memoryCost: parseNum(process.env.ARGON2_MEMORY_COST, 19456),
        timeCost: parseNum(process.env.ARGON2_TIME_COST, 2),
        parallelism: parseNum(process.env.ARGON2_PARALLELISM, 1),
    };
}
async function hashString(plain) {
    return argon2.hash(plain, getOptions());
}
async function verifyHash(hash, plain) {
    return argon2.verify(hash, plain);
}
//# sourceMappingURL=argon2.util.js.map