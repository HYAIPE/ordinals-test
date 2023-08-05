import "dotenv/config";
import { webcrypto } from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto as any;

await import("./app.js");
