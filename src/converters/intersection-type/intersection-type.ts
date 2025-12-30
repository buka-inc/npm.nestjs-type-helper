import { Type } from '@nestjs/common'
import { IntersectionType as SwaggerIntersectionType } from '@nestjs/swagger'
import { ModelRegister } from '~/decorators'


type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void ? I : never
type ClassRefsToConstructors<T extends Type[]> = {
  [U in keyof T]: T[U] extends Type<infer V> ? V : never;
}
type Intersection<T extends Type[]> = Type<UnionToIntersection<ClassRefsToConstructors<T>[number]>>

export function IntersectionType<T extends Type[]>(...classRefs: T): Intersection<T> {
  const IntersectionTypeClass = SwaggerIntersectionType(...classRefs)

  for (const classRef of classRefs) {
    for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
      ModelRegister.copyProperty(classRef, IntersectionTypeClass, propertyKey)


      const metadataKeys = Reflect.getMetadataKeys(classRef.prototype, propertyKey)

      for (const metadataKey of metadataKeys) {
        const metadata = Reflect.getMetadata(metadataKey, classRef.prototype, propertyKey)
        if (Reflect.hasMetadata(metadataKey, IntersectionTypeClass.prototype, propertyKey)) continue
        Reflect.defineMetadata(metadataKey, metadata, IntersectionTypeClass.prototype, propertyKey)
      }
    }
  }

  return IntersectionTypeClass as Intersection<T>
}
