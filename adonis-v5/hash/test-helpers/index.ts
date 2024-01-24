import { Scrypt } from '../src/Drivers/Scrypt'
import type { ScryptConfig } from '@ioc:Adonis/Core/Hash'

export function scryptFactory(options?: Partial<ScryptConfig>): Scrypt {
  return new Scrypt({
    driver: 'scrypt',
    cost: 2048,
    blockSize: 8,
    parallelization: 1,
    saltSize: 16,
    maxMemory: 32 * 1024 * 1024,
    keyLength: 64,
    ...options,
  })
}
