import { promises as fs } from 'fs'

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
