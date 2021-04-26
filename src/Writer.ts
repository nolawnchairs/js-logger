
import { resolve } from 'path'
import { createWriteStream, WriteStream } from 'fs'
import { assertFile } from './Util'
import { FormatProvider } from './Format'

type WriterInterface = WriteStream | NodeJS.WriteStream
type Provider = () => Promise<WriterInterface>

const fileStreams: Map<string, WriteStream> = new Map()

export interface WriterOptions {
  formatter?: FormatProvider
}

export type FileWriterOptions = WriterOptions & {
  mode?: number
  encoding?: BufferEncoding
}

export class LogWriter {

  private _writer: WriterInterface

  constructor(private writerProvider: Provider, private options?: WriterOptions) { }

  static stdout(options: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stdout), options)
  }

  static stderr(options: WriterOptions): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stderr), options)
  }

  static file(filePath: string, options?: FileWriterOptions): LogWriter {
    return new LogWriter(async () => {
      const file = resolve(filePath)
      try {
        await assertFile(file)
        if (fileStreams.has(file))
          return fileStreams.get(file)
        const { mode = 644, encoding } = options ?? {}
        const stream = createWriteStream(file, { mode, encoding, flags: 'a' })
        fileStreams.set(file, stream)
        return stream
      } catch (e) {
        throw new Error(`Could not create log file: ${file} (${e.message})`)
      }
    }, options)
  }

  get formatter() {
    return this.options?.formatter
  }

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
