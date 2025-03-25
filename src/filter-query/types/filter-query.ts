import { Scalar } from '@mikro-orm/core'
import { ExcludeHidden } from '~/types/exclude-hidden'
import { ExcludeOpt } from '~/types/exclude-opt'
import { ExcludeRef } from '~/types/exclude-ref'


export type IQueryOperator = '$lt' | '$gt' | '$lte' | '$gte' | '$eq' | '$ne' | '$in' | '$nin'

export type IFilterQueryScalarProperty<T> = {
  [K in IQueryOperator]?: K extends '$in' | '$nin' ? T[] : T
}

export type IFilterQueryProperty<T> = T extends Scalar
  ? IFilterQueryScalarProperty<T>
  : IFilterQuery<T>

export type IFilterQuery<T> = {
  [K in keyof T as K extends string ? K : never]: IFilterQueryProperty<ExcludeRef<ExcludeOpt<ExcludeHidden<T[K]>>>>
}
