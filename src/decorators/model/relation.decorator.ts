import { Class } from 'type-fest'
import { ModelRegister } from './model.register'

export const RELATION_METADATA_KEY = 'buka:relation'


export type RelationKind = '1:1' | '1:m' | 'm:1' | 'm:n'

export interface RelationMetadata {
  kind: RelationKind
  type: () => Class<object>
}

export function Relation(metadata: RelationMetadata): PropertyDecorator {
  return (target, propertyKey) => {
    ModelRegister.addProperty(target.constructor as Class<any>, propertyKey, { relation: metadata })
  }
}
