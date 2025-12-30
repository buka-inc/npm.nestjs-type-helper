export const InternalServerErrorResponses = {
  status: 500,
  description: '系统异常',
  schema: {
    type: 'object',
    properties: {
      statusCode: { type: 'number', example: 500 },
      message: { type: 'string', example: 'Internal Server Error' },
    },
  },
}
