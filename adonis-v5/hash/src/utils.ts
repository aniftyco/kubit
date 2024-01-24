import { randomBytes } from 'crypto'

export const kMaxUint24 = 16777215 // 2**24 - 1
export const kMaxUint31 = 2147483647 // 2**31 - 1

export function randomBytesAsync(size: number): Promise<Buffer> {
  if (size < 0 || size > kMaxUint31) {
    return Promise.reject(
      new TypeError(`The 'length' parameter must be in the range (0 <= length <= ${kMaxUint31})`)
    )
  }

  return new Promise((resolve, reject) => {
    randomBytes(size, (error, buffer) => {
      if (error) {
        reject(error)
      } else {
        resolve(buffer)
      }
    })
  })
}
