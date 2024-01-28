import Logger from "bunyan";

export interface ILogContext {
  logger: Logger;
}

export function createLogContext(logger: Logger): ILogContext {
  return {
    logger,
  };
}
