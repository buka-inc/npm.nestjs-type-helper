import { Property, PropertyMetadata } from './property.decorator'


type ListOptions = Pick<PropertyMetadata, 'optional' | 'type' | 'schema' | 'relation'>

export function List(options: ListOptions): PropertyDecorator {
  return (target, propertyKey) => {
    Property({
      kind: 'list',
      ...options,
    })(target, propertyKey)
  }
}
