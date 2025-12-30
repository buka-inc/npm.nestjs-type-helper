import { OmitType as SwaggerOmitType } from '@nestjs/swagger'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'
import { TypeException } from '~/exceptions'


export function OmitType<T, K extends keyof T>(classRef: Class<T>, keys: K[]): Class<Omit<T, typeof keys[number]>> {
  if (!ModelRegister.isModel(classRef)) {
    throw new TypeException('OmitType only accepts a class annotated with @Model().')
  }

  const OmitTypeClass = SwaggerOmitType(classRef, keys)

  for (const propertyKey of ModelRegister.getModelPropertyKeys(classRef)) {
    if (keys.includes(propertyKey as K)) continue

    ModelRegister.copyProperty(classRef, OmitTypeClass, propertyKey)

    const metadataKeys = Reflect.getMetadataKeys(classRef.prototype, propertyKey)

    for (const metadataKey of metadataKeys) {
      const metadata = Reflect.getMetadata(metadataKey, classRef.prototype, propertyKey)
      if (Reflect.hasMetadata(metadataKey, OmitTypeClass.prototype, propertyKey)) continue
      Reflect.defineMetadata(metadataKey, metadata, OmitTypeClass.prototype, propertyKey)
    }
  }

  return OmitTypeClass
}
