# MikroORM 类型辅助工具

## 📖 简介

这是一套专为 `MikroORM` + `NestJS` 项目设计的类型辅助工具集，主要解决以下痛点：

- ✅ **减少重复代码**：自动生成 `@nestjs/swagger` 和 `class-validator` 装饰器
- ✅ **开发提效**：简化实体定义、DTO 构建等常见操作

> **适用对象**：使用 `MikroORM` 和 `NestJS` 的开发者，无论是否为 Buka Inc 员工均可使用。

## ⚙️ 初始配置

### 1. MikroORM 配置

在 `mikro-orm.config.ts` 中启用以下配置：

```typescript
export default defineConfig({
  serialization: {
    forceObject: true, // 强制将外键序列化为对象
  },
  forceUndefined: true, // 未定义字段返回 undefined 而非 null
  // ...其他配置
});
```

> [!TIP]
> 💡 **为什么需要 `forceObject`？**
>
> 启用后，外键会序列化为 `object` 而非 `id`。这也是符合 Buka 的 API 规范的选择。详见 [官方文档](https://mikro-orm.io/docs/serializing#foreign-keys-are-forceobject)

### 2. Swagger CLI 插件配置（可选）

如果使用 `@nestjs/swagger` CLI 插件，建议在 `tsconfig.json` 中配置：

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "@nestjs/swagger",
        "options": {
          "introspectComments": true,
          "dtoFileNameSuffix": [".dto.ts", ".bo.ts", ".ro.ts"]
        }
      }
    ]
  }
}
```

> [!IMPORTANT] 不要包含 `.entity.ts`
>
> `@nestjs/swagger` 对 `MikroORM` 的 `Ref` 和 `Collection` 添加的装饰器是错误的。
> 为解决这个问题，请使用 `EntityDtoType(entity)` 构造 `DTO`。

<!-- ### 3. Swagger 文档配置（推荐）

创建 Swagger 文档时，建议添加 `BaseEntityReferenceDto` 到 `extraModels`：

```typescript
const document = SwaggerModule.createDocument(
  app,
  {
    extraModels: [BaseEntityReferenceDto],
  },
  docOptions
);
``` -->

---

## 🏗️ 基础实体类

所有的 `Entity` 都必须扩展以下基类之一，否则无法使用其他功能。

<details>
  <summary>为什么这是必须的？</summary>

为了能够

</details>

### TimestampedEntity

**适用场景**：不需要主键 `id` 的特殊实体（如中间表、日志表等）

**包含字段**：

- `createdAt`: 创建时间
- `updatedAt`: 更新时间

**使用示例**：

```typescript
import { TimestampedEntity } from "@buka/nestjs-kit";

@Entity()
export class UserLoginLogEntity extends TimestampedEntity {
  @Property()
  userId!: string;

  @Property()
  ipAddress!: string;
}
```

### BaseEntity（推荐）

**适用场景**：绝大多数普通实体

**包含字段**：

- `id`: 主键（UUID）
- `createdAt`: 创建时间
- `updatedAt`: 更新时间

**使用示例**：

```typescript
import { BaseEntity } from "@buka/nestjs-kit";

@Entity()
export class BookEntity extends BaseEntity {
  // 你的字段定义...
}
```

> 💡 **建议**：99% 的实体都应该继承 `BaseEntity`，除非有特殊需求。

---

## 🎯 字段装饰器

### EntityProperty - 普通字段

**作用**：替代 `@Property()`，自动添加 Swagger 文档和验证规则。

**基础用法**：

```typescript
import { BaseEntity, EntityProperty } from "@buka/nestjs-kit";

@Entity()
export class BookEntity extends BaseEntity {
  @EntityProperty({
    type: "varchar",
    length: 64,
    comment: "书名",
  })
  name!: string;

  @EntityProperty({
    type: "text",
    comment: "书籍简介",
    nullable: true,
  })
  description?: string;

  @EntityProperty({
    type: "int",
    comment: "页数",
    default: 0,
  })
  pages!: number;
}
```

**对比传统写法**：

<details>
<summary>👉 点击查看使用原生 <code>@Property()</code> 需要写多少代码</summary>

```typescript
import { BaseEntity } from "@buka/nestjs-kit";
import { Property } from "@mikro-orm/core";
import { ApiProperty } from "@nestjs/swagger";
import { IsString, MaxLength, IsOptional, IsInt, Min } from "class-validator";

@Entity()
export class BookEntity extends BaseEntity {
  @Property({ type: "varchar", length: 64, comment: "书名" })
  @IsString()
  @MaxLength(64)
  @ApiProperty({ type: String, maxLength: 64, description: "书名" })
  name!: string;

