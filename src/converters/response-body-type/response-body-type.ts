import { Class } from 'type-fest'
import { IResponseBody } from './types/index.js'
import { Property } from '~/decorators/index.js'


type IResponseBodyClass<T> = Class<IResponseBody<T>> & {
  from(data: T): IResponseBody<T>
}


export function ResponseBodyType<T>(classRef: Class<T>): IResponseBodyClass<T> {
  class ResponseBodyClass {
    constructor(public data: T) {}

    static from(data: T, meta: Record<string, any>): ResponseBodyClass {
      const instance = new ResponseBodyClass(data)
      return instance
    }
  }

  Property({
    type: () => classRef,
    schema: {
      type: () => classRef,
    },
  })(ResponseBodyClass.prototype, 'data')

  Property({
    type: () => Object,
    schema: {
      additionalProperties: true,
    },
  })

  return ResponseBodyClass as IResponseBodyClass<T>
}
