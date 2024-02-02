import { start as startGraphql } from "./graphql.js";
import { start as startWatchEvents } from "./watchClaimedEvents.js";
import { start as startFundingEvents } from "./watchFundingEvents.js";
import { start as startFundedEvents } from "./watchFundedEvents.js";
import { start as startGenesisEvents } from "./watchGenesisEvents.js";

await startGraphql();
// startGenesisEvents();
// startFundingEvents();
// startFundedEvents();
// await startWatchEvents();
