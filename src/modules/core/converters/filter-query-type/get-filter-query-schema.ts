
import { ApiPropertyOptions } from '@nestjs/swagger'
import { Class } from 'type-fest'
import * as NestjsSwaggerUtils from '~/utils/nestjs-swagger-utils'
import { getPropertyOperators, getCollectionOperators, swaggerMetadataToJsonSchema } from './utils'
import { SchemaObject } from '~/swagger-patcher/swagger-patcher'
import { ModelRegister } from '../../decorators'
import { isScalarClass } from '../../decorators/class-validator/is-scalar'


/**
 * 为单个标量属性生成 filter 操作符的 Swagger schema。
 *
 * 生成 `{ type: 'object', properties: { eq: ..., ne: ..., in: [...], ... } }` 结构，
 * 值类型取自原始 Swagger metadata（如 `{ type: 'string' }`），无 metadata 时兜底为 `string`。
 */
function getScalarOperatorSchema(
  classRef: Class<any>,
  propertyKey: string,
): SchemaObject {
  const propertySchema: SchemaObject = {
    type: 'object',
    properties: {},
    additionalProperties: false,
  }

  const originalSchema = NestjsSwaggerUtils.getMetadata(classRef, propertyKey)
  const operators = getPropertyOperators(classRef, propertyKey)

  for (const operator of operators) {
    if (['in', 'nin'].includes(operator)) {
      propertySchema.properties![operator] = {
        type: 'array',
        items: originalSchema
          ? swaggerMetadataToJsonSchema(originalSchema)
          : { type: 'string' },
      }
    } else {
      propertySchema.properties![operator] = originalSchema
        ? swaggerMetadataToJsonSchema(originalSchema)
        : { type: 'string' }
    }
  }

  return propertySchema
}


function getObjectSchema(classRef: Class<any>, visited: WeakSet<Class<any>> = new WeakSet()): SchemaObject {
  const properties = {}
  const requiredKeys: string[] = []
  const schema: SchemaObject = {
    type: 'object',
    properties,
    additionalProperties: false,
  }

  visited.add(classRef)

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    if (typeof propertyKey !== 'string') continue

    const propertyMetadata = ModelRegister.getProperty(classRef, propertyKey)
    const isOptional = !!propertyMetadata?.optional

    if (!isOptional) requiredKeys.push(propertyKey)

    if (propertyMetadata?.kind === 'scalar' || propertyMetadata?.kind === 'enum') {
      // ── 标量 / 枚举 → eq, ne, lt, gt, lte, gte, in, nin ──
      properties[propertyKey] = getScalarOperatorSchema(classRef, propertyKey)
    } else if (propertyMetadata?.kind === 'composite' && propertyMetadata.type) {
      // ── composite（含 m:1 关系和 JSONB 对象）──
      const compositeType = propertyMetadata.type() as Class<any>

      if (ModelRegister.isModel(compositeType) && !visited.has(compositeType)) {
        // @Model() 类型 → 递归展开嵌套 filter schema
        properties[propertyKey] = getObjectSchema(compositeType, visited)
      } else {
        // 非 @Model() 类型 → 回退标量操作符
        properties[propertyKey] = getScalarOperatorSchema(classRef, propertyKey)
      }
    } else if (propertyMetadata?.kind === 'list' || propertyMetadata?.kind === 'dictionary') {
      // ── list / dictionary（含 1:m/m:n 关系和 JSONB 数组/字典）──
      // some, every, none 包裹元素 filter schema
      let elementSchema: SchemaObject

      if (propertyMetadata.type && !isScalarClass(propertyMetadata.type)) {
        const elementType = propertyMetadata.type() as Class<any>

        if (ModelRegister.isModel(elementType) && !visited.has(elementType)) {
          elementSchema = getObjectSchema(elementType, visited)
        } else {
          // 非 @Model() 元素 → 标量操作符
          elementSchema = getScalarOperatorSchema(classRef, propertyKey)
        }
      } else {
        // 无 type 或标量元素 → 标量操作符（兜底 string）
        elementSchema = getScalarOperatorSchema(classRef, propertyKey)
      }

      const operators = getCollectionOperators(classRef, propertyKey)
      const wrapper: SchemaObject = {
        type: 'object',
        properties: {},
        additionalProperties: false,
      }

      for (const operator of operators) {
        wrapper.properties![operator] = elementSchema
      }
      properties[propertyKey] = wrapper
    } else {
      // ── 未知类型兜底 → 标量操作符 ──
      properties[propertyKey] = getScalarOperatorSchema(classRef, propertyKey)
    }
  }

  if (requiredKeys.length > 0) {
    schema.required = requiredKeys
  }

  return schema
}

export function getFilterQuerySchema(classRef: Class<any>): ApiPropertyOptions {
  return {
    ...getObjectSchema(classRef),
    description: `Filter query for ${classRef.name}`,
  } as ApiPropertyOptions
}
