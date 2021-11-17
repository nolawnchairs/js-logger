
import { resolve } from 'path'
import { createWriteStream, WriteStream } from 'fs'
import { assertFile } from './Util'
import { FormatProvider } from './Format'

type WriterInterface = WriteStream | NodeJS.WriteStream
type Provider = () => Promise<WriterInterface>

// Cached hashmap of the defined and active file streams
const fileStreams: Map<string, WriteStream> = new Map()

export interface WriterOptions {
  /**
   * The fomatter provider for this writer
   *
   * @type {FormatProvider}
   * @memberof WriterOptions
   */
  formatter?: FormatProvider
}

export type FileWriterOptions = WriterOptions & {
  /**
   * The CHMOD valid for the file on octal format. Defaults to 644 (0o644)
   *
   * @type {number}
   */
  mode?: number
  /**
   * The encoding. Defaluts to utf-8
   *
   * @type {BufferEncoding}
   */
  encoding?: BufferEncoding,
}

export class LogWriter {

  private _writer: WriterInterface
  private _formatter: FormatProvider

  constructor(
    private writerProvider: Provider,
    options: WriterOptions = {}) {
    this._formatter = options.formatter
  }

  /**
   * Creates a new LogWriter instance that prints to stdout
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stdout(options: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stdout), options)
  }

  /**
   * Creates a new LogWriter instance that prints to stderr
   *
   * @static
   * @param {WriterOptions} options
   * @return {*}  {LogWriter}
   * @memberof LogWriter
   */
  static stderr(options: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stderr), options)
  }

  /**
   * Creates a new LogWriter instance that dumpes to a file
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
