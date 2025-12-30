import { OpenAPIObject } from '@nestjs/swagger'
import { ValueOf } from 'type-fest'
import { ReferenceObject } from './reference-object'

export type SchemaObject = Exclude<ValueOf<Required<Required<OpenAPIObject>['components']>['schemas']>, ReferenceObject>
