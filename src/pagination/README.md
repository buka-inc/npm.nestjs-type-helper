# Pagination

Export `Page`, `PageQuery` and `Pagination` Class simplify the code for paging queries. And it is friendly to `@nestjs/swagger`, `class-validator` and `class-transformer`.

## Usage

```typescript
// ./dto/list-books.ro
import { PageType } from "@buka/nestjs-type-helper";
import { Book } from "../entity/book.entity";

export class ListBooksRo extends PageType(Book) {}
```

```typescript
// app.controller.ts
import { Page, PageQuery, PageQueryRo } from "@buka/nestjs-type-helper";
import { ListBooksRo } from "./dto/list-books.ro";

@Controller()
export class AppController {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager
  );

  @Get()
  async listBooks(@PageQuery() pageQueryRo: PageQueryRo): ListBooksRo {
    const [items, total] = await this.em.findAndCount(
      {},
      {
        limit: pageQueryRo.limit,
        offset: pageQueryRo.offset,
      }
    );

    return ListBooksRo.from(items, total, pageQueryRo);

    // Page.from is sugar of
    //
    // return {
    //   items,
    //   pagination: {
    //     total,
    //     ...pageQuery,
    //   },
    // };
  }
}
```
