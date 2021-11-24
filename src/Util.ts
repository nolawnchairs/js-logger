import { promises as fs } from 'fs'
import { LogLevel } from '.'

export function computeLevel(level: LogLevel | number): number {
  if (!level)
    return null
  if ((Math.log(level) / Math.log(2)) % 1) { // Masked level
    return level
  } else { // single level, so assign all higher levels
    return Object.values(LogLevel)
      .filter(l => l >= level)
      .reduce((a, c) => a |= Number(c), 0)
  }
}

export async function assertFile(path: string) {
  try {
    await fs.access(path)
  } catch {
    try {
      await fs.writeFile(path, '')
    } catch {
      throw new Error(`Could not create file: ${path}`)
    }
  }
}

export function mergeOptions<T = {}>(a: T, b: T): T {
  let merged = { ...a }

  for (const key in b) {
    if (merged[key] === undefined || merged[key] === null)
      merged[key] = b[key]
  }
  return merged
}

export const ANSI_PATTERN = new RegExp([
  '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
  '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))',
].join('|'), 'g')
