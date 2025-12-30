import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator'
import { validate } from 'jsonschema'


export const MATCH_JSON_SCHEMA = 'matchJsonSchema'


export function MatchJsonSchema(schema: any, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: MATCH_JSON_SCHEMA,
      target: object.constructor,
      propertyName: propertyName,
      constraints: [schema],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const [schema] = args.constraints

          const results = validate(value, schema)
          return results.valid
        },
        defaultMessage({ value, constraints }: ValidationArguments) {
          return `${propertyName} must match the JSON schema`
        },
      },
    })
  }
}

