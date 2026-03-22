import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
export declare class ProductsController {
    private readonly products;
    constructor(products: ProductsService);
    list(q?: string, category?: string, categoryId?: string, limit?: number, page?: number, sort?: 'new' | 'priceAsc' | 'priceDesc' | 'rating'): Promise<{
        total: any;
        page: number;
        limit: number;
        items: any;
    }>;
    top(limit?: number): Promise<any[]>;
    get(id: string): Promise<{
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
        categoryId?: import("mongoose").Types.ObjectId | undefined;
        tags: string[];
        createdBy?: import("mongoose").Types.ObjectId | undefined;
        __v: number;
    }>;
    create(dto: CreateProductDto, user: any): Promise<import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}, {}> & import("./entities/product.entity").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    update(id: string, dto: UpdateProductDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/product.entity").Product, {}, {}> & import("./entities/product.entity").Product & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
