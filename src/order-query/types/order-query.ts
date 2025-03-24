export type IOrderQuery<T> = {
  $order?: {
    [K in keyof T]?: 'desc' | 'asc'
  }[]
}
