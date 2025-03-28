import { Type } from '@nestjs/common'
import { IPrimaryDto } from './types/primary-dto'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'
import { PickType } from '@nestjs/swagger'


export function PrimaryType<T extends object>(classRef: Type<T>): Type<IPrimaryDto<T>> | undefined {
  const properties = MikroOrmUtils.getMetadata(classRef)

  const primaryProperties = properties.filter((prop) => prop.primary)
    .map((prop) => prop.name)

  if (!primaryProperties.length) return

  return PickType(classRef, primaryProperties) as unknown as Type<IPrimaryDto<T>>
}
