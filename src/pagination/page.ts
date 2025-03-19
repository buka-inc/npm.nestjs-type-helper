import { Type } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { Type as ClassType } from 'class-transformer'
import { ValidateNested } from 'class-validator'
import { Pagination } from './pagination.js'
import { PageQuery } from './page-query.js'
import { EntityDTO } from '@mikro-orm/core'


export function Page<T>(classRef: Type<T>): Type<{ items: T[]; pagination: Pagination }> {
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
  }

  return TypeClassPage as Type<{
    items: T[]
    pagination: Pagination
  }>
}


Page.from = <T>(items: T[], total: number, pageQuery: PageQuery): { items: EntityDTO<T>[]; pagination: Pagination } => ({
  items: items.map((item) => {
    if (item && typeof item['toObject'] === 'function') return item['toObject']() as EntityDTO<T>
    return item as EntityDTO<T>
  }),
  pagination: Pagination.from(total, pageQuery),
})
