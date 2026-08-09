import { Collection, Primary, type Ref } from '@mikro-orm/core'
import { Relation } from './relation'


export interface IFilterQueryCondition<T> {
  $lt?: T
  $gt?: T
  $lte?: T
  $gte?: T
  $eq?: T
  $ne?: T
  $in?: T[]
  $nin?: T[]
}

export interface IFilterQueryCollectionCondition<T> {
  $some?: IFilterQueryNestedProperty<T>
  $every?: IFilterQueryNestedProperty<T>
  $none?: IFilterQueryNestedProperty<T>
}


export type IFilterQueryNestedProperty<T> = T extends Array<infer U>
  ? IFilterQueryCollectionCondition<U>
  : IFilterQueryObject<T>

/**
 * MikroORM Collection 类型检测
 *
 * 注意：必须使用 `Collection<any>` 而非 `Collection<infer U>`，参考 `EntityDtoType` 的实现。
 * `Collection` 含有两个泛型参数（`T`、`O`），`infer U` 在条件类型中可能因 TypeScript
 * 泛型推断限制而匹配失败。
 */
type IsCollection<T> = T extends Collection<any> ? true : false

export type IFilterQueryProperty<T> = T extends Relation
  ? IFilterQueryNestedProperty<T>
  : IsCollection<T> extends true
    ? IFilterQueryCollectionCondition<T extends Collection<infer U> ? U : never>
    : T extends Ref<infer U>
      ? IFilterQueryCondition<Primary<U>>
      : IFilterQueryCondition<T>


export type IFilterQueryObject<T> = {
  [K in keyof T as K extends string ? K : never]: IFilterQueryProperty<Exclude<T[K], undefined>>
}

export type IFilter<T> = IFilterQueryObject<T> | undefined

export interface IFilterQuery<T> {
  filter?: IFilterQueryObject<T>
}

// interface Sub {
//   subkey: string
// }

// interface Root {
//   a: string
//   b: string[]
//   c?: Sub

//   child: Sub & Relation
//   arr: Sub[] & Relation
// }


// const root: IFilterQuery<Root> = {
//   filter: {
//     a: { $eq: 'test' },
//     b: { $eq: ['1', '2'] },
//     child: {
//       subkey: { $eq: 'child-test' },
//     },
//     arr: {
//       // $some: {
//       //   subkey: { $eq: 'arr-test' },
//       // },
//     },
//   },
// }
