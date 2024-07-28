import { FileInput, rem } from '@mantine/core';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { IconCsv } from '@tabler/icons-react';
import { ErrorObject } from 'ajv';
import Papa from 'papaparse';
import React, { useState } from 'react';
import { ICladogramNode, nodeSchema } from '../types';

interface ICsvCladogramNodeUploaderProps {
  setJsonCladogramContent: (node: ICladogramNode) => void;
}

type IFileData = { [key: string]: string; stars: string };

export const CsvCladogramNodeUploader: React.FC<ICsvCladogramNodeUploaderProps> = ({ setJsonCladogramContent }) => {
  const icon = <IconCsv style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
  const [value, setValue] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ErrorObject<string, Record<string, any>, unknown>[] | null>(
    null,
  );

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setValue(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        Papa.parse<IFileData>(e.target?.result as string, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            try {
              const json = convertCsvToCladogramNode(results.data);
              const { errors, isValid } = schemaValidator.validate(nodeSchema, json);
              if (isValid) {
                setJsonCladogramContent(json);
                setValidationErrors(null);
              } else {
                alert('Invalid file structure. Please upload a valid CSV file.');
                setValidationErrors(errors);
              }
            } catch (error) {
              if (error instanceof Error) {
                alert(`Error parsing CSV file: + ${error.stack}`);
              }
              alert(`Error parsing CSV file`);
            }
          },
        });
      };
      reader.readAsText(file);
    }
  };

  const convertCsvToCladogramNode = (data: Array<{ [key: string]: string; stars: string }>): ICladogramNode => {
    const buildTree = (
      data: Array<{ [key: string]: string; stars: string }>,
      keys: string[],
      parentName = '',
    ): ICladogramNode[] => {
      if (keys.length === 0) return [];

      const currentKey = keys[0];
      const remainingKeys = keys.slice(1);
      const nodes: { [name: string]: Array<{ [key: string]: string; stars: string }> } = {};

      data.forEach((item) => {
        const nodeName = item[currentKey];
        if (nodeName) {
          if (!nodes[nodeName]) {
            nodes[nodeName] = [];
          }
          nodes[nodeName].push(item);
        }
      });

      return Object.entries(nodes).map(([name, group]) => {
        const stars = parseInt(group[0].stars, 10);
        return {
          name,
          length: 1,
          stars,
          branchset: buildTree(group, remainingKeys, name),
        };
      });
    };

    const rootNodes = buildTree(
      data,
      Object.keys(data[0]).filter((key) => key !== 'stars'),
    );

    if (rootNodes.length !== 1) {
      throw new Error('CSV data does not have a single root node');
    }

    return rootNodes[0];
  };

  return (
    <>
      <FileInput
        rightSection={icon}
        placeholder="Upload File"
        leftSectionPointerEvents="none"
        accept=".csv"
        value={value}
        onChange={handleFileUpload}
        w="100%"
      />
      {validationErrors && (
        <div>
          <h3>Errors:</h3>
          <pre>{JSON.stringify(validationErrors, null, 2)}</pre>
        </div>
      )}
    </>
  );
};
