import { DiscountsService } from './discounts.service';
import { CreateDiscountDto } from './dto/create-discount.dto';
import { UpdateDiscountDto } from './dto/update-discount.dto';
export declare class DiscountsController {
    private readonly discounts;
    constructor(discounts: DiscountsService);
    list(productId?: string): Promise<(import("mongoose").FlattenMaps<{
        _id: any;
        productId: import("mongoose").Types.ObjectId;
        discountPercent: number;
        startDate: Date;
        endDate: Date;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    })[]>;
    get(id: string): Promise<import("mongoose").FlattenMaps<{
        _id: any;
        productId: import("mongoose").Types.ObjectId;
        discountPercent: number;
        startDate: Date;
        endDate: Date;
    }> & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    create(dto: CreateDiscountDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/discount.entity").Discount, {}, {}> & import("./entities/discount.entity").Discount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateDiscountDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/discount.entity").Discount, {}, {}> & import("./entities/discount.entity").Discount & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
