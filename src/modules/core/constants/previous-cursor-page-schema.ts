export const PreviousCursorPageSchema = {
  type: 'object',
  properties: {
    before: { type: 'string' },
    last: { type: 'number' },
  },
  required: ['last'],
  additionalProperties: false,
}
