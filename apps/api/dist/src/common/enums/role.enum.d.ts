export declare enum Role {
    USER = "user",
    ADMIN = "admin"
}
export declare enum RoleLevel {
    ADMIN = 100,
    USER = 10
}
export declare const RoleLevelMap: Record<Role, RoleLevel>;
export declare const getLevelFromRole: (roleString: Role) => RoleLevel | undefined;
