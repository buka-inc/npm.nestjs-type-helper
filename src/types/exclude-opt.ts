import { Opt } from '@mikro-orm/core'

export type ExcludeOpt<T> = Exclude<T, undefined> extends infer U & Opt
  ? U
  : Exclude<T, undefined> extends Opt<infer U>
    ? U
    : Exclude<T, undefined>
