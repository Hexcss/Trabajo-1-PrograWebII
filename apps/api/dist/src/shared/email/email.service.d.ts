import { ConfigService } from '@nestjs/config';
type EmailSendResult = {
    attempted: boolean;
    sent: boolean;
    id: string | null;
    error: string | null;
};
export declare class EmailService {
    private readonly config;
    constructor(config: ConfigService);
    private getClient;
    send(options: {
        to: string | string[];
        subject: string;
        html?: string;
        text?: string;
        from?: string;
    }): Promise<EmailSendResult>;
    buildOrderConfirmationHtml(order: {
        _id: any;
        items: {
            name: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[];
        total: number;
    }): string;
    sendOrderConfirmation(order: {
        _id: any;
        email?: string | null;
        items: {
            name: string;
            quantity: number;
            unitPrice: number;
            lineTotal: number;
        }[];
        total: number;
        from?: string;
    }): Promise<EmailSendResult>;
    buildVerifyEmailHtml(input: {
        displayName?: string;
        email: string;
        link: string;
    }): string;
    sendEmailVerification(input: {
        to: string;
        link: string;
        displayName?: string;
    }): Promise<EmailSendResult>;
}
export {};
