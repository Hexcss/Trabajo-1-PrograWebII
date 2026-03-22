import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Role } from '../../common/enums/role.enum';
declare class AdminCreateUserDto extends CreateUserDto {
    role?: Role;
}
declare class AdminUpdateUserDto extends UpdateUserDto {
    role?: Role;
}
export declare class UsersController {
    private readonly users;
    constructor(users: UsersService);
    me(user: any): Promise<{
        _id: any;
        email: string;
        displayName: string | undefined;
        role: Role;
        createdAt: any;
        avatarUrl: string | undefined;
    } | null>;
    updateMe(user: any, dto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/user.entity").User, {}, {}> & import("./entities/user.entity").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    list(q?: string, role?: Role, limit?: number, page?: number): Promise<{
        items: (import("mongoose").Document<unknown, {}, import("./entities/user.entity").User, {}, {}> & import("./entities/user.entity").User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<(import("mongoose").Document<unknown, {}, import("./entities/user.entity").User, {}, {}> & import("./entities/user.entity").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }) | null>;
    adminCreate(dto: AdminCreateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/user.entity").User, {}, {}> & import("./entities/user.entity").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    adminUpdate(id: string, dto: AdminUpdateUserDto): Promise<import("mongoose").Document<unknown, {}, import("./entities/user.entity").User, {}, {}> & import("./entities/user.entity").User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    adminDelete(id: string): Promise<{
        success: boolean;
    }>;
}
export {};
