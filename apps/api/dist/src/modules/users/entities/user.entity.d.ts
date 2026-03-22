import { HydratedDocument } from 'mongoose';
import { Role } from '../../../common/enums/role.enum';
export declare class User {
    _id: any;
    email: string;
    passwordHash: string;
    role: Role;
    displayName?: string;
    avatarUrl?: string;
    refreshTokenHash?: string;
    emailVerified?: boolean;
}
export type UserDocument = HydratedDocument<User>;
export declare const UserSchema: import("mongoose").Schema<User, import("mongoose").Model<User, any, any, any, import("mongoose").Document<unknown, any, User, any, {}> & User & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}, any>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, User, import("mongoose").Document<unknown, {}, import("mongoose").FlatRecord<User>, {}, import("mongoose").DefaultSchemaOptions> & import("mongoose").FlatRecord<User> & {
    _id: import("mongoose").Types.ObjectId;
} & {
    __v: number;
}>;