  @Property({ type: "text", comment: "书籍简介", nullable: true })
  @IsString()
  @IsOptional()
  @ApiProperty({ type: String, description: "书籍简介", required: false })
  description?: string;

  @Property({ type: "int", comment: "页数", default: 0 })
  @IsInt()
  @Min(0)
  @ApiProperty({ type: Number, description: "页数", default: 0 })
  pages!: number;
}
```

使用 `EntityProperty` 可以减少 **60%** 的代码量！

</details>

### EntityEnum - 枚举字段

**作用**：替代 `@Enum()`，支持枚举类型的字段定义。

**使用示例**：

```typescript
// 1. 定义枚举
export enum BookType {
  NOVEL = "novel",
  SCIENCE = "science",
  HISTORY = "history",
}

// 2. 在实体中使用
import { BaseEntity, EntityEnum } from "@buka/nestjs-kit";

@Entity()
export class BookEntity extends BaseEntity {
  @EntityEnum({
    enumName: "BOOK_TYPE",
    items: () => BookType,
    comment: "书籍类型",
  })
  type!: BookType;
}
```

---

## 🔗 关系装饰器

### EntityManyToOne - 多对一关系

**场景示例**：一本书属于一个作者

```typescript
@Entity()
export class BookEntity extends BaseEntity {
  @EntityManyToOne(() => AuthorEntity, {
    comment: "作者",
  })
  author!: Ref<AuthorEntity>;
}
```

### EntityOneToMany - 一对多关系

**场景示例**：一个作者有多本书

```typescript
@Entity()
export class AuthorEntity extends BaseEntity {
  @EntityOneToMany(() => BookEntity, (book) => book.author, {
    comment: "作品列表",
  })
  books = new Collection<BookEntity>(this);
}
```

### EntityOneToOne - 一对一关系

**场景示例**：一个用户有一份详细资料

```typescript
@Entity()
export class UserEntity extends BaseEntity {
  @EntityOneToOne(() => UserProfileEntity, {
    comment: "用户资料",
  })
  profile!: Ref<UserProfileEntity>;
}
```

### EntityManyToMany - 多对多关系

**场景示例**：一本书可以有多个标签，一个标签可以关联多本书

```typescript
@Entity()
export class BookEntity extends BaseEntity {
  @EntityManyToMany(() => TagEntity, {
    comment: "标签列表",
  })
  tags = new Collection<TagEntity>(this);
}
```

> 💡 **提示**：所有关系装饰器都会自动添加 Swagger 文档和验证规则，无需手动配置。

---

## 📦 DTO 工具

### EntityDtoType(entity) - 快速构建 DTO

> [!IMPORTANT]
>
> `EntityDtoType(entity)` >只能用于继承来自于 `@buka/nestjs-kit/mikro-orm` 基类的 `Entity`，
> 且 `entity` 所有的属性都必须使用来自 `@buka/nestjs-kit/mikro-orm` 的装饰器。

**作用**：基于实体类快速生成 DTO，类似于 `@nestjs/swagger` 的 `PickType`。

**使用示例**：

```typescript
import { EntityDto } from "@buka/nestjs-kit";
import { BookEntity } from "./book.entity";

// 完整 DTO（包含所有字段）
export class BookDto extends EntityDto(BookEntity) {}

// 创建 DTO（排除自动生成的字段）
export class CreateBookDto extends OmitType(EntityDto(BookEntity), [
  "id",
  "createdAt",
  "updatedAt",
] as const) {}

// 更新 DTO（所有字段可选）
export class UpdateBookDto extends PartialType(CreateBookDto) {}
```

### EntityRefType(entity) - 快速构建 Ref

**作用**：基于 `Entity` 快速生成只包含主键的 Class 定义。

**使用场景**：API 请求中只需要传递关联实体的 ID 时。

---

## 🗄️ 数据库配置

### DatabaseConfig

**作用**：简化 MikroORM 的配置（配合 `@buka/nestjs-config` 使用）。

**使用示例**：

```typescript
// config/postgresql.config.ts
import * as path from "path";
import { PostgreSqlDriver } from "@mikro-orm/postgresql";
import { Configuration } from "@buka/nestjs-config";
import { DatabaseConfig } from "@buka/nestjs-kit";

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
      migrations: {
        path: path.join(srcDir, "migrations"),
        pathTs: path.join(srcDir, "migrations"),
      },
    };

    return options;
  }
}
```

---

## 📝 更新日志

查看 [CHANGELOG.md](../../CHANGELOG.md) 了解详细更新记录。

---

**Happy Coding! 🚀**
