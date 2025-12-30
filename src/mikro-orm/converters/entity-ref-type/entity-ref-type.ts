
import { IEntityRef } from './types/index.js'
import * as SwaggerUtils from '~/utils/nestjs-swagger-utils'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import { Class } from 'type-fest'


export const EntityRefTypeClassMetadataPropertyKey = Symbol('EntityRefTypeClassMetadataPropertyKey')

const storage = new WeakMap<Class<object>, Class<IEntityRef<any>>>()

export function EntityRefType<T extends object>(classRef: Class<T>): Class<IEntityRef<T>> {
  if (storage.has(classRef)) {
    return storage.get(classRef)!
  }

  const properties = MikroOrmUtils.getMetadata(classRef)

  const primaryProperties: string[] = properties.filter((prop) => prop.primary)
    .map((prop) => prop.name)

  if (!primaryProperties.length) {
    throw new Error(`Cannot create EntityRefType for ${classRef.name} because it has no primary properties.`)
  }

  class EntityRefTypeClass {}

  EntityRefTypeClass[EntityRefTypeClassMetadataPropertyKey] = {}

  SwaggerUtils.cloneMetadata(EntityRefTypeClass, classRef, primaryProperties)
  inheritValidationMetadata(classRef, EntityRefTypeClass, (key) => primaryProperties.includes(key))
  inheritTransformationMetadata(classRef, EntityRefTypeClass, (key) => primaryProperties.includes(key))

  storage.set(classRef, EntityRefTypeClass as Class<IEntityRef<T>>)
  return EntityRefTypeClass as Class<IEntityRef<T>>
}
