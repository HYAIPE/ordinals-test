import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { UserDAO } from "./user";

describe("#User MODEL", () => {
  it("should return null if user does not exist", async () => {
    const userId = createUuid();
    const db = getDb();
    const dao = new UserDAO(db as any);
    const user = await dao.getUser(userId);
    expect(user).toBeNull();
  });
});
