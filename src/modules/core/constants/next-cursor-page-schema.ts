export const NextCursorPageSchema = {
  type: 'object',
  properties: {
    after: { type: 'string' },
    first: { type: 'number' },
  },
  required: ['first'],
  additionalProperties: false,
}
