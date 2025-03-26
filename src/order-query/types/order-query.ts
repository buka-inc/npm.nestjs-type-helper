export type IOrderProperties<T> = {
  [K in keyof T]?: 'desc' | 'asc'
}

export type IOrderQuery<T> = {
  $order?: IOrderProperties<T>[]
}
