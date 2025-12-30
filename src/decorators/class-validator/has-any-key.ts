import { registerDecorator, ValidationOptions } from 'class-validator'


export const HAS_ANY_KEY = 'hasAnyKey'

export function HasAnyKey(keys: readonly string[], validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: HAS_ANY_KEY,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [keys],
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'object' || value === null) return false
          for (const key of keys) {
            if (key in value) return true
          }
          return false
        },
        defaultMessage() {
          return `$property must have at least one of the keys: ${keys.join(', ')}`
        },
      },
    })
  }
}
