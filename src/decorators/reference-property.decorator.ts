import { applyDecorators } from '@nestjs/common'
import { Allow } from 'class-validator'
import { EntityRefType } from '~/mikro-orm'
import { Class } from 'type-fest'
import { NestedProperty } from './nested-property.decorator'

export const ReferencePropertiesMetadataKey = 'buka:reference-properties'


/**
 *
 * @param entity MikroORM Entity
 */
export function ReferenceProperty(entity: () => Class<object>): PropertyDecorator {
  return applyDecorators(
    Allow(),
    NestedProperty(() => EntityRefType(entity()),
      {
        relation: {
          kind: '1:1',
          type: () => entity(),
        },
      },
    ),
  )
}
