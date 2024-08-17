import { Group, HoverCard, Rating, RenderTreeNodePayload, Tooltip, Tree, TreeNodeData } from '@mantine/core';
import { IconFile, IconFolder, IconFolderOpen, IconLeaf } from '@tabler/icons-react';
import { LabeledStars } from '../LabeledStars';
import { ICladogramNode } from '../entity.schema.types';

interface FileIconProps {
  name: string;
  isFolder: boolean;
  expanded: boolean;
}

const convertICladogramNodeToTreeNodeData = (node: ICladogramNode): TreeNodeData => {
  return {
    label: node.name,
    value: node.name,
    nodeProps: {
      length: node.length,
      stars: node.stars,
      description: node.description,
    },
    children: node.branchset.map(convertICladogramNodeToTreeNodeData),
  };
};

export const convertCladogramToTreeNodeArray = (cladogram: ICladogramNode): TreeNodeData[] => {
  return [cladogram].map(convertICladogramNodeToTreeNodeData);
};

function FileIcon({ name, isFolder, expanded }: FileIconProps) {
  if (!isFolder) {
    return <IconLeaf size={14} />;
  }

  if (name.endsWith('package.json')) {
    return <IconFile size={14} />;
  }

  if (name.endsWith('.ts') || name.endsWith('.tsx') || name.endsWith('tsconfig.json')) {
    return <IconFile size={14} />;
  }

  if (name.endsWith('.css')) {
    return <IconFile size={14} />;
  }

  if (isFolder) {
    return expanded ? (
      <IconFolderOpen color="var(--mantine-color-yellow-9)" size={14} stroke={2.5} />
    ) : (
      <IconFolder color="var(--mantine-color-yellow-9)" size={14} stroke={2.5} />
    );
  }

  return null;
}

function Leaf({ node, expanded, hasChildren, elementProps }: RenderTreeNodePayload) {
  return (
    <Group gap={5} {...elementProps}>
      <FileIcon name={node.value} isFolder={hasChildren} expanded={expanded} />
      <span>{node.label}</span>
      {!hasChildren && (
        <HoverCard shadow="md" position="right" offset={100}>
          <HoverCard.Target>
            <Rating defaultValue={0} size={'sm'} readOnly={hasChildren} />
          </HoverCard.Target>
          <HoverCard.Dropdown>
            <LabeledStars />
          </HoverCard.Dropdown>
        </HoverCard>
      )}
      {hasChildren && (
        <Tooltip label="Evaluate leaf level skills in order to see parent level results" withArrow multiline w={175}>
          <Rating defaultValue={0} size={'sm'} readOnly={hasChildren} fractions={10} />
        </Tooltip>
      )}
    </Group>
  );
}

export function FoldingTreeStructure({ cladogramNode }: { cladogramNode: ICladogramNode }) {
  const data = convertCladogramToTreeNodeArray(cladogramNode);

  return (
    <Tree
      // classNames={classes}
      selectOnClick
      clearSelectionOnOutsideClick
      data={data}
      renderNode={(payload) => <Leaf {...payload} />}
    />
  );
}
