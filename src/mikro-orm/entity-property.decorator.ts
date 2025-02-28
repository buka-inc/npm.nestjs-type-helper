import { Property, PropertyOptions } from '@mikro-orm/core'
import { ApiPropertyOptions } from '@nestjs/swagger'
import { ApiEntityProperty } from './api-entity-property.decorator'
import { ColumnTypeRequired } from './column-type-required'


export function EntityProperty<T extends object>(
  options?: PropertyOptions<T> & Pick<ApiPropertyOptions, 'example'> & ColumnTypeRequired<T>,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityProperty() can only be used on string property')

    Property(options)(target, propertyKey)
    ApiEntityProperty({ example: options?.example })(target, propertyKey)
  }
}
