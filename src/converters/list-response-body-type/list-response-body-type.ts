import { Type } from '@nestjs/common'
import { Class } from 'type-fest'
import { IListResponseBody } from './types/list-response-body'
import { NestedProperty } from '~/decorators'
import { CursorPaginationRo, OffsetPaginationRo } from '~/ro'
import { Slice } from '~/models'


type IListResponseBodyClass<T extends object, MODE extends 'offset' | 'cursor'> = Class<IListResponseBody<T, MODE>> & {
  fromSlice(slice: Slice<T>): IListResponseBody<T, MODE>
}

export function ListResponseBodyType<T extends object, MODE extends 'offset' | 'cursor' = 'offset' | 'cursor'>(classRef: Type<T>, mode?: MODE): IListResponseBodyClass<T, MODE> {
  class ResponseBodyMeta {
    pagination
  }

  if (mode === 'cursor') {
    NestedProperty(() => CursorPaginationRo)(ResponseBodyMeta.prototype, 'pagination')
  } else if (mode === 'offset') {
    NestedProperty(() => OffsetPaginationRo)(ResponseBodyMeta.prototype, 'pagination')
  }

  class ListResponseBody {
    @NestedProperty(() => classRef, { each: true })
    data!: T[]

    @NestedProperty(() => ResponseBodyMeta)
    meta!: ResponseBodyMeta

    constructor(data: T[], meta: ResponseBodyMeta) {
      this.data = data
      this.meta = meta
    }

    static fromSlice(slice: Slice<T>): ListResponseBody {
      const data = slice.data
      const meta = {
        pagination: slice.pagination,
      }

      const res = new ListResponseBody(data, meta)
      return res
    }
  }

  return ListResponseBody as IListResponseBodyClass<T, MODE>
}

