import { Collection, EntityMetadata, EntityProperty, EntityRef, Hidden, MetadataStorage, Ref } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import { inheritPropertyInitializers, inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import { ExcludeOpt } from '~/types/exclude-opt'


export type IEntityRefPropertyDto<T> = T extends object ? EntityRef<T> | T : T
export type IEntityPropertyDto<T> = T extends Ref<infer U>
  ? IEntityRefPropertyDto<U>
  : T extends Collection<infer U>
    ? IEntityRefPropertyDto<U>[]
    : T

export type IEntityDto<T> = {
  [K in keyof T]: T[K] extends (Hidden | symbol)
    ? never
    : IEntityPropertyDto<ExcludeOpt<T[K]>>
}


export function EntityDto<T>(entity: Type<T>): Type<IEntityDto<T>> {
  const metadatas: EntityMetadata<any>[] = []

  let parent: any = entity
  do {
    const meta = MetadataStorage.getMetadataFromDecorator(parent)
    if (meta) metadatas.push(meta)
    parent = Object.getPrototypeOf(parent)
  } while (parent && parent !== Object)

  function getMetadata(propertyKey: string): EntityProperty<T> | undefined {
    for (const meta of metadatas) {
      const prop = meta.properties[propertyKey] as EntityProperty<T> | undefined
      if (prop) return prop
    }
  }

  const isInheritedPredicate = (propertyKey: string): boolean => {
    const prop = getMetadata(propertyKey)
    if (!prop) return false
    return prop.hidden !== true
  }

  abstract class EntityDto {
    constructor() {
      inheritPropertyInitializers(this, entity, isInheritedPredicate)
    }
  }

  inheritValidationMetadata(entity, EntityDto, isInheritedPredicate)
  inheritTransformationMetadata(entity, EntityDto, isInheritedPredicate)

  return EntityDto as Type<IEntityDto<T>>
}
