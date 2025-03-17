/**
 * This file contains utility functions for working with `@Type()` decorator of class-transformer.
 */

/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
import { Type } from '@nestjs/common'
import * as classTransformer from 'class-transformer/cjs/storage'

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

export function copyTypeMetadata(from: Type<any>, to: Type<any>, prop: any): void {
  const metadata = getTypeMetadata(from, prop)
  if (!metadata) return

  setTypeMetadata(to, prop, metadata)
}
