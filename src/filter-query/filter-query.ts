

import * as R from 'ramda'
import { Type } from '@nestjs/common'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { isFunction } from '@nestjs/common/utils/shared.utils'

import * as TransformerUtils from '~/utils/transform-decorator-utils'
import * as SwaggerUnits from '~/utils/nestjs-swagger-utils'
import { getTypeMetadata } from '~/utils/type-decorator-utils'
import { ExcludeHidden } from '~/types/exclude-hidden'
import { ExcludeOpt } from '~/types/exclude-opt'
import { ExcludeRef } from '~/types/exclude-ref'


export type IQueryOperator = '$lt' | '$gt' | '$lte' | '$gte' | '$eq' | '$ne' | '$in' | '$nin'

export type IQueryScalarValue<T, K extends IQueryOperator = IQueryOperator> = {
  [key in K]?: key extends '$in' | '$nin' ? T[] : T
}


export type IQueryValue<T> = T extends object
  ? IFilterQuery<T>
  : IQueryScalarValue<T>

export type IFilterQuery<T> = {
  [K in keyof T]: K extends string
    ? IQueryValue<ExcludeRef<ExcludeOpt<ExcludeHidden<Exclude<T[K], undefined>>>>>
    : never
}


function toSwaggerType(type: SwaggerUnits.SchemaObjectMetadata['type']): string | Function {
  if (isFunction(type) && type.name === 'type') {
    return toSwaggerType((<any>type)())
  } else if (isFunction(type) && SwaggerUnits.isBuiltInType(type)) {
    return type.name.toLowerCase()
  }

  return type as (string | Function)
}


function applyDecorators(parentRef: Type<any>, targetRef: Type<any>, prop: string, schemaMetadata: SwaggerUnits.SchemaObjectMetadata, prefix = ''): void {
  for (const key of ['$lt', '$gt', '$lte', '$gte', '$eq', '$ne', '$not']) {
    const propertyKey = prefix ? `${prefix}[${prop}][${key}]` : `${prop}[${key}]`

    const transformerMetadata = TransformerUtils.getTransformMetadata(parentRef, prop)
    if (transformerMetadata) TransformerUtils.setTransformMetadata(targetRef, propertyKey, transformerMetadata)

    const decoratorFactory = ApiPropertyOptional({ ...schemaMetadata, name: propertyKey })
    decoratorFactory(targetRef.prototype, propertyKey)
  }

  for (const key of ['$in', '$nin']) {
    const propertyKey = prefix ? `${prefix}[${prop}][${key}][]` : `${prop}[${key}][]`

    const transformerMetadata = TransformerUtils.getTransformMetadata(parentRef, prop)

    if (transformerMetadata) {
      TransformerUtils.setTransformMetadata(targetRef, propertyKey, transformerMetadata.map((metadata) => {
        const transformFn = metadata.transformFn

        return {
          ...metadata,
          transformFn: function QueryArrayTransform(opt) {
            if (Array.isArray(opt.value)) {
              return opt.value.map((v, i, arr) => transformFn({ ...opt, value: v, key: i, arr }))
            }
          },
        }
      }))
    }

    const decoratorFactory = ApiPropertyOptional({ ...schemaMetadata, name: propertyKey })
    decoratorFactory(targetRef.prototype, propertyKey)
  }
}


function buildClass(targetRef: Type<any>, parentRef: Type<any>, prefix = ''): void {
  const classSchema = SwaggerUnits.getMetadata(parentRef)

  for (const prop in classSchema) {
    const schema = classSchema[prop]
    const type = toSwaggerType(schema.type)

    if (['string', 'number', 'boolean'].some(R.equals(type))) {
      applyDecorators(parentRef, targetRef, prop, schema, prefix)
    } else {
      const typeMetadata = getTypeMetadata(parentRef, prop)
      if (!typeMetadata) continue

      buildClass(targetRef, typeMetadata.typeFunction(), prefix ? `${prefix}[${prop}]` : prop)
    }
  }
}

export function FilterQuery<T>(classRef: Type<T>): Type<IFilterQuery<T>> {
  abstract class FilterQueryClass {}
  buildClass(FilterQueryClass as any, classRef)
  return FilterQueryClass as Type<IFilterQuery<T>>
}
