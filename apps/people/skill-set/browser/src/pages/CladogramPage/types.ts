import { Static, Type } from '@sinclair/typebox';

export const nodeSchema = Type.Recursive((node) =>
  Type.Object(
    {
      name: Type.String({
        description: 'The name of the node.',
      }),
      length: Type.Number({
        description: 'The length property of the node.',
      }),
      stars: Type.Optional(
        Type.Number({
          description: 'A number between 1 and 5 representing the level expertise in the topic.',
          minimum: 0,
          maximum: 5,
        }),
      ),
      description: Type.Optional(
        Type.String({
          description: 'A detailed description of what is included in this skill.',
        }),
      ),
      branchset: Type.Array(node, {
        description: 'Array of child nodes.',
      }),
    },
    {
      additionalProperties: false,
    },
  ),
);

export type ICladogramNode = Static<typeof nodeSchema>;
