import { Config, DefineConfig, OptionalProps } from '@mikro-orm/core'
import { EntityProperty } from '../decorators/entity-property.decorator'


export abstract class TimestampedEntity<Optional = never> {
  [Config]?: DefineConfig<{ forceObject: true }>;
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional

  @EntityProperty({
    type: 'datetime',
    onCreate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '创建时间',
  })
  createdAt: Date = new Date()

  @EntityProperty({
    type: 'datetime',
    onUpdate: () => new Date(),
    defaultRaw: 'CURRENT_TIMESTAMP',
    comment: '更新时间',
  })
  updatedAt: Date = new Date()
}
