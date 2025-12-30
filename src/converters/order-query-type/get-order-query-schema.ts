import { ApiPropertyOptions } from '@nestjs/swagger'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'
import { SchemaObject } from '~/swagger/types'


function getOrderQueryEnum(): SchemaObject {
  return {
    type: 'string',
    enum: [
      'asc',
      'asc nulls last',
      'asc nulls first',
      'desc',
      'desc nulls last',
      'desc nulls first',
    ],
  }
}

function getOrderQueryMapSchema(classRef: Class<any>): SchemaObject {
  const properties = {}
  const schema: SchemaObject = {
    type: 'object',
    properties,
    required: [],
  }

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    const propertyMetadata = ModelRegister.getProperty(classRef, propertyKey)
    // const isCollection = propertyMetadata?.relation?.kind === '1:m' || propertyMetadata?.relation?.kind === 'm:n'
    const isRelation = !!propertyMetadata?.relation
    // const isOptional = !!propertyMetadata?.optional

    if (isRelation) {
      properties[propertyKey] = getOrderQueryMapSchema(propertyMetadata.relation!.type() as Class<any>)
    } else {
      properties[propertyKey] = getOrderQueryEnum()
    }

    // if (!isOptional) schema.required!.push(propertyKey)
  }

  return schema
}


export function getOrderQuerySchema(classRef: Class<any>): ApiPropertyOptions {
  const orderQueryMapSchema = getOrderQueryMapSchema(classRef)

  return {
    description: `Order query for ${classRef.name}`,
    oneOf: [
      {
        type: 'array',
        items: orderQueryMapSchema,
      },
      orderQueryMapSchema,
    ],
    required: false,
  }
}
