import { Model, Types } from 'mongoose';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';
import { Review } from '../reviews/entities/review.entity';
import { Discount } from '../discounts/entities/discount.entity';
export declare class ProductsService {
    private readonly productModel;
    private readonly reviewModel;
    private readonly discountModel;
    constructor(productModel: Model<Product>, reviewModel: Model<Review>, discountModel: Model<Discount>);
    list(query: {
        q?: string;
        category?: string;
        categoryId?: string;
        limit?: number;
        page?: number;
        sort?: 'new' | 'priceAsc' | 'priceDesc' | 'rating';
    }): Promise<{
        total: any;
        page: number;
        limit: number;
        items: any;
    }>;
    getById(id: string): Promise<{
        avgRating: number | null;
        reviewCount: any;
        activeDiscount: {
            discountPercent: any;
            startDate: any;
            endDate: any;
        } | null;
        _id: any;
        name: string;
        description?: string | undefined;
        price: number;
        stock: number;
        imageUrl?: string | undefined;
        category?: string | undefined;
        categoryId?: Types.ObjectId | undefined;
        tags: string[];
        createdBy?: Types.ObjectId | undefined;
        __v: number;
    }>;
    topRated(limit?: number): Promise<any[]>;
    create(dto: CreateProductDto, userId?: string): Promise<import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<import("mongoose").Document<unknown, {}, Product, {}, {}> & Product & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
