# @nestjs/swagger

## `deepObjectifyQueries(openapi)`

如果 Query 是 `object`/`array` 类型且未明确设置 `style`，则添加 `"style": "deepObject"`。

```typescript
import { DocumentBuilder } from "@nestjs/swagger";

const builder = new DocumentBuilder();
const document = SwaggerModule.createDocument(app, builder);

deepObjectifyQueries(document);

SwaggerModule.setup("/swagger/ui", app, document);
```
