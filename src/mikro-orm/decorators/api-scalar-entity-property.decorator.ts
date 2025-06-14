import { BigIntType, EntityProperty } from '@mikro-orm/core'
import { applyDecorators } from '@nestjs/common'
import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsCurrency, IsInt, IsISO8601, IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'
import { logger } from '~/utils/logger'

interface ApiScalarEntityPropertyOptions {
  meta: EntityProperty
  validate?: boolean
  schema?: {
    example?: any
    enumName?: string
  }
}

export function ApiScalarEntityProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const { meta } = options

  if (typeof meta['columnType'] === 'string') {
    const columnType = meta['columnType'].toLowerCase()

    if (columnType.startsWith('varchar')) {
      const length = Number(meta['columnType'].match(/\d+/)?.[0])
      return VarcharProperty(length, options)
    }

    if (columnType.startsWith('char')) {
      const length = Number(meta['columnType'].match(/\d+/)?.[0])
      return CharProperty(length, options)
    }

    if (columnType === 'text') return TextProperty(options)
    if (columnType === 'money') return MoneyProperty(options)
    if (columnType.startsWith('int')) return IntProperty(options)
    if (columnType.startsWith('smallint')) return IntProperty(options)
    if (columnType.startsWith('tinyint')) return TinyintProperty(options)
    if (columnType.startsWith('double')) return DoubleProperty(options)
    if (columnType.startsWith('decimal') || columnType.startsWith('numeric')) return DecimalProperty(options)
    if (columnType === 'datetime') return DatetimeProperty(options)
  }

  if (meta.type === 'varchar') return VarcharProperty(meta.length, options)
  if (meta.type === 'char') return CharProperty(meta.length, options)
  if (meta.type === 'text') return TextProperty(options)
  if (meta.type === 'money') return MoneyProperty(options)
  if (meta.type === 'int') return IntProperty(options)
  if (meta.type === 'smallint') return IntProperty(options)
  if (meta.type === 'tinyint') return TinyintProperty(options)
  if (meta.type === 'double') return DoubleProperty(options)
  if (meta.type === 'decimal' || meta.type === 'numeric') return DecimalProperty(options)
  if (meta.type === 'datetime') return DatetimeProperty(options)
  if (meta.type === 'boolean' || meta.type === 'bool') return BooleanProperty(options)
  if (meta.type === 'bigint') return BigIntProperty(options)
  if ((meta.type as any) instanceof BigIntType) return BigIntProperty(options)

  console.log(meta.type)
  logger.warn(`No decorator founded for type ${meta.type} for property ${meta.name}.`)

  return () => {}
}

function getEnumOptions(options: ApiScalarEntityPropertyOptions): { enum?: (string | number)[]; enumName?: string } {
  if (options.meta.enum !== true) return {}

  const items = options.meta.items as ((() => (string | number)[]) | (string | number)[])
  const values = typeof items === 'function' ? items() : items
  const enumName = options.schema?.enumName

  return {
    enum: values,
    enumName,
  }
}


function VarcharProperty(length: number | undefined, options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsString())
    if (length) decorators.push(MaxLength(length))
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'string',
    maxLength: length,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

function CharProperty(length: number | undefined, options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsString())
    if (length) decorators.push(MaxLength(length), MinLength(length))
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'string',
    maxLength: length,
    minimum: length,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

function TextProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []
  if (options.validate) {
    decorators.push(IsString())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'string',
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}


export function MoneyProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsCurrency({ symbol: '' }))
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'string',
    format: 'money',
    ...(options.schema || {}),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function BigIntProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const { meta } = options

  let mode: 'string' | 'number'
  if (meta.type === 'bigint') {
    mode = 'string'
  } else if ((meta.type as any) instanceof BigIntType) {
    const metaType = meta.type as unknown as BigIntType
    mode = metaType.mode === 'string' ? 'string' : 'number'
  } else {
    throw new Error(`Unsupported type for BigIntProperty: ${meta.type}`)
  }

  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsString())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  if (mode === 'string') {
    decorators.push(ApiProperty({
      type: 'string',
      ...(options.schema || {}),
      ...getEnumOptions(options),
      required: !options.meta.nullable,
      description: options.meta.comment,
    }))
  } else {
    decorators.push(ApiProperty({
      type: 'integer',
      format: 'int64',
      ...(options.schema || {}),
      ...getEnumOptions(options),
      required: !options.meta.nullable,
      description: options.meta.comment,
    }))
  }


  return applyDecorators(...decorators)
}

export function IntProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsInt())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'integer',
    minimum: options.meta.unsigned ? 0 : -2147483647,
    maximum: options.meta.unsigned ? 4294967295 : 2147483647,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function TinyintProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsInt())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'integer',
    minimum: options.meta.unsigned ? 0 : -128,
    maximum: options.meta.unsigned ? 255 : 127,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function DoubleProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsNumber())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'number',
    format: 'double',
    minimum: options.meta.unsigned ? 0 : undefined,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function DecimalProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    if (options.meta.scale) decorators.push(IsNumber({ maxDecimalPlaces: options.meta.scale }))
    else decorators.push(IsNumber())

    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'number',
    format: 'double',
    minimum: options.meta.unsigned ? 0 : undefined,
    ...(options.schema || {}),
    ...getEnumOptions(options),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function DatetimeProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsISO8601())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'string',
    format: 'date-time',
    ...(options.schema || {}),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}

export function BooleanProperty(options: ApiScalarEntityPropertyOptions): PropertyDecorator {
  const decorators: PropertyDecorator[] = []

  if (options.validate) {
    decorators.push(IsBoolean())
    if (options.meta.nullable) decorators.push(IsOptional())
  }

  decorators.push(ApiProperty({
    type: 'boolean',
    ...(options.schema || {}),
    required: !options.meta.nullable,
    description: options.meta.comment,
  }))

  return applyDecorators(...decorators)
}
