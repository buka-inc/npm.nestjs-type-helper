export type FilterQueryOperator = '$eq' | '$ne' | '$lt' | '$gt' | '$lte' | '$gte' | '$in' | '$nin' | '$some' | '$every' | '$none'


export const FilterQueryOperatorsMetadataKey = 'buka:filter-query-operators'

export function FilterQueryOperators(operators: FilterQueryOperator[]): PropertyDecorator {
  if (!operators || operators.length === 0) {
    throw new TypeError('FilterQueryOperators: operators array must not be empty')
  }

  return function FilterQueryOperatorsDecorator(target: object, propertyKey: string | symbol): void {
    Reflect.defineMetadata(FilterQueryOperatorsMetadataKey, operators, target, propertyKey)
  }
}

export function getFilterQueryOperators(target: object, propertyKey: string | symbol): readonly FilterQueryOperator[] {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return Reflect.getMetadata(FilterQueryOperatorsMetadataKey, target, propertyKey)
}
