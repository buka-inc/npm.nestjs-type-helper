import { ApiHideProperty, getSchemaPath } from '@nestjs/swagger'
import { EntityProperty, MetadataStorage, ReferenceKind } from '@mikro-orm/core'
import { ApiScalarEntityProperty } from './api-scalar-entity-property.decorator'
import { EntityRefType } from '../converters/entity-ref-type/entity-ref-type'
import { NestedProperty, Property, Relation } from '~/decorators'
import { Type } from '@nestjs/common'


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
        schema: options,
      })(target, propertyKey)
      return
    }

    const getType = (): Type => {
      const ent = prop.entity()
      if (prop.eager === true) return ent as Type

      if (typeof ent === 'function') {
        return EntityRefType(ent as any)
      }

      return Object
    }

    if (prop.kind === ReferenceKind.ONE_TO_ONE || prop.kind === ReferenceKind.MANY_TO_ONE) {
      Property({
        type: () => getType(),
        relation: {
          kind: prop.kind,
          type: () => getType(),
        },
        schema: {
          description: prop.comment,
          required: !prop.nullable,
        },
      })(target, propertyKey)

      return
    }

    if (prop.kind === ReferenceKind.ONE_TO_MANY || prop.kind === ReferenceKind.MANY_TO_MANY) {
      NestedProperty(
        () => getType(),
        {
          each: true,
          optional: prop.nullable,
          schema: {
            description: prop.comment,
            type: 'array',
            items: {
              type: getSchemaPath(() => getType()),
            },
          },
        },
      )(target, propertyKey)

      Relation({
        kind: prop.kind,
        type: () => getType(),
      })(target, propertyKey)
      return
    }
  }
}

