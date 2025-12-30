import { Query } from '@nestjs/common'
import { ApiQuery } from '@nestjs/swagger'
import { BukaPageQueryValidationPipe } from '~/pipes/page-query-validation.pipe'


const OffsetPageSchema = {
  type: 'object',
  properties: {
    limit: { type: 'number' },
    offset: { type: 'number' },
  },
  required: ['limit', 'offset'],
}

const NextCursorPageSchema = {
  type: 'object',
  properties: {
    after: { type: 'string' },
    first: { type: 'number' },
  },
  required: ['after', 'first'],
}

const PreviousCursorPageSchema = {
  type: 'object',
  properties: {
    before: { type: 'string' },
    last: { type: 'number' },
  },
  required: ['before', 'last'],
}


export function PageQuery(mode?: 'cursor' | 'offset'): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) {
      throw new Error('@PageQuery decorator can only be used on method parameters.')
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)!

    if (mode === 'offset') {
      ApiQuery({
        name: 'page',
        required: true,
        schema: OffsetPageSchema,
      })(target, propertyKey, descriptor)
    } else if (mode === 'cursor') {
      ApiQuery({
        name: 'page',
        required: true,
        schema: {
          oneOf: [
            NextCursorPageSchema,
            PreviousCursorPageSchema,
          ],
        },
      })(target, propertyKey, descriptor)
    } else {
      ApiQuery({
        name: 'page',
        required: true,
        schema: {
          oneOf: [
            OffsetPageSchema,
            NextCursorPageSchema,
            PreviousCursorPageSchema,
          ],
        },
      })(target, propertyKey, descriptor)
    }

    Query(new BukaPageQueryValidationPipe({ mode }))(target, propertyKey, parameterIndex)
  }
}

export function OptionalPageQuery(mode?: 'cursor' | 'offset'): ParameterDecorator {
  return (target: object, propertyKey: string | symbol | undefined, parameterIndex: number) => {
    if (!propertyKey) {
      throw new Error('@PageQuery decorator can only be used on method parameters.')
    }

    const descriptor = Reflect.getOwnPropertyDescriptor(target, propertyKey)!

    if (mode === 'offset') {
      ApiQuery({
        name: 'page',
        required: false,
        schema: OffsetPageSchema,
      })
    } else if (mode === 'cursor') {
      ApiQuery({
        name: 'page',
        required: false,
        schema: {
          oneOf: [
            NextCursorPageSchema,
            PreviousCursorPageSchema,
          ],
        },
      })(target, propertyKey, descriptor)
    } else {
      ApiQuery({
        name: 'page',
        required: false,
        schema: {
          oneOf: [
            OffsetPageSchema,
            NextCursorPageSchema,
            PreviousCursorPageSchema,
          ],
        },
      })(target, propertyKey, descriptor)
    }

    Query(new BukaPageQueryValidationPipe({ mode, optional: true }))(target, propertyKey, parameterIndex)
  }
}
