import { Model, Property } from '~/decorators'


@Model()
export class CursorPaginationRo {
  @Property({
    schema: {
      type: 'number',
      description: '总数',
    },
  })
  total?: number

  @Property({
    schema: {
      type: 'number',
      description: '每页数量',
    },
  })
  limit!: number

  @Property({
    schema: {
      type: 'string',
      description: '开始游标',
    },
  })
  startCursor!: string

  @Property({
    schema: {
      type: 'string',
      description: '结束游标',
    },
  })
  endCursor!: string

  @Property({
    schema: {
      type: 'boolean',
      description: '是否有下一页',
    },
  })
  hasNextPage!: boolean

  @Property({
    schema: {
      type: 'boolean',
      description: '是否有上一页',
    },
  })
  hasPrevPage!: boolean
}
