import { OpenAPIObject } from '@nestjs/swagger'
import { isReferenceObject } from './is-reference-object'
import { ReferenceObject } from './types/index.js'


export function deepDereference<T>(openapi: OpenAPIObject, reference: ReferenceObject): T | undefined {
  let current = reference

  const stack: string[] = []

  while (isReferenceObject(current)) {
    const refPath = current.$ref

    if (stack.includes(refPath)) return undefined
    stack.push(refPath)

    const parts = refPath.replace(/^#\//, '').split('/')
    let next: any = openapi
    for (const part of parts) {
      next = next[part]
    }
    if (!next) return undefined

    current = next
  }

  return current as T
}

