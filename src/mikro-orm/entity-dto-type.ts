import * as R from 'ramda'
import { EntityMetadata, MetadataStorage } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import * as ApiPropertyUtils from '~/utils/nestjs-swagger-utils'
import { IEntityDto } from './types/entity-dto'


export function EntityDtoType<T>(entity: Type<T>): Type<IEntityDto<T>> {
  const metadatas: EntityMetadata<any>[] = []

  let parent: any = entity
  do {
    const meta = MetadataStorage.getMetadataFromDecorator(parent)
    if (meta instanceof EntityMetadata) metadatas.push(meta)
    parent = Object.getPrototypeOf(parent)
  } while (parent && parent !== Object.prototype)

  const keys = R.uniq(
    R.unnest(
      metadatas
        .map((meta) => {
          const keys = Object.entries(meta.properties)
            .filter(([, prop]) => prop.hidden !== true)
            .map(([key]) => key)

          return keys
        }),
    ),
  )


  abstract class EntityDtoTypeClass {}

  inheritValidationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key))
  inheritTransformationMetadata(entity, EntityDtoTypeClass, (key) => keys.includes(key))

  ApiPropertyUtils.cloneMetadata(EntityDtoTypeClass, entity, keys)

  return EntityDtoTypeClass as Type<IEntityDto<T>>
}
