import { Opt } from '@mikro-orm/core'

export type ExcludeOpt<T> = T extends infer U & Opt
  ? U
  : T extends Opt<infer U>
    ? U
    : T
