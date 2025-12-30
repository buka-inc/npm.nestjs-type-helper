import { Model, Property } from '~/decorators'


@Model()
export class OffsetPaginationRo {
  @Property({
    schema: {
      type: 'number',
      description: '总数',
    },
  })
  total!: number

  @Property({
    schema: {
      type: 'number',
      description: '每页数量',
    },
  })
  limit!: number

  @Property({
    schema: {
      type: 'number',
      description: '偏移量',
    },
  })
  offset!: number
}
