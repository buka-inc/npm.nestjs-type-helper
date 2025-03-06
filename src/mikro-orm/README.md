# MikroORM Type Helpers

These helpers is specially customized for `Buka Inc` development specifications.
What's more, these will save you from having to write duplicate `@nestjs/swagger` and `class-validator` decorator.

Even if you are not a developer of `Buka Inc`, but use `MikroORM` and `NestJS`, these helpers may be helpful to you.

> According to the `Buka Inc` development specifications,
> you should enable [`serialization.forceObject`](https://mikro-orm.io/docs/serializing#foreign-keys-are-forceobject) in `mikro-orm.config.ts`
>
> ```typescript
> export defineConfig({
>   serialization: {
>     forceObject: true,
>   },
>   // ...other config
> });
> ```
>
> If use `@nestjs/swagger` CLI Plugin, remove `.entity.ts` from `dtoFileNameSuffix`:
>
> ```json
> {
>   "compilerOptions": {
>     "plugins": [
>       {
>         "name": "@nestjs/swagger",
>         "options": {
>           "introspectComments": true,
>           "dtoFileNameSuffix": [".dto.ts"]
>         }
>       }
>     ]
>   }
> }
> ```

## `BaseEntity`

This it the base class that all Entities should extend(exclude pivot Entity):

```typescript
import { BaseEntity } from "@buka/nestjs-type-helper";

export class BookEntity extends BaseEntity {}
```

The `id`(PrimaryKey), `updatedAt` and `createdAt` are defined in `BaseEntity`.

## `EntityProperty`

This is a decorator that replace `@Property()` of `MikroORM`.
Its arguments are same as `@Property`,
but it will apply `@ApiProperty` and `class-validator` decorator automatically.

```typescript
import { BaseEntity, EntityProperty } from "@buka/nestjs-type-helper";

export class BookEntity extends BaseEntity {
  @EntityProperty({
    type: "varchar",
    length: 64,
    comment: "Book Name",
  })
  name!: string;
}
```

<details>
  <summary>If use `@Property()`</summary>

```typescript
import { BaseEntity } from "@buka/nestjs-type-helper";
import { Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";

export class BookEntity extends BaseEntity {
  @Property({
    type: "varchar",
    length: 64,
    comment: "Book Name",
  })
  @IsString()
  @MaxLength(64)
  @ApiProperty({
    type: string,
    maxLength: 64,
  })
  name!: string;
}
```

</details>

## `EntityEnum`

This is a decorator that replace `@Enum` of `MikroORM`.
Its argument have one more `EnumName` field than @Enum for ApiProperty,
and it will apply `@ApiProperty` and `class-validator` decorator automatically.

```typescript
import { BookType } from "./constants/book-type";
import { BaseEntity, EntityEnum } from "@buka/nestjs-type-helper";

export class BookEntity extends BaseEntity {
  @EntityEnum({
    enumName: "BOOK_TYPE",
    items: () => BookType,
    comment: "Book Type",
  })
  type!: BookType;
}
```

<details>
  <summary>If use `@Property()`</summary>

```typescript
import { BaseEntity } from "@buka/nestjs-type-helper";

export class BookEntity extends BaseEntity {
  @ApiProperty({
    enumName: 'BOOK_TYPE',
    enum: () => BookType,
    description: 'Book Type'
  })
  @Property({
    items: () => BookType,
    comment: 'Book Type'
  })
  type!: BookType,
}
```

</details>

## DatabaseConfig

Simplify configuration for `MikroORM`(`@buka/nestjs-config` ).

```typescript
// ./config/postgresql.config.ts
import * as path from "path";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Configuration } from "@buka/nestjs-config";
import { DatabaseConfig } from "@buka/nestjs-type-helper";

const srcDir = path.resolve(__dirname, "../");

@Configuration("postgresql")
export class PostgresqlConfig extends DatabaseConfig {
  toMikroOrmOptions(): Options {
    let options = super.toMikroOrmOptions();

    options = {
      ...options,
      driver: PostgreSqlDriver,
      baseDir: srcDir,
      entities: ["**/*.entity.js"],
    };

    return options;
  }
}
```
