import * as R from 'ramda'
import { Type } from '@nestjs/common'
import { getMetadataStorage } from 'class-validator'
import { ValidationMetadata } from 'class-validator/types/metadata/ValidationMetadata'


export function hasMetadata(source: Type<any>, propertyKey: string): boolean {
  const items = getMetadata(source, propertyKey)
  return items.length > 0
}

export function getMetadata(source: Type<any>): Map<string, ValidationMetadata[]>
export function getMetadata(source: Type<any>, propertyKey: string): ValidationMetadata[]
export function getMetadata(source: Type<any>, propertyKey?: string): Map<string, ValidationMetadata[]> | ValidationMetadata[] | undefined {
  const metadataStorage = getMetadataStorage()
  const arr = metadataStorage.getTargetValidationMetadatas(source, null!, false, false)

  if (!propertyKey) {
    const grouped = R.groupBy(
      (m) => m.propertyName,
      arr,
    )

    const result = new Map<string, ValidationMetadata[]>()
    for (const key in grouped) {
      result.set(key, grouped[key] || [])
    }

    return result
  }


  return arr.filter((item) => item.propertyName === propertyKey)
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
  const metadataList = getMetadata(source, sourcePropertyKey)
  for (const metadata of metadataList) {
    setMetadata(target, targetPropertyKey, metadata)
  }
}

