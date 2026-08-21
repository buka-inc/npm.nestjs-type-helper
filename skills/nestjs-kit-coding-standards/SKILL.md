---
name: nestjs-kit-coding-standards
description: >
  本 skill 定义 @buka/nestjs-kit 业务代码的文件级编写规范:声明 DTO(@Model/@Property/@Composite/@List/@Dictionary/@Enum、
  PickType/OmitType/PartialType/IntersectionType、ResponseBodyType、EntityDto/@EntityRef/PrimaryKeyType)、
  定义 MikroORM 实体(DiscreteEntity/LinearEntity/TimestampedEntity 基类、Column.*、Cardinality.*)、
  编写 service(command 单参契约、Ref<Entity> 传递、em.flush 事务约定)与 controller(operationId 命名、中文 JSDoc、@IsBrowserRequest)、
  实现 list 查询(@FilterQuery/OrderQueryType/@PageQuery/Slice/ParseUUIDv7Pipe)、
  组织模块目录与命名。当用户编写或修改 .dto.ts/.entity.ts/.service.ts/.controller.ts 文件、
  新增业务模块或 CRUD 接口、移动或重命名业务源码文件时使用本 skill;
  只要在项目中新增或修改 NestJS 业务代码,即使用户未提到具体文件名也应使用。
  异常抛出、日志、加密存储等模块级能力由对应 skill 覆盖,本 skill 只规定代码结构与文件级规范。
---

# nestjs-kit 编写规范(coding standards)

本 skill 规定 @buka/nestjs-kit 业务代码的文件级编写规范,覆盖 DTO、实体、service、controller、list 查询与模块目录组织。

## 前置条件

以下机制由项目接入阶段统一提供,编写业务文件时直接依赖:

- 请求体校验与转换由全局 `BukaValidationPipe` 执行——`@EntityRef`/`PrimaryKeyType` 字段在管道内自动转成 wrapped `Ref`(细节见 [references/dto.md](references/dto.md))。项目若自定义了 `validation` 选项,其中 `transform` 必须为 `true`。
- `DatabaseConfig` 默认 `flushMode: FlushMode.COMMIT`(查询前隐式 flush 已跟踪变更)。事务提交点在 controller 末尾统一 `em.flush()`(见 [references/controller.md](references/controller.md) 与 [references/service.md](references/service.md))。
- Swagger 文档由 `@nestjs/swagger` CLI 插件从 controller/DTO 元数据生成,`SwaggerPatcher` 只做文档后处理(见 [nestjs-kit-swagger](../nestjs-kit-swagger/SKILL.md))。

## 速查表(跨文件通用规则)

| 要做什么 | 用什么 |
|---|---|
| kit API 导入 | `import { X } from '@buka/nestjs-kit'`(细则见「通用约定·导入来源」);`Ref`/`Collection`/`Cursor`/`EntityManager` 自 `@mikro-orm/core`;`@Entity` 自 `@mikro-orm/decorators/legacy` |
| 声明 service/controller | 普通 `@Injectable()`/`@Controller()` 类,无需继承基类 |
| 请求体校验转换 | 全局 `BukaValidationPipe`(由 `BukaModule` 注册;`@EntityRef` 自动转 wrapped `Ref`) |
| 事务提交 | controller handler 末尾统一 `await this.em.flush()`;service 非计数器等原子场景不 flush |
| 抛出异常 | `@ModuleExceptions` 声明的异常工厂(规范见 [nestjs-kit-exception](../nestjs-kit-exception/SKILL.md)) |
| 响应结构 | 统一 `{ data, meta }`:单条 `ResponseBodyType.from()`,列表 `ListResponseBodyType.fromSlice()` |

## references 导航

本 skill 的 references/ 目录按文件类型拆分,按需加载——写某类文件时只读对应的 reference;新增一条完整 CRUD 链路(跨 5 类文件)时才通读全部。

| 要写什么文件 | 读哪个 reference |
|---|---|
| 写 DTO(请求/响应) | [references/dto.md](references/dto.md) |
| 定义实体 | [references/entity.md](references/entity.md) |
| 实现 list 查询(过滤/排序/分页) | [references/query.md](references/query.md) |
| 写 service(业务逻辑) | [references/service.md](references/service.md) |
| 写 controller(HTTP 层) | [references/controller.md](references/controller.md) |
| 文件放在哪个目录、如何命名 | 见下方「目录组织」章 |

