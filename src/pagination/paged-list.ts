import { EntityDTO } from '@mikro-orm/core'
import { PagedListQueryDto } from './paged-list-query.dto'
import { Pagination } from './pagination'

export abstract class PagedList<T> {
  items!: EntityDTO<T>[]
  pagination!: Pagination

  static from<T>(items: T[], total: number, pageQuery?: PagedListQueryDto): PagedList<T> {
    return {
      items: items.map((item) => {
        if (item && typeof item['toObject'] === 'function') return item['toObject']() as EntityDTO<T>
        return item as EntityDTO<T>
      }),
      pagination: Pagination.from(total, pageQuery),
    }
  }
}
