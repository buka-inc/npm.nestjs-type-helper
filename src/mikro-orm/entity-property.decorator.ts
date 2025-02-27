import { Property, PropertyOptions } from '@mikro-orm/core'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty, ApiPropertyOptions } from '@nestjs/swagger'
import { IsString, MaxLength, IsCurrency, IsOptional, IsInt, IsNumber, IsISO8601 } from 'class-validator'
// import { EntityMoneyProperty } from './entity-money-property.decorator.js'

type EntityPropertyOptions<T extends object> = PropertyOptions<T> & Pick<ApiPropertyOptions, 'example'>


function VarcharProperty<T extends object>(length?: number, options?: EntityPropertyOptions<T>): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsString()]
  if (length) {
    decorators.push(MaxLength(length))
    decorators.push(ApiProperty({ type: 'string', maxLength: length, example: options?.example }))
  } else {
    decorators.push(ApiProperty({ type: 'string', example: options?.example }))
  }

  return applyDecorators(...decorators)
}

function CharProperty<T extends object>(length?: number, options?: EntityPropertyOptions<T>): PropertyDecorator {
  const decorators: PropertyDecorator[] = [IsString()]
  if (length) {
    decorators.push(MaxLength(length))
    decorators.push(ApiProperty({ type: 'string', maxLength: length, example: options?.example }))
  } else {
    decorators.push(ApiProperty({ type: 'string', example: options?.example }))
  }

  return applyDecorators(...decorators)
}

function TextProperty<T extends object>(options?: EntityPropertyOptions<T>): PropertyDecorator {
  return applyDecorators(
    IsString(),
    ApiProperty({ type: 'string', example: options?.example }),
  )
}


export function MoneyProperty<T extends object>(options?: EntityPropertyOptions<T>): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options?.nullable) decorators.push(IsOptional())

  const comment = options?.comment || '金额(货币)'

  return applyDecorators(
    ...decorators,
    IsCurrency({ symbol: '' }),
    ApiProperty({
      type: 'number',
      format: 'double',
      description: comment,
      example: options?.example,
    }),
  )
}

export function IntProperty<T extends object>(options: EntityPropertyOptions<T>): PropertyDecorator {
  return applyDecorators(
    IsInt(),
    ApiProperty({
      type: 'integer',
      minimum: options?.unsigned ? 0 : undefined,
      example: options.example,
    }),
  )
}

export function DoubleProperty<T extends object>(options: EntityPropertyOptions<T>): PropertyDecorator {
  return applyDecorators(
    IsNumber(),
    ApiProperty({
      type: 'number',
      format: 'double',
      minimum: options?.unsigned ? 0 : undefined,
      example: options.example,
    }),
  )
}

export function DatetimeProperty<T extends object>(options?: EntityPropertyOptions<T>): PropertyDecorator {
  return applyDecorators(
    IsISO8601(),
    ApiProperty({ type: 'string', format: 'date-time', example: options?.example }),
  )
}


export function EntityProperty<T extends object>(options?: PropertyOptions<T> & Pick<ApiPropertyOptions, 'example'>): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options?.columnType && options.columnType.startsWith('varchar')) {
    decorators.push(VarcharProperty(
      Number(options.columnType.match(/\d+/)?.[0]),
      options,
    ))
  } else if (options?.type === 'varchar' && options.length) {
    decorators.push(VarcharProperty(
      options.length,
      options,
    ))
  } else if (options?.columnType && options.columnType.startsWith('char')) {
    decorators.push(VarcharProperty(
      Number(options.columnType.match(/\d+/)?.[0]),
      options,
    ))
  } else if (options?.type === 'char' && options.length) {
    decorators.push(CharProperty(
      options.length,
      options,
    ))
  } else if (options?.type === 'text') {
    decorators.push(TextProperty(options))
  } else if (options?.type === 'money' || options?.columnType === 'money') {
    decorators.push(MoneyProperty(options))
  } else if (options?.type === 'int') {
    decorators.push(IntProperty(options))
  } else if (options?.columnType && options.columnType.startsWith('int')) {
    decorators.push(IntProperty(options))
  } else if (options?.type === 'smallint') {
    decorators.push(IntProperty(options))
  } else if (options?.type === 'double') {
    decorators.push(DoubleProperty(options))
  } else if (options?.type === 'datetime') {
    decorators.push(DatetimeProperty(options))
  } else {
    // eslint-disable-next-line no-lonely-if
    if (options?.comment) {
      // NOTE: Do not remove "type: 'null'" here, otherwise a circular dependency exception will be thrown
      decorators.push(ApiProperty({ type: 'null', description: options.comment }))
    }
  }


  return applyDecorators(...decorators, Property(options) as PropertyDecorator)
}
