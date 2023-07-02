import bunyan, { LoggerOptions, LogLevel } from "bunyan";

function toLogLevel(level: string): LogLevel {
  switch (level.toLowerCase()) {
    case "trace":
      return "trace";
    case "debug":
      return "debug";
    case "info":
      return "info";
    case "warn":
      return "warn";
    case "error":
      return "error";
    case "fatal":
      return "fatal";
    default:
      return "info";
  }
}
export function createLogger(opts: LoggerOptions): bunyan {
  return bunyan.createLogger({
    ...opts,
    level: toLogLevel(process.env.LOG_LEVEL ?? "info"),
  });
}
