# Pagination

Export `PagedList`, `PageQueryDto` and `Pagination` Class simplify the code for paging queries. And it is friendly to `@nestjs/swagger`, `class-validator` and `class-transformer`.

## Usage

```typescript
// ./dto/list-books.ro
import {PagedListType} from "@buka/nestjs-type-helper";
import {Book} from "../entity/book.entity";

export class ListBooksRo extends PagedListType(Book) {}
```

```typescript
// app.controller.ts
import {Query} from "@nestjs/common";
import {Page, PageQueryDto} from "@buka/nestjs-type-helper";
import {ListBooksRo} from "./dto/list-books.ro";

@Controller()
export class AppController {
  constructor(
    private readonly orm: MikroORM,
    private readonly em: EntityManager
  );

  @Get()
  async listBooks(@Query() pageQueryDto: PageQueryDto): ListBooksRo {
    const [items, total] = await this.em.findAndCount(
      {},
      {
        limit: pageQueryDto.limit,
        offset: pageQueryDto.offset,
      }
    );

    return ListBooksRo.from(items, total, pageQueryRo);
  }
}
```
