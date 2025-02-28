import { PropertyOptions } from '@mikro-orm/core'

// 限制 EntityProperty 和 EntityEnum 必须明确填写数据库列类型
export type ColumnTypeRequired<T> = {
  type: PropertyOptions<T>['type']
} | {
  columnType: PropertyOptions<T>['columnType']
}
