import { EntityName, ManyToMany, ManyToManyOptions } from '@mikro-orm/core'
import { ApiEntityProperty } from './api-entity-property.decorator'

export function EntityManyToMany<T extends object, O>(
  entity?: ManyToManyOptions<T, O> | string | (() => EntityName<T>),
  mappedBy?: (string & keyof T) | ((e: T) => any),
  options?: Partial<ManyToManyOptions<T, O>>,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityManyToMany() can only be used on string property')

    ManyToMany(entity, mappedBy, options)(target, propertyKey)
    ApiEntityProperty()(target, propertyKey)
  }
}
