import { IRolePermission } from "./models/rolePermissions.js";

export * from "./dao/index.js";
export * from "./models/index.js";

export type TPermission = Omit<IRolePermission, "roleId">;
