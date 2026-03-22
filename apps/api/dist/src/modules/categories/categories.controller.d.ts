import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
export declare class CategoriesController {
    private readonly categories;
    constructor(categories: CategoriesService);
    list(): Promise<{
        productCount: number;
        thumbnail: string | null;
        _id: any;
        name: string;
        icon: string;
        __v: number;
    }[]>;
    get(id: string): Promise<{
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
    create(dto: CreateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/category.entity").Category, {}, {}> & import("./entities/category.entity").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateCategoryDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/category.entity").Category, {}, {}> & import("./entities/category.entity").Category & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
