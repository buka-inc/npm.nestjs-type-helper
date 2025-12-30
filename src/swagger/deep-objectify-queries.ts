import { OpenAPIObject } from '@nestjs/swagger'
import { isReferenceObject } from './is-reference-object'
import { SchemaObject } from './types/index.js'
import { deepDereference } from './deep-dereference.js'
import { forEachParameter } from './for-each-parameter.js'


export function deepObjectifyQueries(openapi: OpenAPIObject): void {
  forEachParameter(openapi, (parameter) => {
    if (parameter.in === 'query' && parameter.schema && parameter.style === undefined && (parameter.explode === undefined || parameter.explode === true)) {
      const schema = isReferenceObject(parameter.schema)
        ? deepDereference<SchemaObject>(openapi, parameter.schema)
        : parameter.schema

      if (schema && (schema.type === 'object' || schema.type === 'array')) {
        parameter.style = 'deepObject'
      }
    }
  })
}
