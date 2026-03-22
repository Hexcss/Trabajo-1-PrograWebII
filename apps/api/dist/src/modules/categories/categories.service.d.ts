import { Model, Types } from 'mongoose';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Product } from '../products/entities/product.entity';
export declare class CategoriesService {
    private readonly categoryModel;
    private readonly productModel;
    constructor(categoryModel: Model<Category>, productModel: Model<Product>);
    private sampleCategoryThumbnail;
    list(): Promise<{
        productCount: number;
        thumbnail: string | null;
        _id: any;
        name: string;
        icon: string;
        __v: number;
    }[]>;
    getById(id: string): Promise<{
        productCount: number;
        thumbnail: string | null;
        _id: any;
        name: string;
        icon: string;
        __v: number;
    }>;
    getNewThumbnail(id: string): Promise<{
        categoryId: string;
        thumbnail: string | null;
    }>;
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, Category, {}, {}> & Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("mongoose").Document<unknown, {}, Category, {}, {}> & Category & {
        _id: Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
