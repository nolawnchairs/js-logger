const logger = require(".")
const log = logger("[test-app]", 'debug', { printLevel: 'initial' })
const log2 = logger('[test-app-2', 'debug', { printLevel: 'full' })

log.debug("This is a debugger message")
log.info("This is an info message")
log.warn("This is a warning message")
log2.error("This is an error message")
