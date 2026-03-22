import { FilesService } from "./files.service";
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    upload(file: Express.Multer.File, user: any, folder?: string): Promise<{
        url: string;
        key: string;
        filename: string;
        size: number;
        mimeType: string;
    }>;
    remove(url: string): Promise<{
        success: boolean;
    }>;
    filename(url: string): {
        filename: string;
    };
}
