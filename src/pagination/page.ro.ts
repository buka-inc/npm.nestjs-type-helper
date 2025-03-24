import { EntityDTO } from '@mikro-orm/core'
import { PageQueryRo } from './page-query.ro'
import { Pagination } from './pagination'

export abstract class PageRo<T> {
  items!: EntityDTO<T>[]
  pagination!: Pagination

  static from<T>(items: T[], total: number, pageQuery?: PageQueryRo): PageRo<T> {
    return {
      items: items.map((item) => {
        if (item && typeof item['toObject'] === 'function') return item['toObject']() as EntityDTO<T>
        return item as EntityDTO<T>
      }),
      pagination: Pagination.from(total, pageQuery),
    }
  }
}
