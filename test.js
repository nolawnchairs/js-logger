const { Logger, LogLevel } = require(".")
const log = new Logger(LogLevel.Debug)

const sample = {
  name: 'Rick Sanchez',
  intelligence: 100,
  sidekick: {
    name: 'Morty Smith',
    intelligence: 2,
  },
  idiot: {
    name: 'Jerry Smith',
    intelligence: -10
  }
}

log.debug('Debug Message')
log.info('Info message')
log.warn('Warning message')
log.error('Error message')
log.expand().info('Expanded message', sample)

const custom = new Logger(LogLevel.Debug, (entry, colorizer) => {
  return [
    `[${colorizer.levelDefault(entry.level, entry.levelValue.charAt(0))}]`,
    colorizer.grey(entry.date.toISOString()),
    '>>',
    entry.pid,
    '|',
    entry.message
  ].join(' ')
})

custom.info('Test info %s', 'this is a vararg')

const restricted = new Logger(LogLevel.Error)
restricted.error('Error message')
restricted.force().info('Info message in logger set to ERROR')
