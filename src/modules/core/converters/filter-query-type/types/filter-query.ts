import { Collection, Primary, type Ref } from '@mikro-orm/core'


// ============================================================
// 1. 操作符接口（exported）
// ============================================================

/**
 * 标量字段的比较操作符。
 *
 * @typeParam T - 标量值类型（如 string、number、Date）
 */
export interface IScalarOperator<T> {
  $lt?: T
  $gt?: T
  $lte?: T
  $gte?: T
  $eq?: T
  $ne?: T
  $in?: T[]
  $nin?: T[]
}

/**
 * 集合字段的量化操作符。
 *
 * @typeParam T - 集合元素的类型
 */
export interface ICollectionOperator<T> {
  $some?: INestedOperator<T>
  $every?: INestedOperator<T>
  $none?: INestedOperator<T>
}

/**
 * 嵌套属性操作符分发。
 *
 * - 数组 → {@link ICollectionOperator}<元素类型>
 * - 非数组 → {@link IObjectOperator}<T>（递归展开实体属性）
 *
 * @typeParam T - 待分发的属性类型
 */
export type INestedOperator<T> = T extends Array<infer U>
  ? ICollectionOperator<U>
  : IObjectOperator<T>

// ============================================================
// 2. MikroORM 类型守卫（private）
// ============================================================

/**
 * MikroORM 标量类型联合。
 *
 * 命中此白名单 → {@link IScalarOperator}（生成 $eq/$ne 等比较操作符）。
 * 未命中 → {@link IObjectOperator}（递归展开，适用于 @Composite + @Model 嵌套 filter）。
 */
type MikroOrmScalar = string | number | boolean | Date | bigint | Buffer | null | undefined

/**
 * 判断 T 是否为 MikroORM 标量类型。
 *
 * @typeParam T - 待判断的类型
 */
type IsMikroOrmScalar<T> = [T] extends [MikroOrmScalar] ? true : false

/**
 * 判断 T 是否为 MikroORM Collection 类型。
 *
 * 注意：必须使用 `Collection<any>` 而非 `Collection<infer U>`，参考 `EntityDtoType` 的实现。
 * `Collection` 含有两个泛型参数（T、O），`infer U` 在条件类型中可能因 TypeScript
 * 泛型推断限制而匹配失败。
 *
 * @typeParam T - 待判断的类型
 */
type IsMikroOrmCollection<T> = T extends Collection<any> ? true : false

// ============================================================
// 3. IPropertyOperator 分支辅助类型（private）
// ============================================================

/**
 * 处理 MikroORM Collection 属性 —— 应用集合量化操作符。
 *
 * @typeParam T - Collection 类型
 */
type ResolveCollectionOperator<T> = T extends Collection<infer U> ? ICollectionOperator<U> : never

/**
 * 处理 MikroORM Ref 属性 —— 应用标量操作符于主键类型。
 *
 * @typeParam T - Ref 类型
 */
type ResolveRefOperator<T> = T extends Ref<infer U> ? IScalarOperator<Primary<U>> : never

/**
 * 处理标量属性 —— 应用标量比较操作符。
 *
 * @typeParam T - 标量值类型
 */
type ResolveScalarOperator<T> = IScalarOperator<T>

/**
 * 处理数组属性 —— 通过 {@link INestedOperator} 走集合操作符。
 *
 * @typeParam T - 数组类型
 */
type ResolveArrayOperator<T> = INestedOperator<T>

/**
 * 处理嵌套实体属性（兜底） —— 递归映射所有属性。
 *
 * @typeParam T - 实体类型
 */
type ResolveObjectOperator<T> = IObjectOperator<T>

// ============================================================
// 4. 属性分发入口（exported）
// ============================================================

/**
 * 根据属性类型推导对应的 filter 操作符集合。
 *
 * 分发优先级（从上到下，命中即停止）：
 * 1. MikroORM Collection → 集合量化操作符（$some/$every/$none）
 * 2. MikroORM Ref        → 标量比较操作符（作用于主键类型）
 * 3. 标量类型            → 标量比较操作符（$eq/$ne/$lt 等）
 * 4. 数组类型            → 通过 {@link INestedOperator} 走集合操作符
 * 5. 嵌套实体（兜底）     → 递归映射所有属性
 *
 * @typeParam T - 待分发的属性类型
 */
export type IPropertyOperator<T>
  = IsMikroOrmCollection<T> extends true
    ? ResolveCollectionOperator<T>
    : T extends Ref<any>
      ? ResolveRefOperator<T>
      : IsMikroOrmScalar<T> extends true
        ? ResolveScalarOperator<T>
        : [T] extends [unknown[]]
          ? ResolveArrayOperator<T>
          : ResolveObjectOperator<T>

// ============================================================
// 5. 实体属性递归映射（exported）
// ============================================================

/**
 * 实体属性的递归映射类型。将实体的每个属性映射为对应的 filter 操作符类型。
 *
 * @typeParam T - 实体类型
 */
export type IObjectOperator<T> = {
  [K in keyof T as K extends string ? K : never]: IPropertyOperator<Exclude<T[K], undefined>>
}

// ============================================================
// 6. 对外接口（exported，名称保持不变）
// ============================================================

/**
 * 实体的 filter 类型。
 *
 * `undefined` 表示无过滤条件（不过滤）。
 *
 * @typeParam T - 实体类型
 */
export type IFilter<T> = IObjectOperator<T> | undefined

/**
 * 查询对象的 filter 包装。
 *
 * @typeParam T - 实体类型
 */
export interface IFilterQuery<T> {
  /** 可选的 filter 条件 */
  filter?: IObjectOperator<T>
}
