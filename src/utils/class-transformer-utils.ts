/**
 * This file contains utility functions for working with `@Transform()` decorator of class-transformer.
 */

import { Type } from '@nestjs/common'
import * as classTransformer from 'class-transformer/cjs/storage'


// ---------------------------------- @Transform() ----------------------------------

export function cloneTransformMetadata(target: Function, source: Type<unknown>, keys: string[]): void {
  for (const propertyKey of keys) {
    const transformerMetadata = getTransformMetadata(source, propertyKey)
    if (transformerMetadata) setTransformMetadata(target as Type<any>, propertyKey, transformerMetadata)
  }
}

export function copyTransformMetadata(
  { source, propertyKey: sourcePropertyKey }: { source: Type<any>; propertyKey: string },
  { target, propertyKey: targetPropertyKey }: { target: Type<any>; propertyKey: string },
): void {
  const metadata = getTransformMetadata(source, sourcePropertyKey)
  if (!metadata) return

  setTransformMetadata(target, targetPropertyKey, metadata)
}

export function getTransformMetadata(classRef: Type<any>, prop: string): any[] | undefined {
  const metadataStorage = classTransformer.defaultMetadataStorage
  const metadataMap = metadataStorage['_transformMetadatas']

  const classMetadata = metadataMap.get(classRef)
  if (!classMetadata) return

  const propertyMetadata = classMetadata.get(prop)

  return (Array.isArray(propertyMetadata) ? propertyMetadata : [propertyMetadata])
}


export function setTransformMetadata(classRef: Type<any>, prop: string, metadata: any): void {
  const meta = { ...metadata, target: classRef, propertyName: prop }

  const metadataStorage = classTransformer.defaultMetadataStorage
  const metadataMap = metadataStorage['_transformMetadatas']


  if (metadataMap.has(classRef)) {
    const classMetadata = metadataMap.get(classRef)
    const propertyMetadata = classMetadata.get(prop)

    if (propertyMetadata) {
      classMetadata.set(propertyMetadata, propertyMetadata.concat(meta))
    } else {
      classMetadata.set(propertyMetadata, meta)
    }
  } else {
    metadataMap.set(classRef, new Map([[prop, meta]]))
  }
}


// ---------------------------------- @Type() ----------------------------------

/**
 * Get the metadata of `@Type()` decorator of class-transformer.
 */
export function getTypeMetadata(classRef: Type<any>, prop: any): any | undefined {
  const metadataStorage = classTransformer.defaultMetadataStorage
  const metadataMap = metadataStorage['_typeMetadatas']

  let parentClassRef = classRef

  while (parentClassRef && parentClassRef !== Object) {
    const classMetadata = metadataMap.get(parentClassRef)
    if (classMetadata) {
      const value = classMetadata.get(prop)
      if (value) return value
    }

    parentClassRef = Object.getPrototypeOf(parentClassRef)
  }
}

export function setTypeMetadata(classRef: Type<any>, prop: any, metadata: any): void {
  const meta = { ...metadata, target: classRef, propertyName: prop }

  const metadataStorage = classTransformer.defaultMetadataStorage
  const metadataMap = metadataStorage['_typeMetadatas']

  metadataMap.set(classRef, meta)
}

export function cloneTypeMetadata(target: Type<any>, source: Type<any>, keys: string[]): void {
  for (const propertyKey of keys) {
    const metadata = getTypeMetadata(source, propertyKey)
    if (metadata) setTypeMetadata(target, propertyKey, metadata)
  }
}
