import { OneToMany, OneToManyOptions } from '@mikro-orm/core'
import { ApiEntityProperty } from './api-entity-property.decorator'

export function EntityOneToMany<Target, Owner>(options: OneToManyOptions<Owner, Target>): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityOneToMany() can only be used on string property')

    OneToMany(options)(target, propertyKey)
    ApiEntityProperty()(target, propertyKey)
  }
}
