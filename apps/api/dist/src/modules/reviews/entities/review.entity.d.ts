import { HydratedDocument, Types } from 'mongoose';
export declare class Review {
    _id: any;
    productId: Types.ObjectId;
    userId: Types.ObjectId;
    score: number;
    comment?: string;
}
export type ReviewDocument = HydratedDocument<Review>;
export declare const ReviewSchema: import("mongoose").Schema<Review, import("mongoose").Model<Review, any, any, any, import("mongoose").Document<unknown, any, Review, any, {}> & Review & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Review, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Review>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Review> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
