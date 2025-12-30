import { EntityName, OneToOne as OrmOneToOne, OneToOneOptions } from '@mikro-orm/core'
import { ApiEntityProperty } from './api-entity-property.decorator'


export function EntityOneToOne<Target, Owner>(
  entity?: OneToOneOptions<Owner, Target> | string | ((e: Owner) => EntityName<Target>),
  mappedByOrOptions?: (string & keyof Target) | ((e: Target) => any) | Partial<OneToOneOptions<Owner, Target>>,
  options?: Partial<OneToOneOptions<Owner, Target>>,
): PropertyDecorator {
  return (target, propertyKey) => {
    if (typeof propertyKey !== 'string') throw new TypeError('@EntityOneToOne() can only be used on string property')

    OrmOneToOne(entity, mappedByOrOptions, options)(target, propertyKey)
    ApiEntityProperty()(target, propertyKey)
  }
}