## 通用约定(跨文件类型)

以"该事实是否 ≥2 类文件共用"为判据——以下五条红线与一条全局数据流链路对所有文件类型成立:

### 导入来源

kit API 统一从 `@buka/nestjs-kit` 主入口导入;包的 `exports` 只配置了 `.`,不存在子路径导出,`from '@buka/nestjs-kit/mikro-orm'` 等写法会在运行时解析失败。`Ref`/`Collection`/`Cursor`/`EntityManager` 自 `@mikro-orm/core` 导入;`@Entity` 自 `@mikro-orm/decorators/legacy` 导入。

### CRUD 数据流链路

一条完整的 CRUD 链路(请求 DTO → 实体 → 响应 DTO)遵循派生链:派生而非重复声明,数据源唯一,字段变更只改一处。

```
CreateXxxRequestDto(显式声明字段,@Model/@Property/@EntityRef 等)
  → UpdateXxxRequestDto = PartialType(OmitType(CreateXxxRequestDto, [...不可更新字段]))
  → XxxFilterQueryDto = PartialType(PickType(XxxBriefDto, [...可过滤字段]))
  → command interface(聚合 service 入参,放 commands/,见 [references/service.md](references/service.md))
  → 实体(@Entity + Column.*/Cardinality.*,见 [references/entity.md](references/entity.md))
  → XxxBriefDto = EntityDto(Entity) / XxxDetailDto = EntityDto(Entity) 显式补 lazy 字段
  → {Fn}ResponseDto = ResponseBodyType(XxxDetailDto) / ListResponseBodyType(XxxBriefDto, mode)
  → controller 返回 .from(entity) / .fromSlice(slice)
```

### 事务红线

- 提交点在 controller handler 末尾统一 `await this.em.flush()`(见 [references/controller.md](references/controller.md))。
- service 非特殊情况不执行 `em.flush()`(见 [references/service.md](references/service.md))。允许的例外:计数器/序号自增等必须立即落库且与请求成败无关的原子场景,须就地注释理由。
- 一次请求不主动拆多个提交点,保证异常回滚包络完整。

### 异常红线

业务代码统一走 [nestjs-kit-exception](../nestjs-kit-exception/SKILL.md) 的异常工厂与 `@ModuleExceptions` 声明——错误码可检索、类别可控;裸 `throw new HttpException` 跳过了错误码体系,错误码不可检索且类别不可控。

### @EntityRef 自动转换

请求体中 `@EntityRef`/`PrimaryKeyType` 字段由全局 `BukaValidationPipe` 在运行时转成 `em.getReference(Entity, id)` 的 wrapped `Ref`,到 service 入参时已是可直接使用的 `Ref<Entity>`(见 [references/dto.md](references/dto.md) 的实体派生 DTO 章)。

## 业务模块目录组织

### 目录结构

```
src/modules/<module-name>/
├── <module-name>.controller.ts     # HTTP 控制器
├── <module-name>.module.ts         # NestJS 模块定义
├── <module-name>.exceptions.ts     # 模块专属异常(@ModuleExceptions 集中声明)
├── commands/       # Command interface —— 聚合 service 方法的参数(写法见 references/service.md)
├── constants/      # 枚举和常量
├── decorators/     # 模块内自定义装饰器(可跨模块 import 共享,复用度高的下沉公共层)
├── dto/            # 对外暴露的数据结构
│   ├── requests/   #   请求参数 DTO
│   └── responses/  #   响应体 DTO({FunctionName}ResponseDto extends ResponseBodyType(...))
├── entities/       # MikroORM 实体
├── services/       # 全部业务逻辑(主 service + 按复杂度拆出的 provider;写法见 references/service.md)
├── subscribers/    # MikroORM 订阅者(可选)
├── types/          # 模块内部类型(可跨模块 import 共享)
└── utils/          # 模块内工具函数(可选)
```

### 各目录职责边界

