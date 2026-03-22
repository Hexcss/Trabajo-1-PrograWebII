import { HydratedDocument, Types } from 'mongoose';
export declare class Discount {
    _id: any;
    productId: Types.ObjectId;
    discountPercent: number;
    startDate: Date;
    endDate: Date;
}
export type DiscountDocument = HydratedDocument<Discount>;
export declare const DiscountSchema: import("mongoose").Schema<Discount, import("mongoose").Model<Discount, any, any, any, import("mongoose").Document<unknown, any, Discount, any, {}> & Discount & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Discount, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Discount>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Discount> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
