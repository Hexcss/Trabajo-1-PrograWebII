import type { Model } from 'mongoose';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserDocument } from './entities/user.entity';
import { Role } from '../../common/enums/role.enum';
import { UpdateUserDto } from './dto/update-user.dto';
type ListParams = {
    q?: string;
    role?: Role;
    limit?: number;
    page?: number;
};
export declare class UsersService {
    private readonly userModel;
    constructor(userModel: Model<User>);
    findByEmail(email: string): Promise<UserDocument | null>;
    findById(id: string): Promise<UserDocument | null>;
    createUser(dto: CreateUserDto, role?: Role): Promise<UserDocument>;
    updateProfile(userId: string, dto: UpdateUserDto): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    adminUpdateUser(id: string, dto: UpdateUserDto & {
        role?: Role;
    }): Promise<import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
        _id: import("mongoose").Types.ObjectId;
    } & {
        __v: number;
    }>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
    list(params: ListParams): Promise<{
        items: (import("mongoose").Document<unknown, {}, User, {}, {}> & User & {
            _id: import("mongoose").Types.ObjectId;
        } & {
            __v: number;
        })[];
        total: number;
        page: number;
        limit: number;
    }>;
    setRefreshToken(userId: string, refreshToken: string | null): Promise<void>;
    validateRefreshToken(userId: string, refreshToken: string): Promise<boolean>;
}
export {};
