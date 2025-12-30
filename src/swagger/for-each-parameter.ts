import { OpenAPIObject } from '@nestjs/swagger'
import { ParameterObject } from './types/index.js'


export function forEachParameter(openapi: OpenAPIObject, callback: (parameter: ParameterObject) => void): void {
  for (const pathItem of Object.values(openapi.paths)) {
    for (const operation of Object.values(pathItem)) {
      if (operation && operation.parameters) {
        for (const parameter of operation.parameters) {
          if (!('$ref' in parameter)) {
            callback(parameter)
          }
        }
      }
    }
  }

  for (const parameter of Object.values(openapi.components?.parameters || {})) {
    if (!('$ref' in parameter)) {
      callback(parameter)
    }
  }
}

