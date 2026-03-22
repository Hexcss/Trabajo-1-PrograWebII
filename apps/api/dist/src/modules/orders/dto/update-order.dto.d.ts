export declare const ORDER_STATUS: readonly ["created", "processing", "shipped", "delivered", "cancelled", "canceled"];
export type OrderStatus = typeof ORDER_STATUS[number];
export declare class UpdateOrderDto {
    status?: OrderStatus;
}
