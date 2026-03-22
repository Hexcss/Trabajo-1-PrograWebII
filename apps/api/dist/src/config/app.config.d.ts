export declare const appConfig: () => {
    port: number;
    corsOrigins: string[];
    clientUrl: string;
    mongoUri: string;
    jwt: {
        accessSecret: string;
        accessExpires: string;
        refreshSecret: string;
        refreshExpires: string;
    };
    oauth: {
        google: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        };
        github: {
            clientId: string;
            clientSecret: string;
            redirectUri: string;
        };
    };
};
export type AppConfig = ReturnType<typeof appConfig>;
