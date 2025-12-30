/* eslint-disable @typescript-eslint/no-unsafe-return */
import { MikroORM, EntityManager, Ref } from '@mikro-orm/core'
import { ValidationPipe, ValidationPipeOptions } from '@nestjs/common'
import { ArgumentMetadata, Injectable, Logger, PipeTransform, Type } from '@nestjs/common'
import { Class } from 'type-fest'
import { ModelRegister } from '~/decorators'
import { EntityRefTypeClassMetadataPropertyKey } from '~/mikro-orm'
import * as MikroOrmUtils from '~/utils/mikro-orm-utils'


function deepMap(obj: any, fn: (value: any) => any): any {
  if (Array.isArray(obj)) {
    return obj.map((item) => deepMap(item, fn))
  } else {
    return fn(obj)
  }
}


function transformReference(em: EntityManager, value: any, metatype: Class<object>): any {
  if (typeof value !== 'object' || value === null) return value

  const entityProperties = MikroOrmUtils.getMetadata(metatype)
  const primaryProperties = entityProperties.filter((p) => p.primary)

  if (primaryProperties.length === 1) {
    const propertyKey = primaryProperties[0].name
    const ref = em.getReference(metatype, value[propertyKey], { wrapped: true })
    return ref
  } else if (primaryProperties.length > 1) {
    const propertyKeys = primaryProperties.map((p) => p.name)
    const ref = em.getReference(metatype, propertyKeys.map((key) => value[key]), { wrapped: true })
    return ref
  }

  return value
}


function deepTransform(em: EntityManager, value: any, metatype: Class<any>): any {
  // value = transformReferenceProperties(em, value, metatype)

  if (typeof value !== 'object' || value === null) {
    // transform 不需要做 validate，其他的格式也可能是合法的，交给 class-validator 处理
    return value
  }

  const propertyKeys = ModelRegister.getModelPropertyKeys(metatype)

  const result = { ...value }

  for (const propertyKey of propertyKeys) {
    const propertyMetadata = ModelRegister.getProperty(metatype, propertyKey)
    if (!propertyMetadata) continue
    if (!(propertyKey in value)) continue

    const propertyValue = value[propertyKey]

    if (propertyMetadata.kind === 'nested') {
      const ctor = propertyMetadata.type() as Type<any>

      if (EntityRefTypeClassMetadataPropertyKey in ctor) {
        // 是 EntityRefType
        result[propertyKey] = transformReference(em, propertyValue, ctor)
      } else {
        const v = deepTransform(em, propertyValue, ctor)
        result[propertyKey] = v
      }
    } else if (propertyMetadata.kind === 'list') {
      result[propertyKey] = deepMap(
        propertyValue,
        (item) => deepTransform(em, item, propertyMetadata.type() as Type<any>),
      )
    } else if (propertyMetadata.kind === 'dictionary') {
      // result[propertyKey] = deepMap(propertyValue, (item) => deepTransform(em, item, ctor))
      result[propertyKey] = Object.fromEntries(
        Object.entries(propertyValue)
          .map(([k, v]) => [k, deepTransform(em, v, propertyMetadata.type() as Type<any>)]),
      )
    }
  }

  return result
}


@Injectable()
export class BukaValidationPipe extends ValidationPipe implements PipeTransform {
  private readonly logger = new Logger(BukaValidationPipe.name)

  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager,
  ) {
    super()
  }

  async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
    value = await super.transform(value, metadata)

    if (!metadata.metatype || typeof metadata.metatype !== 'function') {
      return value
    }

    const metatype = metadata.metatype

    const result = await deepTransform(this.em, value, metatype)
    return result
  }

  static withParams(options: ValidationPipeOptions): Type<PipeTransform> {
    @Injectable()
    class BukaParametrizedValidationPipe extends ValidationPipe implements PipeTransform {
      private readonly logger = new Logger(BukaParametrizedValidationPipe.name)

      constructor(
        private readonly orm: MikroORM,
        private readonly em: EntityManager,
      ) {
        super(options)
      }

      async transform(value: any, metadata: ArgumentMetadata): Promise<any> {
        value = await super.transform(value, metadata)

        if (!options.transform) return value

        if (!metadata.metatype || typeof metadata.metatype !== 'function') {
          return value
        }

        const metatype = metadata.metatype

        const result = await deepTransform(this.em, value, metatype)
        return result
      }
    }

    return BukaParametrizedValidationPipe
  }
}
