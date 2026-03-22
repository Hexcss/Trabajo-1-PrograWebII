import { HydratedDocument, Types } from 'mongoose';
export declare class Product {
    _id: any;
    name: string;
    description?: string;
    price: number;
    stock: number;
    imageUrl?: string;
    category?: string;
    categoryId?: Types.ObjectId;
    tags: string[];
    createdBy?: Types.ObjectId;
}
export type ProductDocument = HydratedDocument<Product>;
export declare const ProductSchema: import("mongoose").Schema<Product, import("mongoose").Model<Product, any, any, any, import("mongoose").Document<unknown, any, Product, any, {}> & Product & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Product, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<Product>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<Product> & {
    _id: Types.ObjectId;
} & {
    __v: number;
}>;
