import { PartialType as SwaggerPartialType } from '@nestjs/swagger'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'

export function PartialType<T>(classRef: Class<T>): Class<Partial<T>> {
  const PartialTypeClass = SwaggerPartialType(classRef)

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    ModelRegister.copyProperty(classRef, PartialTypeClass, propertyKey)

    const metadataKeys = Reflect.getMetadataKeys(classRef.prototype, propertyKey as string)

    for (const metadataKey of metadataKeys) {
      const metadata = Reflect.getMetadata(metadataKey, classRef.prototype, propertyKey as string)
      if (Reflect.hasMetadata(metadataKey, PartialTypeClass.prototype, propertyKey as string)) continue
      Reflect.defineMetadata(metadataKey, metadata, PartialTypeClass.prototype, propertyKey as string)
    }
  }

  return PartialTypeClass
}
