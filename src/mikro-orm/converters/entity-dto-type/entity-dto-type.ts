import * as R from 'ramda'
import { Type } from '@nestjs/common'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import * as ApiPropertyUtils from '~/utils/nestjs-swagger-utils'
import { IEntityDto } from './types/entity-dto'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'
import { ModelRegister } from '~/decorators'
import { wrap } from '@mikro-orm/core'
import { Class } from 'type-fest'


export type IEntityDtoClass<T> = Class<IEntityDto<T>> & {
  from(entity: T): IEntityDto<T>
}

export function EntityDtoType<T extends object>(entity: Class<T>): IEntityDtoClass<T> {
  const properties = MikroOrmUtils.getMetadata(entity)

  if (!properties.length) {
    throw new Error(`Cannot create EntityDtoType for ${entity.name} because it isn't an MikroORM Entity.`)
  }

  // const keys = R.pluck('name', properties.filter((prop) => !prop.hidden))
  const keys = properties
    .filter((prop) => {
      if (prop.hidden) return false
      if (prop.kind === 'scalar' && prop.ref) return false
      return true
    })
    .map((prop) => prop.name)

  class EntityDtoTypeClass {
    static from(entity: T): EntityDtoTypeClass {
      const dto = new EntityDtoTypeClass()
      const json = wrap(entity).toPOJO()

      for (const property of properties) {
        if (property.hidden) continue
        if (property.kind === 'scalar' && !property.ref) {
          dto[property.name as any] = json[property.name as any]
        }
        if (property.kind === 'm:n' || property.kind === '1:m') {
          // array
          dto[property.name as any] = json[property.name as any]
        }

        if ((property.kind === '1:1' || property.kind === 'm:1')) {
          dto[property.name as any] = json[property.name as any]
        }
      }

      return dto
    }
  }

  inheritValidationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key as any))
  inheritTransformationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key as any))

  ApiPropertyUtils.cloneMetadata(EntityDtoTypeClass, entity, keys)

  for (const property of keys) {
    ModelRegister.copyProperty(entity, EntityDtoTypeClass, property)
  }

  return EntityDtoTypeClass as unknown as IEntityDtoClass<T>
}
