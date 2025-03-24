import { ApiHideProperty, ApiProperty, getSchemaPath } from '@nestjs/swagger'
import { EntityName, EntityProperty, MetadataStorage, ReferenceKind } from '@mikro-orm/core'
import { isSubclassOf } from '~/utils/is-subclass-of'
import { BaseEntityReferenceDto } from '../base-entity-reference.dto'
import { ApiScalarEntityProperty } from './api-scalar-entity-property.decorator'
import { BaseEntity } from '../base-entity'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'

interface ApiEntityPropertyOptions {
  example?: any
  enumName?: string
}

export function ApiEntityProperty<T extends object>(options?: ApiEntityPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    const meta = MetadataStorage.getMetadataFromDecorator(target.constructor as T)
    const prop = meta.properties[propertyKey] as EntityProperty<T> | undefined
    if (!prop) return

    if (prop.hidden === true) {
      ApiHideProperty()(target, propertyKey)
      return
    }

    if (prop.kind === ReferenceKind.EMBEDDED) {
      return
    }

    if (prop.kind === ReferenceKind.SCALAR) {
      ApiScalarEntityProperty({
        meta: prop,
        validate: true,
        schema: options,
      })(target, propertyKey)
      return
    }

    const getEntity = (): EntityName<any> | undefined => {
      const ent = prop.entity()
      if (prop.eager === true) return ent
      if (typeof ent === 'function' && isSubclassOf(ent, BaseEntity)) {
        return BaseEntityReferenceDto
      }
    }

    if (prop.kind === ReferenceKind.ONE_TO_ONE || prop.kind === ReferenceKind.MANY_TO_ONE) {
      Type(() => getEntity() as any || Object)(target, propertyKey)
      ValidateNested()(target, propertyKey)
      ApiProperty({
        description: prop.comment,
        required: !prop.nullable,
        type: () => getEntity() || 'object',
      })(target, propertyKey)

      return
    }

    if (prop.kind === ReferenceKind.ONE_TO_MANY || prop.kind === ReferenceKind.MANY_TO_MANY) {
      Type(() => getEntity() as any || Object)(target, propertyKey)
      ValidateNested({ each: true })(target, propertyKey)
      ApiProperty({
        type: 'array',
        items: {
          type: getSchemaPath(() => getEntity() || 'object'),
        },
      })(target, propertyKey)
      return
    }
  }
}

