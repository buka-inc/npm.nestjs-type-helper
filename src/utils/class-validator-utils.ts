import { Type } from '@nestjs/common'
import { getMetadataStorage } from 'class-validator'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'


export function getMetadata(source: Type<any>, propertyKey?: string): ValidationMetadata | undefined {
  const metadataStorage = getMetadataStorage()
  const arr = metadataStorage.getTargetValidationMetadatas(source, null!, false, false)

  return arr.find((item) => item.propertyName === propertyKey)
}

export function setMetadata(target: Type<any>, propertyKey: string, metadata: ValidationMetadata): void {
  const metadataStorage = getMetadataStorage()
  metadataStorage.addValidationMetadata({
    ...metadata,
    target: target,
    propertyName: propertyKey,
  })
}

export function copyMetadata(
  { source, propertyKey: sourcePropertyKey }: { source: Type<any>; propertyKey: string },
  { target, propertyKey: targetPropertyKey }: { target: Type<any>; propertyKey: string },
): void {
  const metadata = getMetadata(source, sourcePropertyKey)
  if (metadata) setMetadata(target, targetPropertyKey, metadata)
}

