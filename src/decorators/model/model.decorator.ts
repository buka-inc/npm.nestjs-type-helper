import { Class } from 'type-fest'
import { ModelRegister } from './model.register'


export type ModelKind = 'model' | 'entity' | 'dto' | 'bo' | 'ro'

export interface ModelMetadata {
  kind: ModelKind
  propertyKeys: (string | symbol)[]
}

export function Model(): ClassDecorator {
  return (target: Function) => {
    ModelRegister.addModel(target as Class<any>)
  }
}
