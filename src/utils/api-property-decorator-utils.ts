import * as R from 'ramda'
import { ModelPropertiesAccessor } from '@nestjs/swagger/dist/services/model-properties-accessor'
import { DECORATORS } from '@nestjs/swagger/dist/constants'
import { isFunction } from '@nestjs/common/utils/shared.utils'
import { SchemaObjectMetadata } from '@nestjs/swagger/dist/interfaces/schema-object-metadata.interface'
import { METADATA_FACTORY_NAME } from '@nestjs/swagger/dist/plugin/plugin-constants'
import { Type } from '@nestjs/common'


const modelPropertiesAccessor = new ModelPropertiesAccessor()


/**
 * 获取 @ApiProperty 定义的 Schema
 */
function getSchemaInDecorator(classRef: Type<any>): Record<string, SchemaObjectMetadata> {
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
// eslint-disable-next-line
function getSchemaInPlugin<T>(classRef: Type<any>): Record<string, SchemaObjectMetadata> {
  const propsInPlugin = isFunction(classRef[METADATA_FACTORY_NAME]) ? classRef[METADATA_FACTORY_NAME]() : []
  return propsInPlugin
}

/**
 * Get all metadata of @ApiProperty() defined on the class.
 *
 * 可以利用这个函数，遍历 Dto/Entity 上定义的所有属性，而不需要去实例化一个对象
 */
export function getApiProperties(classRef: Type<any>): Record<string, SchemaObjectMetadata> {
  const propsInDecorator = getSchemaInDecorator(classRef)
  const propsInPlugin = getSchemaInPlugin(classRef)

  return R.mergeRight(propsInPlugin, propsInDecorator)
}

/**
 * Set @ApiProperty() to all properties of the class.
 */
export function setApiProperties(classRef: Type<any>, props: Record<string, SchemaObjectMetadata>): void {
  classRef[METADATA_FACTORY_NAME] = () => props
}
