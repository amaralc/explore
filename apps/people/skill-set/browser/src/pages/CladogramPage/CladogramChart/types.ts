import { Static, Type } from '@sinclair/typebox';

export const nodeSchema = Type.Recursive((node) =>
  Type.Object({
    name: Type.String({
      description: 'The name of the node.',
    }),
    length: Type.Number({
      description: 'The length property of the node.',
    }),
    branchset: Type.Array(node, {
      description: 'Array of child nodes.',
    }),
  }),
);

export type INode = Static<typeof nodeSchema>;

export const flatNodeSchema = Type.Object({
  id: Type.Union([Type.Number(), Type.String()], {
    description: 'The unique identifier for the node, which can be a number or a string.',
  }),
  parentId: Type.Union([Type.Number(), Type.String(), Type.Null()], {
    description: 'The identifier of the parent node, which can be a number, a string, or null if the node is a root.',
  }),
  name: Type.String({
    description: 'The name of the node.',
  }),
  length: Type.Number({
    description: 'The length property of the node.',
  }),
});

export type FlatNode = Static<typeof flatNodeSchema>;

export const buildTree = (nodes: FlatNode[]): INode | null => {
  const nodeMap: { [key: number | string]: INode } = {};

  nodes.forEach((node) => {
    nodeMap[node.id] = { ...node, branchset: [] };
  });

  let root: INode | null = null;

  nodes.forEach((node) => {
    if (node.parentId === null) {
      root = nodeMap[node.id];
    } else {
      nodeMap[node.parentId].branchset.push(nodeMap[node.id]);
    }
  });

  return root;
};

const isValidFlatNode = (data: any): data is FlatNode => {
  return (
    typeof data.id === 'number' &&
    (typeof data.parentId === 'number' || data.parentId === null) &&
    typeof data.name === 'string' &&
    typeof data.length === 'number'
  );
};

const validateCSVData = (csvData: any[]): boolean => {
  return csvData.every(isValidFlatNode);
};
