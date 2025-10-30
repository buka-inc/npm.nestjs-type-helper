import { Property } from '@mikro-orm/core'


export function EntityTransient(): PropertyDecorator {
  return Property({ persist: false }) as PropertyDecorator
}

