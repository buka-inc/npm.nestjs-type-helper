import * as R from 'ramda'
import { applyDecorators } from '@nestjs/common'
import { ApiPropertyOptions } from '@nestjs/swagger'
import { Type as ClassType } from 'class-transformer'
import { IsNotEmpty, ValidateNested } from 'class-validator'
import { Nested, PropertyMetadata } from './model'
import { List } from './model/list.decorator'
import { Class } from 'type-fest'

interface NestedPropertiesOptions extends Pick<PropertyMetadata, 'relation' | 'optional' | 'schema'> {
  each?: boolean
}

export function NestedProperty(type: () => Class<object>, options: NestedPropertiesOptions = {}): PropertyDecorator {
  const decorators = [
    ValidateNested({ each: !!options.each }),
    ClassType(type),
  ]

  /**
   * 这里不能写成 ({ type: type })
   * 否则 swagger 会无法识别到正确的类型
   * 因为 @nestjs/swagger 中通过 `fn.name === 'type'` 来判断 type 是函数还是对象
   */
  const schema: ApiPropertyOptions = options.schema || { type: () => type() }
  const propertyMetadata = R.pick(['relation', 'optional'], options)

  if (options.each) {
    decorators.push(List({ type, schema, ...propertyMetadata }))
  } else {
    decorators.push(Nested({ type, schema, ...propertyMetadata }))
  }

  if (!options.optional) {
    decorators.push(...[
      // 如果不添加 IsNotEmpty，ValidateNested 在没有 IsOptional 的情况下也会允许 undefined 值通过验证
      // https://github.com/typestack/class-validator/issues/717
      IsNotEmpty({ each: options.each, message: '$property is required' }),
    ])
  }

  return applyDecorators(...decorators)
}
