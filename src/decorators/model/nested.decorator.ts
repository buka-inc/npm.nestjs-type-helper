import { Property, PropertyMetadata } from './property.decorator'

type NestedOptions = Pick<PropertyMetadata, 'type' | 'optional' | 'schema' | 'relation'>

export function Nested(options: NestedOptions): PropertyDecorator {
  return (target, propertyKey) => {
    Property({
      kind: 'nested',
      ...options,
    })(target, propertyKey)
  }
}
