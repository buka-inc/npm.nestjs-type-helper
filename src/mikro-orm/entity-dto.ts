import { EntityProperty, MetadataStorage } from '@mikro-orm/core'
import { Type } from '@nestjs/common'
import { BaseEntity } from './base-entity'
import { BaseEntityReferenceDto } from './base-entity-reference.dto'
import { inheritPropertyInitializers, inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'
import { EntityDTO as OrmDto } from '@mikro-orm/core'

export type EntityPropertyDto<T> = T extends BaseEntity ? BaseEntityReferenceDto : T


export function EntityDto<T>(entity: Type<T>): Type<OrmDto<T>> {
  const meta = MetadataStorage.getMetadataFromDecorator(entity)

  const isInheritedPredicate = (propertyKey: string): boolean => {
    const prop = meta.properties[propertyKey] as EntityProperty<T>
    return prop.hidden !== true
  }

  abstract class EntityDto {
    constructor() {
      inheritPropertyInitializers(this, entity, isInheritedPredicate)
    }
  }

  inheritValidationMetadata(entity, EntityDto, isInheritedPredicate)
  inheritTransformationMetadata(entity, EntityDto, isInheritedPredicate)

  return EntityDto as Type<OrmDto<T>>
}
