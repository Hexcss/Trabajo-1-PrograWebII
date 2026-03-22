import { Model, Types } from 'mongoose';
import { Order } from './entities/order.entity';
import { Product } from '../products/entities/product.entity';
import { Discount } from '../discounts/entities/discount.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { EmailService } from '../../shared/email/email.service';
export declare class OrdersService {
    private readonly orderModel;
    private readonly productModel;
    private readonly discountModel;
    private readonly emails;
    constructor(orderModel: Model<Order>, productModel: Model<Product>, discountModel: Model<Discount>, emails: EmailService);
    create(dto: CreateOrderDto, user: any): Promise<any>;
    listAll(query: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<{
            _id: any;
            userId: Types.ObjectId;
            items: {
                productId: Types.ObjectId;
                name: string;
                imageUrl?: string | undefined;
                unitPrice: number;
                quantity: number;
                discountPercent?: number | undefined;
                lineTotal: number;
            }[];
            subtotal: number;
            total: number;
            status?: string | undefined;
            currency?: string | undefined;
            email?: string | undefined;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    listMine(userId: string, query: {
        page?: number;
        limit?: number;
    }): Promise<{
        items: (import("mongoose").FlattenMaps<{
            _id: any;
            userId: Types.ObjectId;
            items: {
                productId: Types.ObjectId;
                name: string;
                imageUrl?: string | undefined;
                unitPrice: number;
                quantity: number;
                discountPercent?: number | undefined;
                lineTotal: number;
            }[];
            subtotal: number;
            total: number;
            status?: string | undefined;
            currency?: string | undefined;
            email?: string | undefined;
        }> & {
            _id: Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string, user: any): Promise<import("mongoose").FlattenMaps<{
        _id: any;
        userId: Types.ObjectId;
        items: {
            productId: Types.ObjectId;
            name: string;
            imageUrl?: string | undefined;
            unitPrice: number;
            quantity: number;
            discountPercent?: number | undefined;
            lineTotal: number;
        }[];
        subtotal: number;
        total: number;
        status?: string | undefined;
        currency?: string | undefined;
        email?: string | undefined;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    updateStatus(id: string, dto: UpdateOrderDto): Promise<import("mongoose").Document<unknown, {}, Order, {}, {}> & Order & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
}
