import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { BaseEntityReferenceDto } from '../base-entity-reference.dto'

export function BaseEntityReferenceProperty(): PropertyDecorator {
  return applyDecorators(
    ApiProperty({ type: BaseEntityReferenceDto }),
    Type(() => BaseEntityReferenceDto),
    ValidateNested(),
  )
}
