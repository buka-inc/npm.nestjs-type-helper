import { ModelRegister } from './model.register'


/**
 * 字典
 *
 * @example
 * ```typescript
 * class MyModel {
 *   @Dictionary(() => T)
 *   myDictProp: Record<string, T>
 * }
 * ```
 */
export function Dictionary(type: () => Function): PropertyDecorator {
  return (target, propertyKey) => {
    ModelRegister.addProperty(target.constructor as any, propertyKey, {
      kind: 'dictionary',
      type,
    })
  }
}
