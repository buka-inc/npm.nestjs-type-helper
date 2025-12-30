import { TypeException } from '~/exceptions'
import { ModelRegister } from './model.register'
import { Class } from 'type-fest'
import { RelationMetadata } from './relation.decorator'
import { IsOptional } from 'class-validator'
import { ApiPropertyOptions, ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'


export type PropertyKind = 'nested' | 'dictionary' | 'list'

export interface PropertyMetadata {
  kind?: PropertyKind
  optional?: boolean
  type: () => Function
  relation?: RelationMetadata
  schema?: ApiPropertyOptions
}


export function Property(options?: Partial<PropertyMetadata>): PropertyDecorator {
  return (target: object, propertyKey: string | symbol) => {
    if (!('constructor' in target)) {
      throw new TypeException('@Property decorator can only be applied to class properties.')
    }

    if (options?.optional) {
      IsOptional()(target, propertyKey)
    }

    if (options?.schema) {
      if (options?.optional) {
        ApiPropertyOptional(options.schema)(target, propertyKey)
      } else {
        ApiProperty(options.schema)(target, propertyKey)
      }
    }

    ModelRegister.addProperty(target.constructor as Class<any>, propertyKey, options)
  }
}
