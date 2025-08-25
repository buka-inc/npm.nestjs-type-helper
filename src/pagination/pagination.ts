import { IsInt, IsOptional, Min } from 'class-validator'
import { PagedListQueryDto } from './paged-list-query.dto.js'
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

  static from(total: number, pageQuery?: PagedListQueryDto): Pagination {
    const pagination = new Pagination()
    pagination.total = total
    pagination.limit = pageQuery?.$limit
    pagination.offset = pageQuery?.$offset

    return pagination
  }
}
