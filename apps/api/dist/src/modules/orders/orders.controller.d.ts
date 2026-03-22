import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
export declare class OrdersController {
    private readonly orders;
    constructor(orders: OrdersService);
    create(dto: CreateOrderDto, user: any): Promise<any>;
    my(user: any, limit?: number, page?: number): Promise<{
        items: (import("mongoose").FlattenMaps<{
            _id: any;
            userId: import("mongoose").Types.ObjectId;
            items: {
                productId: import("mongoose").Types.ObjectId;
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
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    list(limit?: number, page?: number): Promise<{
        items: (import("mongoose").FlattenMaps<{
            _id: any;
            userId: import("mongoose").Types.ObjectId;
            items: {
                productId: import("mongoose").Types.ObjectId;
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
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    get(id: string, user: any): Promise<import("mongoose").FlattenMaps<{
        _id: any;
        userId: import("mongoose").Types.ObjectId;
        items: {
            productId: import("mongoose").Types.ObjectId;
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
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateOrderDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/order.entity").Order, {}, {}> & import("./entities/order.entity").Order & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
}
