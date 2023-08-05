import { start as startGraphql } from "./graphql.js";
import { start as startWatchEvents } from "./watchClaimedEvents.js";

await startGraphql();
await startWatchEvents();
