import { Model } from 'mongoose';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { RoleLevel } from '../../common/enums/role.enum';
export declare class ReviewsService {
    private readonly reviewModel;
    constructor(reviewModel: Model<Review>);
    listByProduct(productId: string, page?: number, limit?: number, userId?: string): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    private getOneEnriched;
    create(dto: CreateReviewDto, userId: string): Promise<any>;
    update(id: string, dto: UpdateReviewDto, actorId: string, actorRole: RoleLevel): Promise<any>;
    remove(id: string, actorId: string, actorRole: RoleLevel): Promise<{
        success: boolean;
    }>;
}
