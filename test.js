const logger = require(".")
const log = logger("test-app", 'info')

log.debug("This is a debugger message")
log.info("This is an info message")
log.warn("This is a warning message")
log.error("This is an error message")
