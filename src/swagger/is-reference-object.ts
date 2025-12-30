import { ReferenceObject } from './types/index.js'


export function isReferenceObject(obj: any): obj is ReferenceObject {
  return !!obj && typeof obj === 'object' && typeof obj.$ref === 'string'
}
