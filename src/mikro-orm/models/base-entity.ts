import { BigIntType, Config, DefineConfig, PrimaryKey, PrimaryKeyProp } from '@mikro-orm/core'
import { ApiProperty } from '@nestjs/swagger'
import { IsNumberString } from 'class-validator'
import { TimestampedEntity } from './timestamped-entity.js'


export abstract class BaseEntity<Optional = never> extends TimestampedEntity<Optional> {
  // [Config]?: DefineConfig<{ forceObject: true }>;
  [PrimaryKeyProp]?: 'id'

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
}
