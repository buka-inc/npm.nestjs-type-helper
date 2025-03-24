import { Type } from '@nestjs/common'
import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, ValidateNested } from 'class-validator'
import { Type as ClassType } from 'class-transformer'
import { IFilterQuery, IFilterQueryScalarProperty } from './types/filter-query'
import * as SwaggerUtils from '~/utils/nestjs-swagger-utils'
import * as ClassTransformerUtils from '~/utils/class-transformer-utils'
import * as ClassValidatorUtils from '~/utils/class-validator-utils'


function prependPrefix(prefix: string | undefined, key: string): string {
  return prefix ? `${prefix}[${key}]` : key
}

export function FilterQueryScalarPropertyType<T>(parentRef: Type<T>, propertyKey: string, root: Type<any>, prefix?: string): Type<IFilterQueryScalarProperty<T>> {
  const swaggerMetadata = SwaggerUtils.getMetadata(parentRef, propertyKey)

  abstract class FilterQueryScalarPropertyClass {}

  for (const queryKey of ['$lt', '$gt', '$lte', '$gte', '$eq', '$ne', '$not']) {
    const mpath = `${prependPrefix(prefix, propertyKey)}[${queryKey}]`

    ApiPropertyOptional({ ...swaggerMetadata, name: mpath })(root.prototype, mpath)

    IsOptional()(FilterQueryScalarPropertyClass.prototype, queryKey)
    ClassValidatorUtils.copyMetadata(
      { source: parentRef, propertyKey },
      { target: FilterQueryScalarPropertyClass as Type<any>, propertyKey: queryKey },
    )

    ClassTransformerUtils.copyTransformMetadata(
      { source: parentRef, propertyKey },
      { target: FilterQueryScalarPropertyClass as Type<any>, propertyKey: queryKey },
    )

    // Allow()(FilterQueryScalarPropertyClass.prototype, queryKey)
  }

  for (const queryKey of ['$in', '$nin']) {
    const mpath = `${prependPrefix(prefix, propertyKey)}[${queryKey}][]`
    ApiPropertyOptional({ ...swaggerMetadata, name: mpath })(root.prototype, mpath)
    // Allow()(FilterQueryScalarPropertyClass.prototype, queryKey)

    IsOptional()(FilterQueryScalarPropertyClass.prototype, queryKey)
    const validatorMetadata = ClassValidatorUtils.getMetadata(parentRef, propertyKey)
    if (validatorMetadata) {
      ClassValidatorUtils.setMetadata(FilterQueryScalarPropertyClass as Type<T>, queryKey, {
        ...validatorMetadata,
        each: true,
      })
    }

    const transformerMetadata = ClassTransformerUtils.getTransformMetadata(parentRef, propertyKey)
    if (transformerMetadata) {
      ClassTransformerUtils.setTransformMetadata(FilterQueryScalarPropertyClass as Type<T>, queryKey, transformerMetadata.map((metadata) => {
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
  }

  return FilterQueryScalarPropertyClass as Type<IFilterQueryScalarProperty<T>>
}

export function FilterQueryClassType<T>(classRef: Type<T>, root?: Type<any>, prefix?: string): Type<IFilterQuery<T>> {
  const swaggerMetadataMap = SwaggerUtils.getMetadata(classRef)

  abstract class FilterQueryClass {}

  for (const propertyKey in swaggerMetadataMap) {
    const PropertyClass = FilterQueryPropertyType(classRef, propertyKey, root || FilterQueryClass as Type<any>, prefix)

    if (!PropertyClass) continue

    IsOptional()(FilterQueryClass.prototype, propertyKey)
    ValidateNested()(FilterQueryClass.prototype, propertyKey)
    ClassType(() => PropertyClass)(FilterQueryClass.prototype, propertyKey)
  }

  return FilterQueryClass as Type<IFilterQuery<T>>
}

export function FilterQueryPropertyType<T>(classRef: Type<T>, propertyKey: string, root: Type<any>, prefix?: string): Type<IFilterQuery<T>> | undefined {
  const swaggerMetadata = SwaggerUtils.getMetadata(classRef, propertyKey)
  const swaggerType = SwaggerUtils.getMetadataType(swaggerMetadata)

  if (['string', 'number', 'boolean'].some((str) => str === swaggerType)) {
    return FilterQueryScalarPropertyType(classRef, propertyKey, root, prefix) as Type<IFilterQuery<T>>
  }

  const typeMetadata = ClassTransformerUtils.getTypeMetadata(classRef, propertyKey)
  if (!typeMetadata) return

  return FilterQueryClassType(typeMetadata.typeFunction(), root, prependPrefix(prefix, propertyKey)) as Type<IFilterQuery<T>>
}

export function FilterQueryType<T>(classRef: Type<T>): Type<IFilterQuery<T>> {
  return FilterQueryClassType(classRef)
}
