
import { ApiPropertyOptions } from '@nestjs/swagger'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'
import * as NestjsSwaggerUtils from '~/utils/nestjs-swagger-utils'
import { getPropertyOperators, getCollectionOperators, swaggerMetadataToJsonSchema } from './utils'
import { SchemaObject } from '~/swagger/types'


function getObjectSchema(classRef: Class<any>): SchemaObject {
  const properties = {}
  const schema: SchemaObject = {
    type: 'object',
    properties,
  }

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    if (typeof propertyKey !== 'string') continue

    const propertyMetadata = ModelRegister.getProperty(classRef, propertyKey)
    const isCollection = propertyMetadata?.relation?.kind === '1:m' || propertyMetadata?.relation?.kind === 'm:n'
    const isRelation = !!propertyMetadata?.relation
    const isOptional = !!propertyMetadata?.optional

    if (isRelation) {
      if (isCollection) {
        // $some, $none, $every
        const sub = getObjectSchema(propertyMetadata.relation!.type() as Class<any>)
        const operators = getCollectionOperators(classRef, propertyKey)

        for (const operator of operators) {
          properties[operator] = sub
        }
      } else {
        const sub = getObjectSchema(propertyMetadata.relation!.type() as Class<any>)
        properties[propertyKey] = sub
      }
    } else {
      // $eq, $ne, $lt, $gt, $lte, $gte
      // const propertyClass = propertyMetadata?.type as Class<any>
      const propertySchema: ApiPropertyOptions = {
        type: 'object',
        properties: {},
      }

      const originalSchema = NestjsSwaggerUtils.getMetadata(classRef, propertyKey)

      const operators = getPropertyOperators(classRef, propertyKey)

      for (const operator of operators) {
        if (['$in', '$nin'].includes(operator)) {
          propertySchema.properties[operator] = {
            type: 'array',
            items: originalSchema
              ? swaggerMetadataToJsonSchema(originalSchema)
              : { type: 'string' },
          }
        } else {
          propertySchema.properties[operator] = originalSchema
            ? swaggerMetadataToJsonSchema(originalSchema)
            : { type: 'string' }
        }
      }

      properties[propertyKey] = propertySchema
    }
  }

  return schema
}

export function getFilterQuerySchema(classRef: Class<any>): ApiPropertyOptions {
  return {
    ...getObjectSchema(classRef),
    description: `Filter query for ${classRef.name}`,
    required: false,
  } as ApiPropertyOptions
}
