import { Type } from '@nestjs/common'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import * as ApiPropertyUtils from '~/utils/nestjs-swagger-utils'
import { IEntityDto } from './types/entity-dto'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'


export function EntityDtoType<T>(entity: Type<T>): Type<IEntityDto<T>> {
  const properties = MikroOrmUtils.getMetadata(entity)
  if (!properties.length) {
    throw new Error(`Cannot create EntityDtoType for ${entity.name} because it isn't an MikroORM Entity.`)
  }

  const keys = properties
    .filter((prop) => prop.hidden !== true)
    .map((prop) => prop.name)


  abstract class EntityDtoTypeClass {}

  inheritValidationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key as any))
  inheritTransformationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key as any))

  ApiPropertyUtils.cloneMetadata(EntityDtoTypeClass, entity, keys)

  return EntityDtoTypeClass as Type<IEntityDto<T>>
}
