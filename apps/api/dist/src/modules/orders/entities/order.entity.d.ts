import { HydratedDocument, Types } from 'mongoose';
export declare class OrderItem {
    productId: Types.ObjectId;
    name: string;
    imageUrl?: string;
    unitPrice: number;
    quantity: number;
    discountPercent?: number;
    lineTotal: number;
}
export declare class Order {
    _id: any;
    userId: Types.ObjectId;
    items: OrderItem[];
    subtotal: number;
    total: number;
    status?: string;
    currency?: string;
    email?: string;
}
export type OrderDocument = HydratedDocument<Order>;
export declare const OrderSchema: import("mongoose").Schema<Order, import("mongoose").Model<Order, any, any, any, import("mongoose").Document<unknown, any, Order, any, {}> & Order & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Order, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Order>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Order> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
