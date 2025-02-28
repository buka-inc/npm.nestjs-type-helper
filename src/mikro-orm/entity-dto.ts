import { MetadataStorage, Collection, Ref } from '@mikro-orm/core'
import { getApiProperties, setApiProperties } from '~/utils/api-property-decorator-utils.js'
import { Type } from '@nestjs/common'
import { copyTransformMetadata } from '~/utils/transform-decorator-utils.js'
import { copyTypeMetadata } from '~/utils/type-decorator-utils.js'
import { BaseEntity } from './base-entity'
import { BaseEntityReferenceDto } from './base-entity-reference.dto'
import { ExcludeOpt } from '~/types/exclude-opt'

export type EntityPropertyDto<T> = T extends BaseEntity ? BaseEntityReferenceDto : T


export type IEntityDto<T> = {
  [key in keyof T]: T[key] extends Collection<infer U>
    ? EntityPropertyDto<U>[]
    : T[key] extends Ref<infer U>
      ? EntityPropertyDto<U>
      : ExcludeOpt<T[key]>
}

function build(targetRef: Type<any>, parentRef: Type<any>): void {
  const meta = MetadataStorage.getMetadataFromDecorator(parentRef)
  console.log('MetadataStorage.getMetadataFromDecorator(parentRef): ', meta)

  const classSchema = getApiProperties(parentRef as any)

  setApiProperties(targetRef, classSchema)

  for (const prop in classSchema) {
    copyTransformMetadata(parentRef as any, targetRef, prop)
    copyTypeMetadata(parentRef as any, targetRef, prop)

    // MetadataStorage.getMetadataFromDecorator()
  }
}

export function EntityDto<T>(entity: Type<T>): Type<IEntityDto<T>> {
  abstract class EntityDto {}
  build(EntityDto as any, entity)

  return EntityDto as Type<IEntityDto<T>>
}
