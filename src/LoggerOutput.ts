import { createWriteStream, WriteStream } from 'fs'

import { resolve } from 'path'
import { assertFile } from './Util'

type WriterInterface = WriteStream | NodeJS.WriteStream
type Provider = () => Promise<WriterInterface>

export class LogWriter {

  private writer: WriterInterface

  constructor(private writerProvider: Provider) { }

  static stdout(): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stdout))
  }

  static stderr(): LogWriter {
    return new LogWriter(() => Promise.resolve(process.stderr))
  }

  static file(filePath: string, mode = 644): LogWriter {
    return new LogWriter(async () => {
      const file = resolve(filePath)
      try {
        await assertFile(file)
        return createWriteStream(file, { mode, encoding: 'utf-8', flags: 'a' })
      } catch (e) {
        throw new Error(`Could not create log file: ${file} (${e.message})`)
      }
    })
  }

  async write(value: string) {
    if (!this.writer)
      this.writer = await this.writerProvider()
    this.writer.write(value, err => { })
  }
}
