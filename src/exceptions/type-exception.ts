import { Exception } from './exceptions'

export class TypeException extends Exception {
  constructor(message: string) {
    super(message)
    Object.defineProperty(this, 'name', { value: 'TypeException' })
  }
}
