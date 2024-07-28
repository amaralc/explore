import { Button } from '@mantine/core';
import { IconDownload } from '@tabler/icons-react';
import { saveAs } from 'file-saver';
import Papa from 'papaparse';
import { useEffect, useState } from 'react';
import { ICladogramNode } from '../types';

const CladogramCSVDownloader = ({ node }: { node: ICladogramNode | null }) => {
  const [csvData, setCsvData] = useState<string | null>(null);

  useEffect(() => {
    const getMaxDepth = (currentNode: ICladogramNode): number => {
      if (!currentNode.branchset || currentNode.branchset.length === 0) {
        return 1;
      }
      return 1 + Math.max(...currentNode.branchset.map(getMaxDepth));
    };

    if (node) {
      const rows: string[][] = [];
      const maxDepth = getMaxDepth(node);

      const traverseNode = (currentNode: ICladogramNode, path: string[]) => {
        const currentPath = [...path, currentNode.name];
        if (!currentNode.branchset || currentNode.branchset.length === 0) {
          if (currentNode.stars !== undefined) {
            // Fill missing levels with empty strings
            const row = [
              ...currentPath,
              ...Array(maxDepth - currentPath.length).fill(''),
              currentNode.stars.toString(),
            ];
            rows.push(row);
          }
        } else {
          currentNode.branchset.forEach((childNode) => traverseNode(childNode, currentPath));
        }
      };

      traverseNode(node, []);

      // Create the header dynamically based on the max depth
      const headers = Array.from({ length: maxDepth }, (_, i) => `level${i}`).concat('stars');
      const csvContent = Papa.unparse({
        fields: headers,
        data: rows,
      });
      setCsvData(csvContent);
    }
  }, [node]);

  const handleDownload = () => {
    if (csvData) {
      const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
      saveAs(blob, 'cladogram.csv');
    }
  };

  return (
    <Button rightSection={<IconDownload size={14} />} onClick={handleDownload} disabled={!csvData} fullWidth>
      Download
    </Button>
  );
};

export default CladogramCSVDownloader;
