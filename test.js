const { Logger, LogLevel } = require(".")
const log = new Logger(LogLevel.Debug)

log.debug("This is a debugger message")
log.info("This is an info message")
log.warn("This is a warning message")
log.error("This is an error message")
