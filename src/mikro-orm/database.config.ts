import { ToNumber } from '@buka/class-transformer-extra'
import { IsBoolean, IsNumber, IsString } from 'class-validator'

import * as R from 'ramda'
import * as util from 'util'
import { Migrator } from '@mikro-orm/migrations'
import { FlushMode, Options } from '@mikro-orm/core'
import { BadRequestException } from '@nestjs/common'


export class DatabaseConfig {
  @IsBoolean()
  debug = false

  @IsBoolean()
  migration: boolean = false

  @IsString()
  dbName!: string

  @IsString()
  host!: string

  @ToNumber()
  @IsNumber({ allowNaN: false })
  port!: number

  @IsString()
  user!: string

  @IsString()
  password!: string

  @IsString()
  timezone? = '+08:00'

  toMikroOrmOptions(): Options {
    let options: Options = {
      host: this.host,
      port: this.port,
      user: this.user,
      password: this.password,
      dbName: this.dbName,
      debug: this.debug,
      timezone: this.timezone,

      flushMode: FlushMode.COMMIT,
      serialization: {
        forceObject: true,
      },

      findOneOrFailHandler: (entityName, where) => new BadRequestException(`Cannot find ${entityName} where ${util.inspect(where)}`),
    }

    if (this.migration) {
      options = R.mergeDeepRight(options, {
        extensions: [Migrator],
        migrations: {
          snapshotName: 'snapshot',
          path: 'migrations',
          fileName: (timestamp) => `migration-${timestamp}`,
        },
      } satisfies Options)
    }

    return options
  }
}
