# Changelog

## [3.0.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v3.0.0...v3.0.1) (2025-12-30)


### Bug Fixes

* wrong readme alert ([c96e1d1](https://github.com/buka-inc/npm.nestjs-type-helper/commit/c96e1d1d5a6580a1344a3293463f173dc7a02b9b))

## [3.0.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v2.1.1...v3.0.0) (2025-12-30)


### ⚠ BREAKING CHANGES

* @buka/nestjs-type-helper is deprecated and use @buka/nestjs instead.

### Features

* new buka api specification ([82ab3f9](https://github.com/buka-inc/npm.nestjs-type-helper/commit/82ab3f96a763ce4f06854c39c15e016519332940))

## [2.1.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v2.1.0...v2.1.1) (2025-10-30)


### Bug Fixes

* wrong export ([4661c2b](https://github.com/buka-inc/npm.nestjs-type-helper/commit/4661c2bc0d558329c16a81fb1c55e3f3917f7f0a))

## [2.1.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v2.0.0...v2.1.0) (2025-10-30)


### Features

* add EntityTransient ([1c8fa4c](https://github.com/buka-inc/npm.nestjs-type-helper/commit/1c8fa4c6e8ff557a2c8abc32b7f87df74d3ad854))

## [2.0.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.7.2...v2.0.0) (2025-08-25)


### ⚠ BREAKING CHANGES

* rename PageType to PagedList, PageQueryRo to PagedListQueryDto, PageRo<T> to PagedList<T>

### Features

* correct pagination class name ([9db5f7b](https://github.com/buka-inc/npm.nestjs-type-helper/commit/9db5f7bbe1a94a4360370fc7c26b48c3a04e0087))


### Bug Fixes

* remove console.log ([8d51628](https://github.com/buka-inc/npm.nestjs-type-helper/commit/8d51628192b3e8fab1e26d956d3a1bbea0e73aa0))

## [1.7.2](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.7.1...v1.7.2) (2025-06-05)


### Bug Fixes

* the EntityProperty decorator not work with bigint ([cb811aa](https://github.com/buka-inc/npm.nestjs-type-helper/commit/cb811aafee2bd00540b4e2c9f65c3cca3239ce6b))
* the EntityProperty decorator not work with boolean ([58ed68a](https://github.com/buka-inc/npm.nestjs-type-helper/commit/58ed68a2babeef825d51cd29e59d2798170885ee))
* the EntityProperty decorator not work with tinyint ([35e103a](https://github.com/buka-inc/npm.nestjs-type-helper/commit/35e103ae6a04dafaea454323f02291c232a72d82))

## [1.7.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.7.0...v1.7.1) (2025-06-02)


### Bug Fixes

* wrong decorators in BaseEntityReferenceProperty ([e542797](https://github.com/buka-inc/npm.nestjs-type-helper/commit/e5427972518d0a81509784613e688eb2b646d6d0))

## [1.7.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.6.2...v1.7.0) (2025-06-02)


### Features

* enhance BaseEntityReferenceProperty to support 'each' option for array validation ([cb017d2](https://github.com/buka-inc/npm.nestjs-type-helper/commit/cb017d2b6403484d5654f6631e1ecef02b15bead))

## [1.6.2](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.6.1...v1.6.2) (2025-05-11)


### Bug Fixes

* the options of BaseEntityReferenceProperty should be optional ([2a0c009](https://github.com/buka-inc/npm.nestjs-type-helper/commit/2a0c009a9cf8f89292b39b943c159aa62b2df51c))

## [1.6.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.6.0...v1.6.1) (2025-05-11)


### Performance Improvements

* add optional option to BaseEntityReferenceProperty ([b346a53](https://github.com/buka-inc/npm.nestjs-type-helper/commit/b346a53bc2b0cd3136610e67244ec16d3c20603c))

## [1.6.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.5.0...v1.6.0) (2025-05-11)


### Features

* add BaseEntityReferenceProperty decorator ([c79acb9](https://github.com/buka-inc/npm.nestjs-type-helper/commit/c79acb9453ba143524df771600f8e1c76144a1a6))

## [1.5.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.8...v1.5.0) (2025-04-27)


### Features

* support decimal and numeric ([e6473b7](https://github.com/buka-inc/npm.nestjs-type-helper/commit/e6473b77679b06e78af4a1b58a89dd10f84aeb4b))

## [1.4.8](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.7...v1.4.8) (2025-04-08)


### Bug Fixes

* wrong ApiProperty applied when primary key without ApiProperty descorator ([d338be9](https://github.com/buka-inc/npm.nestjs-type-helper/commit/d338be9f1c2872c6ff90731d97801e9e40c2af8a))

## [1.4.7](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.6...v1.4.7) (2025-03-28)


### Bug Fixes

* duplicate name of EntityDtoType ([2a06d08](https://github.com/buka-inc/npm.nestjs-type-helper/commit/2a06d0844f7527f797ad07b3294ee4a77c621694))

## [1.4.6](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.5...v1.4.6) (2025-03-28)


### Bug Fixes

* correct FilterQueryType for custom base entity ([33df762](https://github.com/buka-inc/npm.nestjs-type-helper/commit/33df76201298c3e8192820b2129cdd271ca3a027))

## [1.4.5](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.4...v1.4.5) (2025-03-26)


### Bug Fixes

* wrong OrderQueryType ([833a539](https://github.com/buka-inc/npm.nestjs-type-helper/commit/833a539aeeccd48fe4938161feba902d84bbfcb6))

## [1.4.4](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.3...v1.4.4) (2025-03-25)


### Bug Fixes

* wrong filter query types ([3b1f72f](https://github.com/buka-inc/npm.nestjs-type-helper/commit/3b1f72fc192a0ea68c475612662a4edbe1cc5df4))

## [1.4.3](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.2...v1.4.3) (2025-03-24)


### Performance Improvements

* the FilterQuery decorator missing validator and transformer ([c6441e2](https://github.com/buka-inc/npm.nestjs-type-helper/commit/c6441e20c2ed81614b70b5949e8a3e0f1851c31a))

## [1.4.2](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.1...v1.4.2) (2025-03-24)


### Bug Fixes

* the IEntityDto should exclude methods ([537e774](https://github.com/buka-inc/npm.nestjs-type-helper/commit/537e7741a938681c907de8a1af52c5edcfaa9421))

## [1.4.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.4.0...v1.4.1) (2025-03-21)


### Performance Improvements

* the EntityDto should not inherit constractor ([24a7816](https://github.com/buka-inc/npm.nestjs-type-helper/commit/24a78168d945c2515fec4ce78071e474c1ddf710))

## [1.4.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.3.4...v1.4.0) (2025-03-19)


### Features

* update Page.from to return EntityDTO items ([6de3460](https://github.com/buka-inc/npm.nestjs-type-helper/commit/6de3460a6b1775e158845c4ed8fec24af2f4a78b))


### Bug Fixes

* wrong IentityDto type ([3e58fd5](https://github.com/buka-inc/npm.nestjs-type-helper/commit/3e58fd59a8ddce35d2bd9d401d4d3813f4497a5a))


### Performance Improvements

* enable forceUndefined option in DatabaseConfig ([915d7ba](https://github.com/buka-inc/npm.nestjs-type-helper/commit/915d7ba0e61dfae44ab4b01d137803cffd908b24))

## [1.3.4](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.3.3...v1.3.4) (2025-03-19)


### Bug Fixes

* return type of EntityDto missing swagger ([45251e3](https://github.com/buka-inc/npm.nestjs-type-helper/commit/45251e35830079ec5fb21652aa9e1e043f2790a2))

## [1.3.3](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.3.2...v1.3.3) (2025-03-19)


### Performance Improvements

* add Collection support to IEntityDto ([486aaf9](https://github.com/buka-inc/npm.nestjs-type-helper/commit/486aaf94ee9bb65eb8f029602c7e80578ea7578b))

## [1.3.2](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.3.1...v1.3.2) (2025-03-18)


### Performance Improvements

* enhance EntityDto ([87fa3b1](https://github.com/buka-inc/npm.nestjs-type-helper/commit/87fa3b15b4564608dbefe777f743215e8e9010e9))

## [1.3.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.3.0...v1.3.1) (2025-03-17)


### Bug Fixes

* cannot get type of class-transformer ([ee666a8](https://github.com/buka-inc/npm.nestjs-type-helper/commit/ee666a8f10e4e918f486cf9fa0f84e73c12f83bf))

## [1.3.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.2.0...v1.3.0) (2025-03-02)


### Features

* add database configuration for MikroORM ([1e86f2c](https://github.com/buka-inc/npm.nestjs-type-helper/commit/1e86f2cd47582e0fff92364d77c5232053b1e35b))

## [1.2.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.1.0...v1.2.0) (2025-02-28)


### Features

* add EntityDtoo ([d6dc334](https://github.com/buka-inc/npm.nestjs-type-helper/commit/d6dc334f5561757198bc2df71cc69a4a41b6ef9d))


### Bug Fixes

* export IQueryOperator and IFilterQuery types and fix ts type error ([dc5f927](https://github.com/buka-inc/npm.nestjs-type-helper/commit/dc5f927481a1ee4d502fb091cf5172998255d6ba))

## [1.1.0](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.0.2...v1.1.0) (2025-02-28)


### Features

* add mutiple entity decorators and enhance MikroORM support ([36cc35a](https://github.com/buka-inc/npm.nestjs-type-helper/commit/36cc35a10e241307e2ca9512e489fab7bd7bd7b8))
* add OrderQuery decorator ([6e9917f](https://github.com/buka-inc/npm.nestjs-type-helper/commit/6e9917f1838edf0d11573f95c9336eb7ecbec557))


### Bug Fixes

* add example to EntityProperty ([2a616bb](https://github.com/buka-inc/npm.nestjs-type-helper/commit/2a616bb5e9e03d4dec41148542578d536c6cc4d2))

## [1.0.2](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.0.1...v1.0.2) (2025-02-21)


### Bug Fixes

* primary key type is wrong and missing swagger decorator ([23c008f](https://github.com/buka-inc/npm.nestjs-type-helper/commit/23c008f07585899337bbba7e86f227f87f641a77))


### Performance Improvements

* add forceObject config to BaseEntity ([0427e15](https://github.com/buka-inc/npm.nestjs-type-helper/commit/0427e150dcf9b51cdacf199c9d911eca2b3f7728))

## [1.0.1](https://github.com/buka-inc/npm.nestjs-type-helper/compare/v1.0.0...v1.0.1) (2025-02-18)


### Bug Fixes

* wrong repo in package.json ([a6f543e](https://github.com/buka-inc/npm.nestjs-type-helper/commit/a6f543eedf92ca72b145339c095f101d8a49839b))

## 1.0.0 (2025-02-18)


### Features

* first commit ([638d7da](https://github.com/buka-inc/npm.nestjs-type-helper/commit/638d7dacb47b4d09b68d3796904c50fd076a2eca))