- **commands/**:只放 `interface`(聚合某个 service 方法的全部参数);不放 handler、不放 DTO。command 的设计与写法见 [references/service.md](references/service.md)
- **constants/**:枚举与常量的集中存放处,业务文件内就近定义的枚举迁入此目录
- **decorators/**:自定义装饰器(可直接跨模块 import 共享);复用度高的下沉公共层目录(如 `src/shared/`)
- **dto/**:对外暴露的数据结构(请求/响应),内部类型放 `types/`;requests 与 responses 分开放
- **entities/**:只放 MikroORM 实体
- **services/**:全部业务逻辑;主 service 与按复杂度拆出的子 service/provider 同放此目录——拆分信号与不拆时机见 [references/service.md](references/service.md)(本条目只定目录归属)
- **exceptions** 不建目录:集中一个文件 `<module-name>.exceptions.ts`,所有 `@ModuleExceptions` 声明都写在这里
- **types/**:模块内部类型,可直接跨模块 import 共享;**utils/**:模块私有工具函数,通常不共享,只在有多个文件共用的工具函数时才建

### 拆分原则

- **一个 DTO 一个文件**:每个请求/响应 DTO 独立成文件(`get-student-response.dto.ts`),全部 DTO 集中在一个 `dtos.ts` 里会破坏按需加载与搜索效率
- 一个实体一个文件(`.entity.ts`),一个 controller 一个文件;controller 的方法命名、拆分上限(约 10 个)与职责边界见 [references/controller.md](references/controller.md)
- service 拆分以复杂度为准绳:子资源具备多个功能拆 `XxxSubresourceService`、可独立理解的复杂职责(通知、审计、同步)拆独立 provider、简单 service 不拆;完整信号清单见 [references/service.md](references/service.md)
- 跨模块共享是允许的:entities、装饰器、dto、types 可直接被其他模块 import;commands、utils 属模块私有实现,通常不共享(确需跨模块复用的通用工具再下沉公共层目录)

### 命名约定

- 文件名 kebab-case,类名 PascalCase,一一对应(`GetStudentResponseDto` → `get-student-response.dto.ts`)
- MikroORM 仓储注入(`@InjectRepository(X)`)的属性命名:`{EntityName}Repo`(如 `courseRepo`、`enrollmentRepo`),不写 `courseRepository`、`repo` 等变体
- 变量与属性命名使用完整单词,禁止自造无法识别含义的极简缩写——如把 `ServiceDescriptor` 缩成 `sd`、把 `service` 缩成 `svc`;规范中已约定的惯用缩写(`em`、`id`、`url` 等)除外
- Controller 方法命名(operationId = 动词 + 资源名、全局唯一)、路由参数命名(`:studentId`)与中文 JSDoc 约定见 [references/controller.md](references/controller.md)

## 注意事项

- DTO 应放入对应子目录:`requests/` 用于请求参数,`responses/` 用于响应体——两者混放会破坏对外结构的一致性
- 移动/重命名文件时同步检查:类名与文件名的一一对应、operationId 是否仍全局唯一、JSDoc 是否随迁、command→DTO 映射是否同步(operationId/JSDoc 规则见 [references/controller.md](references/controller.md))

## 相关 skills

- [nestjs-kit-exception](../nestjs-kit-exception/SKILL.md) — 异常工厂与错误码体系(异常红线运行时来源)
- [nestjs-kit-urn](../nestjs-kit-urn/SKILL.md) — URN 格式规范(`@IsUrn`/`@IsDomainUrn`/`@MatchesUrn` 的语义背景)
- [nestjs-kit-swagger](../nestjs-kit-swagger/SKILL.md) — Swagger 文档后处理与 CLI 插件配置
- [nestjs-kit-crypto](../nestjs-kit-crypto/SKILL.md) — 信封加密 / 盲索引 / 加盐哈希(加密字段用 `Column.Embedded` 嵌入实体)
- [nestjs-kit-logger](../nestjs-kit-logger/SKILL.md) — LoggerModule、@InjectLogger
- [nestjs-kit-http](../nestjs-kit-http/SKILL.md) — keq 服务间调用的错误处理
- [nestjs-kit-object-storage](../nestjs-kit-object-storage/SKILL.md) — S3 兼容对象存储
- [nestjs-kit-open-bao](../nestjs-kit-open-bao/SKILL.md) — OpenBao/Vault 集成