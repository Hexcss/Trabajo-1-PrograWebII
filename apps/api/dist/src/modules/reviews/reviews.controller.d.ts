import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
export declare class ReviewsController {
    private readonly reviews;
    constructor(reviews: ReviewsService);
    list(productId: string, page?: string, limit?: string, userId?: string): Promise<{
        items: any;
        total: any;
        page: number;
        limit: number;
    }>;
    create(dto: CreateReviewDto, user: any): Promise<any>;
    update(id: string, dto: UpdateReviewDto, user: any): Promise<any>;
    remove(id: string, user: any): Promise<{
        success: boolean;
    }>;
}
