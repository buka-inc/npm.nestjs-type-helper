/* eslint-disable @typescript-eslint/no-unsafe-return */
import { Class } from 'type-fest'
import { IOrderQuery } from './types'
import { getOrderQuerySchema } from './get-order-query-schema'
import { Property, MatchJsonSchema } from '~/decorators'

export function OrderQueryType<T>(classRef: Class<T>): Class<IOrderQuery<T>> {
  const schema = getOrderQuerySchema(classRef)

  class OrderQueryClass {
    orderBy!: ''
  }

  Property({ optional: true, schema })(OrderQueryClass.prototype, 'orderBy')

  MatchJsonSchema(schema, { message: 'Invalid order query' })(OrderQueryClass.prototype, 'orderBy')

  return OrderQueryClass as any
}
