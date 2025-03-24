import { IsInt, IsOptional, Min } from 'class-validator'
import { PageQueryRo } from './page-query.ro.js'
import { ApiProperty } from '@nestjs/swagger'

export class Pagination {
  @ApiProperty({
    type: 'number',
    description: '总数',
  })
  @IsInt()
  @Min(1)
  total!: number

  @ApiProperty({
    type: 'number',
    description: '每页数量',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  limit?: number

  @ApiProperty({
    type: 'number',
    description: '页面偏移量',
    required: false,
  })
  @IsOptional()
  @IsInt()
  @Min(0)
  offset?: number

  static from(total: number, pageQueryRo?: PageQueryRo): Pagination {
    const pagination = new Pagination()
    pagination.total = total
    pagination.limit = pageQueryRo?.$limit
    pagination.offset = pageQueryRo?.$offset

    return pagination
  }
}
