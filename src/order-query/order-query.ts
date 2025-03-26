import { Type } from '@nestjs/common'

import { IOrderProperties, IOrderQuery } from './types/order-query.js'
import { BaseOrderQuery } from './base-order-query.js'

import * as SwaggerUtils from '~/utils/nestjs-swagger-utils.js'
import { IsIn, IsOptional, ValidateNested } from 'class-validator'
import { Type as ClassType } from 'class-transformer'
import { ApiPropertyOptional } from '@nestjs/swagger'


function OrderPropertiesType<T>(classRef: Type<T>, rootRef: Type<any>): Type<IOrderProperties<T>> {
  const swaggerMetadata = SwaggerUtils.getMetadata(classRef)

  abstract class OrderPropertiesClass {}

  for (const propertyKey in swaggerMetadata) {
    const mpath = `$order[][${propertyKey}]`
    ApiPropertyOptional({
      name: mpath,
      required: false,
      type: 'string',
      enum: ['desc', 'asc'],
      enumName: 'QUERY_ORDER',
    })(rootRef.prototype, mpath)

    IsIn(['desc', 'asc'])(OrderPropertiesClass.prototype, propertyKey)
    IsOptional()(OrderPropertiesClass.prototype, propertyKey)
  }

  return OrderPropertiesClass as Type<IOrderProperties<T>>
}

export function OrderQueryType<T>(classRef: Type<T>): Type<IOrderQuery<T>> {
  abstract class OrderQueryClass extends BaseOrderQuery {}

  const OrderPropertiesClass = OrderPropertiesType(classRef, OrderQueryClass as Type<any>)

  ValidateNested({ each: true })(OrderQueryClass.prototype, '$order')
  ClassType(() => OrderPropertiesClass)(OrderQueryClass.prototype, '$order')
  IsOptional({ each: true })(OrderQueryClass.prototype, '$order')

  return OrderQueryClass as Type<IOrderQuery<T>>
}
