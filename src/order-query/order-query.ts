import { Type } from '@nestjs/common'
import * as swagger from '@nestjs/swagger'
import { getApiProperties } from '~/utils/api-property-decorator-utils.js'
import * as transformer from 'class-transformer'
import * as validator from 'class-validator'


type IOrderQuery<T> = {
  $order?: {
    [K in keyof T]?: 'desc' | 'asc'
  }[]
}


function buildClass(targetRef: Type<any>, parentRef: Type<any>): void {
  const classSchema = getApiProperties(parentRef)

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

export function OrderQuery<T>(classRef: Type<T>): Type<IOrderQuery<T>> {
  abstract class OrderQueryClass {}

  buildClass(OrderQueryClass as any, classRef)
  return OrderQueryClass as Type<IOrderQuery<T>>
}
