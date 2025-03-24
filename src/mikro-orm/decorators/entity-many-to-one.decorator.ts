import { EntityName, ManyToOne, ManyToOneOptions } from '@mikro-orm/core'
import { ApiEntityProperty } from './api-entity-property.decorator'


export function EntityManyToOne<T extends object, O>(
  entity?: ManyToOneOptions<T, O> | string | ((e?: any) => EntityName<T>),
  options?: Partial<ManyToOneOptions<T, O>>,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityManyToOne() can only be used on string property')

    ManyToOne(entity, options)(target, propertyKey)
    ApiEntityProperty()(target, propertyKey)
  }
}
