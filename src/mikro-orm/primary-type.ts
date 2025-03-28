import { Type } from '@nestjs/common'

import { IPrimaryDto } from './types/primary-dto'
import * as SwaggerUtils from '~/utils/nestjs-swagger-utils'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'
import { inheritTransformationMetadata, inheritValidationMetadata } from '@nestjs/mapped-types'


export function PrimaryType<T extends object>(classRef: Type<T>): Type<IPrimaryDto<T>> | undefined {
  const properties = MikroOrmUtils.getMetadata(classRef)

  const primaryProperties = properties.filter((prop) => prop.primary)
    .map((prop) => prop.name as string)

  if (!primaryProperties.length) return

  const clsName = `${classRef.name}PrimaryClass`

  const cls = new Function(`
    return class ${clsName} {}
  `)() as Type<IPrimaryDto<T>>

  SwaggerUtils.cloneMetadata(cls, classRef, primaryProperties)
  inheritValidationMetadata(classRef, cls, (key) => primaryProperties.includes(key))
  inheritTransformationMetadata(classRef, cls, (key) => primaryProperties.includes(key))

  return cls
}
