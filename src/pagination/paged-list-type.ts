import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type as ClassType } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Pagination } from './pagination.js'
import { PagedListQueryDto } from './paged-list-query.dto.js'
import { EntityDTO } from '@mikro-orm/core'
import { PagedList } from './paged-list.js'


export function PagedListType<T>(classRef: Type<T>): typeof PagedList<T> {
  abstract class TypeClassPage {
    @ApiProperty({
      type: () => classRef,
      isArray: true,
    })
    @ClassType(() => classRef)
    @ValidateNested({ each: true })
    items!: T[]

    @ApiProperty({
      type: () => Pagination,
    })
    @ClassType(() => Pagination)
    @ValidateNested()
    pagination!: Pagination

    static from<T>(items: T[], total: number, pageQuery?: PagedListQueryDto): { items: EntityDTO<T>[]; pagination: Pagination } {
      return {
        items: items.map((item) => {
          if (item && typeof item['toObject'] === 'function') return item['toObject']() as EntityDTO<T>
          return item as EntityDTO<T>
        }),
        pagination: Pagination.from(total, pageQuery),
      }
    }
  }

  return TypeClassPage as typeof PagedList<T>
}
