# @nestjs/nestjs-type-helper

A set of helpers for project of `NestJS` + `MikroORM` + `class-validator` + `class-transformer`.
The purpose is to reduce duplicate decorators

For example, if we want create an `Book` entity. The code:

```typescript
import { BigIntType, Entity, PrimaryKey, Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsNumberString, Min } from "class-validator";

@Entity()
export class Book {
  @ApiProperty({
    type: "string",
    description: "PK",
    example: "1",
    required: true,
  })
  @PrimaryKey({
    type: new BigIntType("string"),
    comment: "PK",
  })
  @IsNumberString()
  id!: string;

  @IsNumber()
  @Min(0)
  @ApiProperty({
    type: "number",
    description: "Book Price",
    minimum: 0,
    example: 10,
    required: true,
  })
  @Property({
    type: "int",
    comment: "Book Price",
  })
  price!: number;

  @ApiProperty({
    type: "string",
    description: "Book Created Time",
    required: true,
  })
  @Property({
    type: "datetime",
    onCreate: () => new Date(),
    defaultRaw: "CURRENT_TIMESTAMP",
    comment: "Book Created Time",
  })
  createdAt: Date = new Date();

  @ApiProperty({
    type: "string",
    description: "Book Last Updated Time",
    required: true,
  })
  @Property({
    type: "datetime",
    onUpdate: () => new Date(),
    defaultRaw: "CURRENT_TIMESTAMP",
    comment: "Book Last Updated Time",
  })
  updatedAt: Date = new Date();
}
```

Rewrite by `@buka/nestjs-type-helpers`:

```typescript
import { BaseEntity, Entity } from "@mikro-orm/core";
import { EntityProperty } from "./mikro-orm";

@Entity()
export class Book extends BaseEntity {
  @EntityProperty({
    type: "int",
    comment: "Book Price",
    example: 10,
  })
  price!: number;
}
```

## Helpers

- [Pagination](./src/pagination/README.md)
- [OrderQuery](./src/order-query/README.md)
- [FilterQuery](./src/filter-query/README.md)
- [MikroORM Helpers](./src/mikro-orm/README.md)
