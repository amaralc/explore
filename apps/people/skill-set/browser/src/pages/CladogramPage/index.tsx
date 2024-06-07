import { Blockquote, Box, Grid, Text } from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons-react';
import { useRef, useState } from 'react';
import { Layout } from '../../components/shared/Layout';
import { CladogramChart } from './CladogramChart';
import { JsonCladogramNodeUploader } from './JsonCladogramNodeUploader';
import { ICladogramNode } from './JsonCladogramNodeUploader/types';
import { ToggleBranchLengthButton } from './ToggleBranchLengthButton';
import defaultJsonCladogramNode from './valid-cladogram-nodes.json';

export const CladogramPage = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const icon = <IconInfoCircle />;
  const [showBranchLength, setShowBranchLength] = useState<boolean>(false);
  const [validCladogramNode, setValidCladogramNode] = useState<ICladogramNode | null>(defaultJsonCladogramNode);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);

  const selectChartElement = () => {
    return ref.current;
  };

  const toggleBranchLength = () => {
    setShowBranchLength(!showBranchLength);
  };

  return (
    <Layout>
      <Box>
        <h1>Skill Set Cladogram {validCladogramNode && '- ' + validCladogramNode.name}</h1>
        <Grid grow flex={1}>
          <Grid.Col span={9}>
            <JsonCladogramNodeUploader setJsonCladogramContent={setValidCladogramNode} />
          </Grid.Col>
          <Grid.Col span={3}>
            <ToggleBranchLengthButton toggleBranchLength={toggleBranchLength} />
          </Grid.Col>
        </Grid>
        <Blockquote color="blue" cite={selectedSkill} icon={icon} my="md">
          Life is like an npm install – you never know what you are going to get.
        </Blockquote>
      </Box>
      <Box mb="md">
        <Text size="sm">
          ⭐ I've heard about it
          <br />⭐ ⭐ I kind of know it but currently struggle with that
          <br />⭐ ⭐ ⭐ I know my way around it, and could learn more if I fell its necessary.
          <br />⭐ ⭐ ⭐ ⭐ I am good at it and understand it deeply, but would have a hard time explaining it in
          detail.
          <br />⭐ ⭐ ⭐ ⭐ ⭐ I'm great at it. I understand it deeply, practice and mentor others on a daily basis
        </Text>
      </Box>
      <div id="cladogram-chart" ref={ref} />
      {validCladogramNode && (
        <CladogramChart
          node={validCladogramNode}
          selectChartElement={selectChartElement}
          showBranchLength={showBranchLength}
          handleSelectedSkill={setSelectedSkill}
          ref={ref}
        />
      )}
    </Layout>
  );
};
