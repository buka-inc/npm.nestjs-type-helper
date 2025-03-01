import { expect, test } from '@jest/globals'
import { isSubclassOf } from './is-subclass-of'

class A {
  a!: string
}

class B extends A {
}

class C {
  c!: string
}

test('isSubclassOfSpec', () => {
  expect(isSubclassOf(B, A)).toBeTruthy()
  expect(isSubclassOf(C, A)).toBeFalsy()
})
