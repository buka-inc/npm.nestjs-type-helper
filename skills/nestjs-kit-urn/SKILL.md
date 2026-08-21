---
name: nestjs-kit-urn
description: >
  本 skill 定义 urn:buka 统一资源标识符(URN)规范。当用户构造或解析 urn:buka:... 标识、
  确定资源归属的概念域(domain)与资源段(resource)命名、设计 env 段约定、
  书写通配匹配模式(* 与 **)、或使用 @IsUrn/@IsDomainUrn/@MatchesUrn 校验器而需了解其语义背景时使用本 skill。
---

# URN 规范 (urn:buka)

`urn:buka` 是 Buka 所有数字资产的统一资源标识符(Uniform Resource Name),纯命名规范,无包依赖。

## 格式

```
urn:buka:<domain>[:<resource>]
```

| 段         | 含义                                  | 约束                                 |
| ---------- | ------------------------------------- | ------------------------------------ |
| `domain`   | 概念域 — 资源定义权归属,通常为系统名 | `[a-z][a-z0-9-]*`                    |
| `resource` | 资源路径,多段,可选                  | `[a-z][a-z0-9-]*(:[a-z][a-z0-9-]*)*` |

### 概念域

概念域按**资源类型的定义权归属**划分,非按部署单元。一个概念域可以有多个服务实现。

- 绝大多数情况使用**系统名**(如 `galaxy`、`openbao`、`kafka`、`kubernetes`)
- 虚拟域(非系统名)的命名需慎重,仅在有充分理由时使用

### 字符集

- **允许**:小写字母 `a-z`、数字 `0-9`、连字符 `-`
- **保留**:`:` 段分隔符、`*` 通配(单段)、`**` 通配(尾部任意段)
- 其余字符一律禁止

### env 约定

`resource` 的第一段**推荐**用于 `env`(环境),表示资源的部署作用域。这是一个语义约定,不强制:

- 多环境部署的平台(如 OpenBao):用 `prod` / `dev` 作为 resource 第一段
- 单实例平台(如 Galaxy):resource 不包含 env 层级,第一段直接为资源类型

## 粒度

URN 支持两种粒度:

| 粒度     | 格式                           | 示例                                 |
| -------- | ------------------------------ | ------------------------------------ |
| 概念域级 | `urn:buka:<domain>`            | `urn:buka:galaxy`                    |
| 资源级   | `urn:buka:<domain>:<resource>` | `urn:buka:galaxy:principal:550e8400` |

## 示例

| 概念域       | resource                     | URN                                              | 说明                    |
| ------------ | ---------------------------- | ------------------------------------------------ | ----------------------- |
| `galaxy`     | `principal:550e8400`         | `urn:buka:galaxy:principal:550e8400`             | Galaxy 用户主体         |
| `galaxy`     | `image:backend`              | `urn:buka:galaxy:image:backend`                  | Galaxy 后端容器镜像     |
| `galaxy`     | `npm:nestjs-sdk`             | `urn:buka:galaxy:npm:nestjs-sdk`                 | Galaxy npm 包           |
| `galaxy`     | `auth-client:galaxy:console` | `urn:buka:galaxy:auth-client:galaxy:console`     | Galaxy 认证客户端       |
| `openbao`    | `prod:kv:galaxy:database`    | `urn:buka:openbao:prod:kv:galaxy:database`       | OpenBao 生产环境 KV     |
| `openbao`    | `dev:kv:galaxy:database`     | `urn:buka:openbao:dev:kv:galaxy:database`        | OpenBao 开发环境 KV     |
| `kafka`      | `prod:topic:galaxy-events`   | `urn:buka:kafka:prod:topic:galaxy-events`        | Kafka 生产环境 Topic    |
| `kubernetes` | `prod:deployment:galaxy:api` | `urn:buka:kubernetes:prod:deployment:galaxy:api` | K8s 生产环境 Deployment |

## 通配匹配

`*` 匹配单个 `:` 段,`**` 匹配尾部任意段(仅允许出现在末尾)。

| 模式                             | 匹配                                        |
| -------------------------------- | ------------------------------------------- |
| `urn:buka:galaxy:*:*`            | galaxy 概念域下所有两段 resource            |
| `urn:buka:galaxy:principal:*`    | galaxy 的 principal 类型的所有资源          |
| `urn:buka:openbao:*:kv:galaxy:*` | openbao 任意环境的 galaxy KV 路径下的所有键 |
| `urn:buka:galaxy:**`             | galaxy 概念域下的任意 URN                   |

## 相关 skills

- [nestjs-kit-coding-standards](../nestjs-kit-coding-standards/references/dto.md) — `@IsUrn`/`@IsDomainUrn`/`@MatchesUrn` 入参校验