import { ToNumber } from '@buka/class-transformer-extra'
import { ApiProperty } from '@nestjs/swagger'
import { Expose } from 'class-transformer'
import { IsInt, IsOptional, Min } from 'class-validator'


@Expose()
export class PageQueryRo {
  @ApiProperty({
    type: 'number',
    description: '每页数量',
    required: false,
  })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(1)
  $limit?: number

  @ApiProperty({
    type: 'number',
    description: '页面偏移量',
    required: false,
  })
  @IsOptional()
  @ToNumber()
  @IsInt()
  @Min(0)
  $offset?: number
}
