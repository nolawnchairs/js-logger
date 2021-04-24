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
