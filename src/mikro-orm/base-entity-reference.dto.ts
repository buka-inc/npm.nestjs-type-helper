/**
 * This DTO is used to serialize entity references in the response.
 * When mikroORM serialization.forceObject is set to true.
 */
import { IsNumberString } from 'class-validator'
import { ApiProperty } from '@nestjs/swagger'


export class BaseEntityReferenceDto {
  @ApiProperty({
    type: 'string',
    description: 'PK',
  })
  @IsNumberString({ no_symbols: true })
  id!: string
}
