import { getDb } from "@0xflick/ordinals-backend";
import { v4 as createUuid } from "uuid";
import { UserDAO } from "./user.js";

describe("#User MODEL", () => {
  it("returns empty array if user does not exist", async () => {
    const userId = createUuid();
    const db = getDb();
    const dao = new UserDAO(db as any);
    const nonces = await dao.getUsersNonces(userId);
    expect(nonces).toEqual([]);
  });
});
