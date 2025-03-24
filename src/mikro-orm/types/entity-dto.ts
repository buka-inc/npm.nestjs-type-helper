import { Collection, Hidden, Primary, PrimaryProperty, Ref, Scalar } from '@mikro-orm/core'
import { ExcludeOpt } from '~/types/exclude-opt'


export type IEntityRefPropertyDto<T> = T extends Scalar
  ? T
  : T extends object
    ? { [K in keyof T as K extends PrimaryProperty<T> ? K : never]: Primary<T> }
    : T


export type IEntityPropertyDto<T> = T extends Ref<infer U>
  ? IEntityRefPropertyDto<U>
  : T extends Collection<infer U>
    ? IEntityRefPropertyDto<U>[]
    : T

export type IEntityDto<T> = {
  [K in keyof T as T[K] extends (Hidden | symbol | Function) ? never : K]: IEntityPropertyDto<ExcludeOpt<T[K]>>
}
