import { BigIntType, Config, DefineConfig, OptionalProps, PrimaryKey, PrimaryKeyProp } from '@mikro-orm/core'
// import { ApiProperty } from '@nestjs/swagger'
import { EntityProperty } from './decorators/entity-property.decorator.js'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from 'class-validator'


export abstract class BaseEntity<Optional = never> {
  [Config]?: DefineConfig<{ forceObject: true }>;
  [PrimaryKeyProp]?: 'id'
  [OptionalProps]?: 'createdAt' | 'updatedAt' | Optional

  @ApiProperty({
    type: 'string',
    description: 'PK',
    example: '1',
    required: true,
  })
  @PrimaryKey({
    type: new BigIntType('string'),
    comment: '主键',
  })
  @IsNumberString()
  id!: string

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
