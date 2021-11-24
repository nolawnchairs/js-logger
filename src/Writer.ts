
import { resolve } from 'path'
import { createWriteStream, WriteStream } from 'fs'
import { assertFile, computeLevel } from './Util'
import { FormatProvider } from './Format'
import { LogLevel } from './LogLevel'

type WriterInterface = WriteStream | NodeJS.WriteStream
type Provider = () => Promise<WriterInterface>

// Cached hashmap of the defined and active file streams
const fileStreams: Map<string, WriteStream> = new Map()

export interface WriterOptions {
  /**
   * The formatter provider for this writer
   *
   * @type {FormatProvider}
   * @memberof WriterOptions
   */
  formatter?: FormatProvider
  /**
   * The logging level or bitmask specific to this writer. Note that if a level
   * is provided to the parent logger, its log level constraints will apply to
   * the writer as well.
   *
   * @type {(LogLevel | number)}
   * @memberof WriterOptions
   */
  level?: LogLevel | number
}

export type FileWriterOptions = WriterOptions & {
  /**
   * The CHMOD valid for the file on octal format. Defaults to 644 (0o644)
   *
   * @type {number}
   */
  mode?: number
  /**
   * The encoding. Defaults to utf-8
   *
   * @type {BufferEncoding}
   */
  encoding?: BufferEncoding,
}

export class LogWriter {

  private _writer: WriterInterface
  private _formatter: FormatProvider
  private _level: number

  constructor(private writerProvider: Provider, options: WriterOptions = {}) {
    this._formatter = options.formatter
    this._level = computeLevel(options.level)
  }

  isLevelEnabled(level: LogLevel): boolean {
    return !this._level || !!(this._level & level)
  }

  /**
   * Creates a new LogWriter instance that prints to stdout
   *
   * @static
   * @param {WriterOptions} [options]
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stdout(options?: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stdout), options)
  }

  /**
   * Creates a new LogWriter instance that prints to stderr
   *
   * @static
   * @param {WriterOptions} [options]
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stderr(options?: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stderr), options)
  }

  /**
   * Creates a new LogWriter instance that dumps to a file
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static file(filePath: string, options?: FileWriterOptions): LogWriter {
    return new LogWriter(async () => {
      const file = resolve(filePath)
      try {
        await assertFile(file)
        if (fileStreams.has(file))
          return fileStreams.get(file)
        const { mode = 0o644, encoding } = options ?? {}
        const stream = createWriteStream(file, { mode, encoding, flags: 'a' })
        fileStreams.set(file, stream)
        return stream
      } catch (e) {
        throw new Error(`Could not create log file: ${file} (${e.message})`)
      }
    }, options)
  }

  get formatter() {
    return this._formatter
  }

  /**
   * Sets the formatter for this writer
   *
   * @param {FormatProvider} formatter
   * @memberof LogWriter
   */
  setFormatter(formatter: FormatProvider) {
    this._formatter = formatter
  }

  /**
   * Writes the output to the writable stream
   *
   * @param {string} value
   * @memberof LogWriter
   */
  async write(value: string) {
    if (!this._writer)
      this._writer = await this.writerProvider()
    this._writer.write(value, err => {
      if (err) {
        console.error(`Could not write log message: ${value}`)
        console.error(err)
      }
    })
  }
}
