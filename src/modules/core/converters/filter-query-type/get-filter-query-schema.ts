
import { ApiPropertyOptions } from '@nestjs/swagger'
import { Class } from 'type-fest'
import * as NestjsSwaggerUtils from '~/utils/nestjs-swagger-utils'
import { getPropertyOperators, getCollectionOperators, swaggerMetadataToJsonSchema } from './utils'
import { SchemaObject } from '~/swagger-patcher/swagger-patcher'
import { ModelRegister } from '../../decorators'


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
    const isCollection = propertyMetadata?.association?.kind === '1:m' || propertyMetadata?.association?.kind === 'm:n'
    const isRelation = !!propertyMetadata?.association
    const isOptional = !!propertyMetadata?.optional

    if (!isOptional) requiredKeys.push(propertyKey)

    if (isRelation) {
      const relationClassRef = propertyMetadata.association!.type() as Class<any>

      // 防止循环引用导致无限递归
      if (visited.has(relationClassRef)) {
        continue
      }

      if (isCollection) {
        // some, none, every — 包裹在字段名下，与验证类结构保持一致
        const sub = getObjectSchema(relationClassRef, visited)
        const operators = getCollectionOperators(classRef, propertyKey)
        const wrapper: SchemaObject = {
          type: 'object',
          properties: {},
          additionalProperties: false,
        }

        for (const operator of operators) {
          wrapper.properties![operator] = sub
        }
        properties[propertyKey] = wrapper
      } else {
        const sub = getObjectSchema(relationClassRef, visited)
        properties[propertyKey] = sub
      }
    } else {
      // eq, ne, lt, gt, lte, gte
      // const propertyClass = propertyMetadata?.type as Class<any>
      const propertySchema: ApiPropertyOptions = {
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

      properties[propertyKey] = propertySchema
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
