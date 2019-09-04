# Simple Logger

A simple Javascript logger. This is a private project that I use for my node projects, use at will, no guarantees, except that it does work.

### Install
`npm i @nolawnchairs/logger`

### Usage

```
import logger from '@nolawnchairs/logger'

const Log = logger('application-name', 'info')

Log.info('this is a test log for INFO level')
Log.error('this is an ERROR level logging')
```

### Format

Logging format is not customizable. Format is as follows:
`[iso timestamp] [pid] [level?] [appName] [message]`

### API
`logger(appName: string, level: Level, options?: Options)`

**`appName`** string - the name that will appear
**`level`** string - the level to record. One of `debug`, `info`, `warn` or `error`. Debug is the most verbose
**`options`** Options

#### Options
`printLevel` - one of `full` or `initial`. Dictates if the level is printed or not, 
`full`:  for `DEBUG`, `INFO`,`WARN` or `ERROR`
`initial`:  for `D`, `I`,`W` or `E`

### License
Whatever, this is really just a private project. Use it however you like
	 