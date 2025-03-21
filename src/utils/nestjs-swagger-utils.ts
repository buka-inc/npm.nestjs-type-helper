import * as R from 'ramda'
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor'
import { DECORATORS } from '@nestjs/swagger/dist/constants'
import { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface'
import { METADATA_FACTORY_NAME } from '@nestjs/swagger/dist/plugin/plugin-constants'
import { Type } from '@nestjs/common'
import { clonePluginMetadataFactory } from '@nestjs/swagger/dist/type-helpers/mapped-types.utils'
import { ApiProperty } from '@nestjs/swagger'

export { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface'
export { isBuiltInType } from '@nestjs/swagger/dist/utils/is-built-in-type.util'


const modelPropertiesAccessor = new ModelPropertiesAccessor()

/**
 * 克隆 @nestjs/swagger Plugin 添加的元数据
 */
export const cloneSwaggerPluginMetadataFactory = clonePluginMetadataFactory

export function cloneMetadata(target: Function, source: Type<unknown>, keys: string[]): void {
  cloneSwaggerPluginMetadataFactory(
    target as Type<unknown>,
    source.prototype,
    (metadata: Record<string, any>) => R.pick(keys, metadata),
  )

  keys.forEach((propertyKey) => {
    const metadata = getMetadataOfDecorator(source, propertyKey)
    const decoratorFactory = ApiProperty(metadata)
    decoratorFactory(target.prototype, propertyKey)
  })
}

/**
 * 获取 @ApiProperty 添加的 Metadata
 */
export function getMetadataOfDecorator(classRef: Type<any>): Record<string, SchemaObjectMetadata>
export function getMetadataOfDecorator(classRef: Type<any>, propertyKey: string): SchemaObjectMetadata | undefined
export function getMetadataOfDecorator(classRef: Type<any>, propertyKey?: string): SchemaObjectMetadata | undefined | Record<string, SchemaObjectMetadata> {
  if (propertyKey) {
    return Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, propertyKey)
  }

  const props = modelPropertiesAccessor
    .getModelProperties(classRef.prototype as any)

  return R.fromPairs(
    props.map((prop) => [
      prop,
      Reflect.getMetadata(DECORATORS.API_MODEL_PROPERTIES, classRef.prototype, prop),
    ]),
  )
}

/**
 * 获取 @nestjs/swagger Plugin 添加的 Schema
 */

function getMetadataOfPlugin(classRef: Type<any>): Record<string, SchemaObjectMetadata>
function getMetadataOfPlugin(classRef: Type<any>, propertyKey: string): SchemaObjectMetadata | undefined
function getMetadataOfPlugin(classRef: Type<any>, propertyKey?: string): SchemaObjectMetadata | undefined | Record<string, SchemaObjectMetadata> {
  const propsInPlugin = typeof classRef[METADATA_FACTORY_NAME] === 'function' ? classRef[METADATA_FACTORY_NAME]() : {}

  if (propertyKey) return propsInPlugin[propertyKey]
  return propsInPlugin
}

/**
 * Get all metadata of @ApiProperty() defined on the class.
 *
 * 可以利用这个函数，遍历 Dto/Entity 上定义的所有属性，而不需要去实例化一个对象
 */
export function getMetadata(classRef: Type<any>): Record<string, SchemaObjectMetadata> {
  const propsInDecorator = getMetadataOfDecorator(classRef)
  const propsInPlugin = getMetadataOfPlugin(classRef)

  return R.mergeRight(propsInPlugin, propsInDecorator)
}

/**
 * Set @ApiProperty() to all properties of the class.
 */
export function setApiProperties(classRef: Type<any>, props: Record<string, SchemaObjectMetadata>): void {
  classRef[METADATA_FACTORY_NAME] = () => props
}
