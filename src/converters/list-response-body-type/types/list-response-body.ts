import { IResponseBody } from '~/converters/response-body-type/types/response-body-type'
import { CursorPaginationRo, OffsetPaginationRo } from '~/ro'


export interface IListResponseBody<DATA, MODE extends 'offset' | 'cursor' = 'offset' | 'cursor'> extends IResponseBody<DATA[]> {
  meta: {
    pagination: MODE extends 'cursor'
      ? CursorPaginationRo
      : MODE extends 'offset'
        ? OffsetPaginationRo
        : CursorPaginationRo | OffsetPaginationRo

    [key: string]: any
  }
}
