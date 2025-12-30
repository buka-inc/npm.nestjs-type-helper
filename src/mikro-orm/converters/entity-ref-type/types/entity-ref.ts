import { Primary, PrimaryProperty } from '@mikro-orm/core'


export type IEntityRef<T extends object> = {
  [K in keyof T as K extends PrimaryProperty<T> ? K : never]: Primary<T>
}
