import { start as startFundingEvents } from "./watchFundingEvents.js";
import { start as startFundedEvents } from "./watchFundedEvents.js";
import { start as startGenesisEvents } from "./watchGenesisEvents.js";

startGenesisEvents();
startFundingEvents();
startFundedEvents();
