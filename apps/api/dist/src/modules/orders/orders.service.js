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
exports.OrdersService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../products/entities/product.entity");
const discount_entity_1 = require("../discounts/entities/discount.entity");
const email_service_1 = require("../../shared/email/email.service");
const role_enum_1 = require("../../common/enums/role.enum");
let OrdersService = class OrdersService {
    orderModel;
    productModel;
    discountModel;
    emails;
    constructor(orderModel, productModel, discountModel, emails) {
        this.orderModel = orderModel;
        this.productModel = productModel;
        this.discountModel = discountModel;
        this.emails = emails;
    }
    async create(dto, user) {
        if (!dto.items?.length)
            throw new common_1.BadRequestException('No items');
        const ids = dto.items.map((i) => new mongoose_2.Types.ObjectId(i.productId));
        const session = await this.productModel.db.startSession();
        let created;
        await session.withTransaction(async () => {
            const products = await this.productModel.find({ _id: { $in: ids } }).session(session).lean().exec();
            if (products.length !== ids.length)
                throw new common_1.BadRequestException('Some products not found');
            const now = new Date();
            const discounts = await this.discountModel
                .aggregate([
                { $match: { productId: { $in: ids }, startDate: { $lte: now }, endDate: { $gte: now } } },
                { $sort: { discountPercent: -1 } },
                { $group: { _id: '$productId', discountPercent: { $first: '$discountPercent' }, startDate: { $first: '$startDate' }, endDate: { $first: '$endDate' } } },
            ])
                .session(session)
                .exec();
            const discountMap = new Map(discounts.map((d) => [String(d._id), d.discountPercent]));
            const productMap = new Map(products.map((p) => [String(p._id), p]));
            const orderItems = [];
            let subtotal = 0;
            for (const item of dto.items) {
                const p = productMap.get(item.productId);
                if (!p)
                    throw new common_1.BadRequestException('Product not found');
                const upd = await this.productModel.updateOne({ _id: new mongoose_2.Types.ObjectId(item.productId), stock: { $gte: item.quantity } }, { $inc: { stock: -item.quantity } }, { session });
                if (upd.matchedCount === 0)
                    throw new common_1.BadRequestException('Insufficient stock');
                const disc = discountMap.get(item.productId) || 0;
                const unitPrice = Math.round(p.price * (1 - disc / 100) * 100) / 100;
                const lineTotal = Math.round(unitPrice * item.quantity * 100) / 100;
                subtotal = Math.round((subtotal + lineTotal) * 100) / 100;
                orderItems.push({
                    productId: new mongoose_2.Types.ObjectId(item.productId),
                    name: p.name,
                    imageUrl: p.imageUrl,
                    unitPrice,
                    quantity: item.quantity,
                    discountPercent: disc || undefined,
                    lineTotal,
                });
            }
            const orderDoc = new this.orderModel({
                userId: new mongoose_2.Types.ObjectId(user?.sub),
                items: orderItems,
                subtotal,
                total: subtotal,
                status: 'created',
                currency: dto.currency || 'EUR',
                email: user?.email,
            });
            created = await orderDoc.save({ session });
        });
        session.endSession();
        const emailStatus = await this.emails.sendOrderConfirmation({
            _id: created?._id,
            email: created?.email,
            items: created?.items ?? [],
            total: created?.total ?? 0,
        });
        return { ...(created?.toObject?.() ? created.toObject() : created), emailStatus };
    }
    async listAll(query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const [items, total] = await Promise.all([
            this.orderModel.find({}).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit).lean().exec(),
            this.orderModel.countDocuments().exec(),
        ]);
        return { items, total, page, limit };
    }
    async listMine(userId, query) {
        const page = Math.max(1, Number(query.page) || 1);
        const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
        const [items, total] = await Promise.all([
            this.orderModel
                .find({ userId: new mongoose_2.Types.ObjectId(userId) })
                .sort({ createdAt: -1 })
                .skip((page - 1) * limit)
                .limit(limit)
                .lean()
                .exec(),
            this.orderModel.countDocuments({ userId: new mongoose_2.Types.ObjectId(userId) }).exec(),
        ]);
        return { items, total, page, limit };
    }
    async getById(id, user) {
        const doc = await this.orderModel.findById(id).lean().exec();
        if (!doc)
            throw new common_1.NotFoundException('Order not found');
        const isAdmin = String(user?.role).toLowerCase() === 'admin' ||
            (Array.isArray(user?.roles) && user.roles.map((r) => String(r).toLowerCase()).includes('admin')) ||
            (typeof user?.roleLevel === 'number' && user.roleLevel >= role_enum_1.RoleLevel.ADMIN);
        if (!isAdmin && String(doc.userId) !== String(user?.sub)) {
            throw new common_1.ForbiddenException();
        }
        return doc;
    }
    async updateStatus(id, dto) {
        const updated = await this.orderModel.findByIdAndUpdate(id, { $set: dto }, { new: true }).exec();
        if (!updated)
            throw new common_1.NotFoundException('Order not found');
        return updated;
    }
};
exports.OrdersService = OrdersService;
exports.OrdersService = OrdersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(order_entity_1.Order.name)),
    __param(1, (0, mongoose_1.InjectModel)(product_entity_1.Product.name)),
    __param(2, (0, mongoose_1.InjectModel)(discount_entity_1.Discount.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        email_service_1.EmailService])
], OrdersService);
//# sourceMappingURL=orders.service.js.map