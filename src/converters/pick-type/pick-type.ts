import { PickType as SwaggerPickType } from '@nestjs/swagger'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'
import { TypeException } from '~/exceptions'

export function PickType<T, K extends keyof T>(classRef: Class<T>, keys: K[]): Class<Pick<T, typeof keys[number]>> {
  if (!ModelRegister.isModel(classRef)) {
    throw new TypeException('PickType only accepts a class annotated with @Model().')
  }

  const PickTypeClass = SwaggerPickType(classRef, keys)


  for (const key of keys) {
    ModelRegister.copyProperty(classRef, PickTypeClass, key as string)

    const metadataKeys = Reflect.getMetadataKeys(classRef.prototype, key as string)

    for (const metadataKey of metadataKeys) {
      const metadata = Reflect.getMetadata(metadataKey, classRef.prototype, key as string)
      if (Reflect.hasMetadata(metadataKey, PickTypeClass.prototype, key as string)) continue
      Reflect.defineMetadata(metadataKey, metadata, PickTypeClass.prototype, key as string)
    }
  }

  return PickTypeClass
}
