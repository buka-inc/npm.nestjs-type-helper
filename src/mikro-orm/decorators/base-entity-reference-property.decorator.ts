import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type } from 'class-transformer'
import { IsOptional, ValidateNested } from 'class-validator'
import { BaseEntityReferenceDto } from '../base-entity-reference.dto'


export interface BaseEntityReferencePropertyOptions {
  optional?: boolean
  each?: boolean
}

export function BaseEntityReferenceProperty(options?: BaseEntityReferencePropertyOptions): PropertyDecorator {
  const decorators = [
    ApiProperty({ type: BaseEntityReferenceDto, required: !options?.optional, isArray: options?.each }),
    Type(() => BaseEntityReferenceDto),
    ValidateNested({ each: options?.each }),
  ]

  if (options?.optional) {
    decorators.push(IsOptional())
  }

  return applyDecorators()
}
