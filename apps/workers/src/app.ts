import { start as startFundingEvents } from "./watchFundingEvents.js";
import { start as startFundedEvents } from "./watchFundedEvents.js";
import { start as startGenesisEvents } from "./watchGenesisEvents.js";

const network = process.env.NETWORK as "mainnet" | "testnet" | undefined;

startGenesisEvents(network);
startFundingEvents(network);
startFundedEvents(network);
