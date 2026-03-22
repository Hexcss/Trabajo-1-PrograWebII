import { OnModuleInit } from '@nestjs/common';
import { ModuleRef } from '@nestjs/core';
export declare class CoreModule implements OnModuleInit {
    private readonly moduleRef;
    constructor(moduleRef: ModuleRef);
    onModuleInit(): void;
}
