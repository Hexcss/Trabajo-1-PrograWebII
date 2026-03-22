import { Model, Types } from 'mongoose';
import { Discount } from './entities/discount.entity';
export declare class DiscountsService {
    private readonly discountModel;
    constructor(discountModel: Model<Discount>);
    list(productId?: string): Promise<(import("mongoose").FlattenMaps<{
        _id: any;
        productId: Types.ObjectId;
        discountPercent: number;
        startDate: Date;
        endDate: Date;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    getById(id: string): Promise<import("mongoose").FlattenMaps<{
        _id: any;
        productId: Types.ObjectId;
        discountPercent: number;
        startDate: Date;
        endDate: Date;
    }> & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    create(dto: {
        productId: string;
        discountPercent: number;
        startDate: string;
        endDate: string;
    }): Promise<import("mongoose").Document<unknown, {}, Discount, {}, {}> & Discount & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: Partial<{
        productId: string;
        discountPercent: number;
        startDate: string;
        endDate: string;
    }>): Promise<import("mongoose").Document<unknown, {}, Discount, {}, {}> & Discount & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    findActiveForProducts(productIds: Types.ObjectId[], now: Date): Promise<Map<string, {
        discountPercent: number;
        startDate: Date;
        endDate: Date;
    }>>;
}
