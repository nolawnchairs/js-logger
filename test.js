const { Logger, LogLevel } = require(".")
const log = new Logger(LogLevel.Debug)

const sample = {
  name: 'Rick Sanchez',
  genuisLevel: 10,
  sidekick: {
    name: 'Morty Smith',
    geniusLevel: 2,
  },
}

log.info('Sample', sample)
log.expand().info(sample)
