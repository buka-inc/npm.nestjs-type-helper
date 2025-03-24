# FilterQuery(Class)

Simplify the definition of complex nested query:

```
?price[$gt]=10&price[$lt]=30
?author[$in][]=Jake&author[$in][]=Larry
```

## Usage

> In Express, you have to use the extended parser, which allows for rich query objects:
>
> ```typescript
> app.set("query parser", "extended");
> ```

Let's create an `BookFilterQueryDto` used to search books:

```typescript
// ./dto/book-filter-query.dto.ts
import { FilterQueryType } from "@buka/nestjs-type-helper";
import { IsInt, IsString } from 'class-validator'
import { ToNumber } from '@buka/class-transformer-extra'


interface BookFilterFields {
  @ToNumber()
  @IsInt()
  price?: number

  @IsString()
  author?: string
}

interface BookFilterQueryDto extends FilterQueryType(BookFilterFields) {
}
```

<details>
  <summary>Code that don't use `FilterQueryType`</summary>

```typescript
interface BookFilterPriceField {
  @IsOptional()
  @ToNumber()
  @IsInt()
  $gt?: number

  @IsOptional()
  @ToNumber()
  @IsInt()
  $eq?: number

  // $in/$lt/$gte...
}

interface BookFilterAuthorField {
  @IsOptional()
  @IsString()
  $gt?: string

  @IsOptional()
  @IsString()
  $eq?: string

  // $in/$lt/$gte...
}

interface BookFilterQueryDto {
  @ValidateNested()
  @Type(() => BookFilterPriceField)
  price?: BookFilterPriceField

  @ValidateNested()
  @Type(() => BookFilterAuthorField)
  author?: BookFilterAuthorField
}
```

</details>

`FilterQueryType` is friendly to `@nestjs/swagger`, `class-validator` and `class-transformer`.
And it could be used in [`mikroORM`](https://mikro-orm.io/) without additional processing.

```typescript
// app.controller.ts
@Controller()
class AppController {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager
  ) {}

  @Get()
  async listBooks(@Query() filter: BookFilterQueryDto): Promise<Book[]> {
    // To simplify the example, business logic is write in the controller
    const books = await this.em.find(Book, filter);
    return books;
  }
}
```

Then, when send a request with `?price[$gt]=10&price[$lt]=30`, the query will be parsed to:

```typescript
const filter = {
  price: {
    $gt: 10,
    $lt: 30,
  },
};
```

<details>
  <summary>More Example</summary>

`?author[$in][]=Jake&author[$in][]=Larry`:

```typescript
const filter = {
  author: {
    $in: ["Jake", "Larry"],
  },
};
```

</details>

## Operators

| operator |
| :------- |
| `$lt`    |
| `$gt`    |
| `$lte`   |
| `$gte`   |
| `$eq`    |
| `$ne`    |
| `$in`    |
| `$nin`   |
