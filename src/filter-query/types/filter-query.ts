import { ExcludeHidden } from '~/types/exclude-hidden'
import { ExcludeOpt } from '~/types/exclude-opt'
import { ExcludeRef } from '~/types/exclude-ref'


export type IQueryOperator = '$lt' | '$gt' | '$lte' | '$gte' | '$eq' | '$ne' | '$in' | '$nin'

export type IFilterQueryScalarProperty<T, K extends IQueryOperator = IQueryOperator> = {
  [key in K]?: key extends '$in' | '$nin' ? T[] : T
}


export type IFilterQueryProperty<T> = T extends object
  ? IFilterQuery<T>
  : IFilterQueryScalarProperty<T>

export type IFilterQuery<T> = {
  [K in keyof T]: K extends string
    ? IFilterQueryProperty<ExcludeRef<ExcludeOpt<ExcludeHidden<Exclude<T[K], undefined>>>>>
    : never
}

