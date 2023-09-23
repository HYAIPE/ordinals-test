import { webcrypto } from "node:crypto";
if (!globalThis.crypto) globalThis.crypto = webcrypto as any;
import("dotenv/config");
import("./wagmi.js");
import("./app.js");
