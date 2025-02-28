export function isSubclassOf(target: Function, base: Function): boolean {
  let proto = target.prototype
  while (proto) {
    if (proto === base.prototype) {
      return true
    }
    proto = Object.getPrototypeOf(proto)
  }
  return false
}
