import { CustomError } from 'ts-custom-error'


export class Exception extends CustomError {
  constructor(message: string) {
    super(`[@buka/nestjs] ${message}`)

    Object.defineProperty(this, 'name', { value: 'Exception' })
  }
}
