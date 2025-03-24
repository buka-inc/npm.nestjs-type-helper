import { AnyEntity, Enum, EnumOptions } from '@mikro-orm/core'
import { ColumnTypeRequired } from '../types/column-type-required'
import { ApiEntityProperty } from './api-entity-property.decorator'


export function EntityEnum<T extends object>(
  options: EnumOptions<AnyEntity> & ColumnTypeRequired<T> & {
    example?: any
    enumName?: string
  },
): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityEnum() can only be used on string property')

    Enum<T>(options)(target, propertyKey)
    ApiEntityProperty({ example: options.example, enumName: options.enumName })(target, propertyKey)
  }
}
