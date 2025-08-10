import {
  Accordion,
  AppShell,
  Blockquote,
  Box,
  Burger,
  Group,
  HoverCard,
  Rating,
  ScrollArea,
  Stack,
  Text,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useRef, useState } from 'react';
import { CladogramChart } from './CladogramChart';
import CladogramCSVDownloader from './CladogramCsvDownloader';
import { CsvCladogramNodeUploader } from './CsvCladogramNodeUploader';
import { FoldingTreeStructure } from './FoldingTreeStructure';
import { LabeledStars } from './LabeledStars';
import { ToggleBranchLengthButton } from './ToggleBranchLengthButton';
import { TogglePropertyButton } from './TogglePropertyButton';
import { ICladogramNode } from './entity.schema.types';

export const CladogramPage = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [showBranchLength, setShowBranchLength] = useState<boolean>(false);
  const [showRadarChart, setShowRadarChart] = useState<boolean>(false);
  const [validCladogramNode, setValidCladogramNode] = useState<ICladogramNode | null>(null);
  const [selectedSkill, setSelectedSkill] = useState<string | null>(null);
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);

  const selectChartElement = () => {
    return ref.current;
  };

  const toggleBranchLength = () => {
    setShowBranchLength(!showBranchLength);
  };

  const toggleRadarChart = () => {
    setShowRadarChart(!showRadarChart);
  };

  return (
    <AppShell
      header={{ height: 80 }}
      navbar={{
        width: 450,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <Text size="sm" mx="auto">
            <h1>Skill Set Cladogram {validCladogramNode && '- ' + validCladogramNode.name}</h1>
          </Text>
        </Group>
      </AppShell.Header>
      <AppShell.Navbar>
        <AppShell.Section>
          <Accordion defaultValue="Menu">
            <Accordion.Item key={'menu'} value={'menu'}>
              <Accordion.Control>
                <Box mr={'md'}>
                  <CsvCladogramNodeUploader setJsonCladogramContent={setValidCladogramNode} />
                </Box>
              </Accordion.Control>
              <Accordion.Panel>
                <Stack justify="flex-start" align="center" gap="md">
                  <TogglePropertyButton
                    togglePropertyCallback={toggleRadarChart}
                    propertyArray={['Hide Cladogram', 'Show Cladogram']}
                  />
                  <ToggleBranchLengthButton toggleBranchLength={toggleBranchLength} />
                  <CladogramCSVDownloader node={validCladogramNode} />
                </Stack>
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </AppShell.Section>
        {validCladogramNode && (
          <AppShell.Section grow component={ScrollArea} p={'md'}>
            <FoldingTreeStructure cladogramNode={validCladogramNode} />
          </AppShell.Section>
        )}
      </AppShell.Navbar>
      {validCladogramNode && (
        <AppShell.Main>
          <Blockquote
            color="blue"
            styles={{
              root: {
                display: 'flex',
                flexDirection: 'column',
                alignContent: 'center',
                textAlign: 'center',
              },
            }}
            cite={
              <>
                <Text>{selectedSkill || '-'}</Text>
                <HoverCard shadow="md">
                  <HoverCard.Target>
                    <Rating defaultValue={3} mt={'md'} size={'md'} m={'auto'} />
                  </HoverCard.Target>
                  <HoverCard.Dropdown>
                    <LabeledStars />
                  </HoverCard.Dropdown>
                </HoverCard>
              </>
            }
          >
            <Text>Life is like an npm install – you never know what you are going to get.</Text>
          </Blockquote>

          <Box my="md" mx="auto">
            <div id="cladogram-chart" ref={ref} />

            <CladogramChart
              node={validCladogramNode}
              selectChartElement={selectChartElement}
              showBranchLength={showBranchLength}
              showRadarChart={showRadarChart}
              handleSelectedSkill={setSelectedSkill}
              ref={ref}
            />
          </Box>
        </AppShell.Main>
      )}
    </AppShell>
  );
};
