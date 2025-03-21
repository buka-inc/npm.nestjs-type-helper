import * as R from 'ramda'
import { Collection, EntityMetadata, Hidden, MetadataStorage, Primary, PrimaryProperty, Ref, Scalar } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import { ExcludeOpt } from '~/types/exclude-opt'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import * as ApiPropertyUtils from '~/utils/nestjs-swagger-utils'


export type IEntityRefPropertyDto<T> = T extends Scalar
  ? T
  : T extends object
    ? { [K in keyof T as K extends PrimaryProperty<T> ? K : never]: Primary<T> }
    : T


export type IEntityPropertyDto<T> = T extends Ref<infer U>
  ? IEntityRefPropertyDto<U>
  : T extends Collection<infer U>
    ? IEntityRefPropertyDto<U>[]
    : T

export type IEntityDto<T> = {
  [K in keyof T as T[K] extends (Hidden | symbol) ? never : K]: IEntityPropertyDto<ExcludeOpt<T[K]>>
}


export function EntityDto<T>(entity: Type<T>): Type<IEntityDto<T>> {
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
