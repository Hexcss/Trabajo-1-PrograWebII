export declare class CreateOrderItemDto {
    productId: string;
    quantity: number;
}
export declare class CreateOrderDto {
    items: CreateOrderItemDto[];
    currency?: string;
}
