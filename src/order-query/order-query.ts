import { Type } from '@nestjs/common'
import * as swagger from '@nestjs/swagger'
import * as transformer from 'class-transformer'
import * as validator from 'class-validator'

import { getMetadata } from '~/utils/nestjs-swagger-utils.js'
import { IOrderQuery } from './types/order-query.js'
import { BaseOrderQuery } from './base-order-query.js'


function buildClass(targetRef: Type<any>, parentRef: Type<any>): void {
  const classSchema = getMetadata(parentRef)

  abstract class OrderClass {}

  validator.ValidateNested({ each: true })(targetRef.prototype, '$order')
  transformer.Type(() => OrderClass)(targetRef.prototype, '$order')
  validator.IsOptional()(targetRef.prototype, '$order')

  for (const prop in classSchema) {
    swagger.ApiPropertyOptional({ name: `$order[${prop}]`, type: 'string', enum: ['desc', 'asc'] })(targetRef.prototype, `$order[${prop}]`)

    validator.IsIn(['desc', 'asc'])(OrderClass.prototype, prop)
    validator.IsOptional()(OrderClass.prototype, prop)
  }
}

export function OrderQueryType<T>(classRef: Type<T>): Type<IOrderQuery<T>> {
  abstract class OrderQueryClass extends BaseOrderQuery {}

  buildClass(OrderQueryClass as any, classRef)
  return OrderQueryClass as Type<IOrderQuery<T>>
}
