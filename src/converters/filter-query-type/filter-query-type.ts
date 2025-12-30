import * as R from 'ramda'
import type { IFilterQueryObject, IFilterQuery } from './types'
import * as ClassValidatorUtils from '~/utils/class-validator-utils'
import * as ClassTransformerUtils from '~/utils/class-transformer-utils'
import { getFilterQueryOperators } from './decorators'
import { HasAnyKey, ModelRegister, NestedProperty } from '~/decorators'
import { ArrayMinSize, IS_OPTIONAL, IsArray, IsOptional } from 'class-validator'
import { Class } from 'type-fest'
import { TypeException } from '~/exceptions'
import { getPropertyOperators, getCollectionOperators } from './utils'
import { getFilterQuerySchema } from './get-filter-query-schema'


function createFilterQueryPropertyClassRef(classRef: Class<any>, propertyKey: string): Class<any> {
  const propertyClass = class FilterQueryPropertyClass {}
  ModelRegister.addModel(propertyClass)
  // ModelRegister.addProperty(FilterQueryObjectClass, propertyKey, { type: () => propertyClass, optional: propertyMetadata?.optional })

  const propertyMetadata = ModelRegister.getProperty(classRef, propertyKey)

  const validationMetadataList = ClassValidatorUtils.getMetadata(classRef, propertyKey)
    // 跳过 IsOptional，手动添加
    // 这不仅仅是为了避免重复添加
    // 也是因为 IsOptional 复制无法被复制
    // 详见 https://github.com/typestack/class-validator/blob/develop/src/decorator/common/IsOptional.ts
    .filter((metadata) => metadata.name !== IS_OPTIONAL)

  const transformerMetadataList = ClassTransformerUtils.getTransformMetadata(classRef, propertyKey) || []
  const operators = getPropertyOperators(classRef, propertyKey)

  for (const operator of operators) {
    if (['$in', '$nin'].includes(operator)) {
      // $in, $nin
      ModelRegister.addProperty(propertyClass, operator, { ...propertyMetadata, kind: 'list', optional: true })

      IsArray()(propertyClass.prototype, operator)
      ArrayMinSize(1)(propertyClass.prototype, operator)

      for (const metadata of validationMetadataList) {
        ClassValidatorUtils.setMetadata(propertyClass, operator, { ...metadata, each: true })
      }

      for (const metadata of transformerMetadataList) {
        // 需要将 transformFn 修改为数组版本
        const transformFn = metadata.transformFn
        ClassTransformerUtils.setTransformMetadata(propertyClass, operator, {
          ...metadata,
          transformFn: function FilterQueryPropertyTransformer(params) {
            if (Array.isArray(params.value)) {
              // eslint-disable-next-line @typescript-eslint/no-unsafe-return
              return params.value.map((v, i, arr) => transformFn({ ...params, value: v, key: i, obj: arr }))
            }

            // eslint-disable-next-line @typescript-eslint/no-unsafe-return
            return params.value
          },
        })
      }
    } else {
      // $eq, $ne, $lt, $gt, $lte, $gte
      ModelRegister.addProperty(propertyClass, operator, { ...propertyMetadata, optional: true })

      for (const metadata of validationMetadataList) {
        ClassValidatorUtils.setMetadata(propertyClass, operator, metadata)
      }

      for (const metadata of transformerMetadataList) {
        ClassTransformerUtils.setTransformMetadata(propertyClass, operator, metadata)
      }
    }

    IsOptional()(propertyClass.prototype, operator)
  }

  return propertyClass
}

function createFilterQueryObjectClassRef(classRef: Class<any>): Class<any> {
  class FilterQueryObjectClass {}
  ModelRegister.addModel(FilterQueryObjectClass)

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    if (typeof propertyKey !== 'string') continue

    const propertyMetadata = ModelRegister.getProperty(classRef, propertyKey)
    const isCollection = propertyMetadata?.relation?.kind === '1:m' || propertyMetadata?.relation?.kind === 'm:n'
    const isRelation = !!propertyMetadata?.relation
    const isOptional = !!propertyMetadata?.optional

    if (isRelation) {
      if (isCollection) {
        // $some, $none, $every
        class FilterQueryCollectionClass {}
        ModelRegister.addModel(FilterQueryCollectionClass)

        const sub = createFilterQueryObjectClassRef(propertyMetadata.relation!.type() as Class<any>)
        const operators = getCollectionOperators(classRef, propertyKey)

        for (const operator of operators) {
          NestedProperty(() => sub, { optional: true })(FilterQueryCollectionClass.prototype, operator)
          if (!isOptional) {
            HasAnyKey(getFilterQueryOperators(classRef, propertyKey))(FilterQueryCollectionClass.prototype, operator)
          }

          IsOptional()(FilterQueryCollectionClass.prototype, operator)
        }
        NestedProperty(() => FilterQueryCollectionClass, { optional: isOptional })(FilterQueryObjectClass.prototype, propertyKey)
        if (!isOptional) HasAnyKey(operators)(FilterQueryObjectClass.prototype, propertyKey)
      } else {
        const sub = createFilterQueryObjectClassRef(propertyMetadata.relation!.type() as Class<any>)
        NestedProperty(() => sub, { optional: isOptional })(FilterQueryObjectClass.prototype, propertyKey)
      }
    } else {
      // $eq, $ne, $lt, $gt, $lte, $gte, $in, $nin
      const propertyClass = createFilterQueryPropertyClassRef(classRef, propertyKey)

      NestedProperty(
        () => propertyClass,
        {
          optional: isOptional,
        },
      )(FilterQueryObjectClass.prototype, propertyKey)

      if (!isOptional) {
        const operators = getPropertyOperators(classRef, propertyKey)
        HasAnyKey(operators)(FilterQueryObjectClass.prototype, propertyKey)
      }
    }
  }

  return FilterQueryObjectClass
}

export function FilterQueryType<T>(classRef: Class<T>): Class<IFilterQuery<T>> {
  if (!ModelRegister.isModel(classRef)) {
    throw new TypeException('FilterQueryType only accepts a class annotated with @Model().')
  }

  const FilterQueryObjectClass = createFilterQueryObjectClassRef(classRef)

  const properties = ModelRegister.getProperties(FilterQueryObjectClass)
  const isRequired = R.any((p) => !p.optional, properties)

  class FilterQueryClass {
    filter!: IFilterQueryObject<T>
  }

  ModelRegister.addModel(FilterQueryObjectClass)
  NestedProperty(
    () => FilterQueryObjectClass,
    {
      optional: !isRequired,
      schema: getFilterQuerySchema(classRef),
    },
  )(FilterQueryClass.prototype, 'filter')

  return FilterQueryClass as Class<IFilterQuery<T>>
}
