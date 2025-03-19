import * as R from 'ramda'
import { Collection, EntityMetadata, EntityRef, Hidden, MetadataStorage, Ref } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import { ExcludeOpt } from '~/types/exclude-opt'
import { PickType } from '@nestjs/swagger'


export type IEntityRefPropertyDto<T> = T extends object ? EntityRef<T> | T : T
export type IEntityPropertyDto<T> = T extends Ref<infer U>
  ? IEntityRefPropertyDto<U>
  : T extends Collection<infer U>
    ? IEntityRefPropertyDto<U>[]
    : T

export type IEntityDto<T> = {
  [K in keyof T as T[K] extends (Hidden | symbol) ? never : K]: T[K] extends (Hidden | symbol)
    ? never
    : IEntityPropertyDto<ExcludeOpt<T[K]>>
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
  ) as (keyof T)[]

  return PickType(entity, keys) as unknown as Type<IEntityDto<T>>
}
