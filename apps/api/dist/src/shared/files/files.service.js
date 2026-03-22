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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
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
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const storage_1 = require("@google-cloud/storage");
const path = __importStar(require("node:path"));
const node_fs_1 = require("node:fs");
const node_crypto_1 = require("node:crypto");
let FilesService = class FilesService {
    config;
    storage;
    bucketName;
    constructor(config) {
        this.config = config;
        this.storage = new storage_1.Storage();
        this.bucketName =
            this.config.get('STORAGE_BUCKET', { infer: true }) ||
                this.config.get('GCS_BUCKET', { infer: true }) ||
                '';
        if (!this.bucketName)
            throw new common_1.InternalServerErrorException('Missing GCS bucket env');
    }
    async upload(file, userId, folder) {
        if (!file || (!file.buffer && !file.path) || !file.originalname) {
            throw new common_1.InternalServerErrorException('Invalid file');
        }
        const data = file.buffer ??
            (await node_fs_1.promises.readFile(file.path).catch(() => undefined));
        if (!data)
            throw new common_1.InternalServerErrorException('Invalid file');
        const now = new Date();
        const yyyy = String(now.getFullYear());
        const mm = String(now.getMonth() + 1).padStart(2, '0');
        const base = this.sanitizeBase(path.basename(file.originalname, path.extname(file.originalname)));
        const ext = (path.extname(file.originalname) || '').toLowerCase().replace(/[^.\w]/g, '');
        const key = `${folder || 'uploads'}/${userId}/${yyyy}/${mm}/${(0, node_crypto_1.randomUUID)()}_${base}${ext}`;
        const bucket = this.storage.bucket(this.bucketName);
        const gcsFile = bucket.file(key);
        await gcsFile.save(data, {
            resumable: false,
            contentType: file.mimetype || 'application/octet-stream',
            metadata: {
                contentType: file.mimetype || 'application/octet-stream',
                cacheControl: 'public, max-age=31536000, immutable',
            },
            validation: false,
        });
        const url = this.publicUrl(key);
        return {
            url,
            key,
            filename: path.basename(key),
            size: file.size,
            mimeType: file.mimetype || 'application/octet-stream',
        };
    }
    async deleteByUrl(url) {
        const objectPath = this.getObjectPathFromUrl(url);
        if (!objectPath)
            return { success: false };
        const bucket = this.storage.bucket(this.bucketName);
        await bucket.file(objectPath).delete({ ignoreNotFound: true });
        return { success: true };
    }
    getFilenameFromUrl(url) {
        const objectPath = this.getObjectPathFromUrl(url);
        if (!objectPath)
            return '';
        const i = objectPath.lastIndexOf('/');
        return i >= 0 ? objectPath.slice(i + 1) : objectPath;
    }
    getObjectPathFromUrl(url) {
        if (!url)
            return '';
        try {
            const u = new URL(url);
            const host = u.hostname.toLowerCase();
            if (host === 'storage.googleapis.com' || host.endsWith('.storage.googleapis.com')) {
                if (u.pathname.startsWith(`/${this.bucketName}/`))
                    return decodeURIComponent(u.pathname.slice(this.bucketName.length + 2));
                if (host === `${this.bucketName}.storage.googleapis.com`)
                    return decodeURIComponent(u.pathname.replace(/^\/+/, ''));
            }
            const b = u.searchParams.get('bucket');
            const o = u.searchParams.get('name') || u.searchParams.get('object') || u.searchParams.get('o');
            if ((b && b === this.bucketName) && o)
                return decodeURIComponent(o);
            return decodeURIComponent(u.pathname.replace(/^\/+/, ''));
        }
        catch {
            return '';
        }
    }
    publicUrl(objectPath) {
        return `https://storage.googleapis.com/${this.bucketName}/${encodeURIComponent(objectPath).replace(/%2F/g, '/')}`;
    }
    sanitizeBase(s) {
        const t = s.normalize('NFKD').replace(/[\u0300-\u036f]/g, '');
        return t.replace(/[^\w\-]+/g, '_').replace(/_+/g, '_').replace(/^_+|_+$/g, '').slice(0, 80) || 'file';
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], FilesService);
//# sourceMappingURL=files.service.js.map