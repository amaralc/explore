import { FileInput, Grid, rem } from '@mantine/core';
import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { IconFile } from '@tabler/icons-react';
import { ErrorObject } from 'ajv';
import React, { useState } from 'react';
import { ICladogramNode, nodeSchema } from './types';

interface IJsonCladogramNodeUploaderProps {
  setJsonCladogramContent: (node: ICladogramNode) => void;
}

export const JsonCladogramNodeUploader: React.FC<IJsonCladogramNodeUploaderProps> = ({ setJsonCladogramContent }) => {
  const icon = <IconFile style={{ width: rem(18), height: rem(18) }} stroke={1.5} />;
  const [value, setValue] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ErrorObject<string, Record<string, any>, unknown>[] | null>(
    null,
  );

  const handleFileUpload = (file: File | null) => {
    if (file) {
      setValue(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const json = JSON.parse(e.target?.result as string);
          const { errors, isValid } = schemaValidator.validate(nodeSchema, json);
          if (isValid) {
            setJsonCladogramContent(json);
            setValidationErrors(null);
          } else {
            alert('Invalid file structure. Please upload a valid JSON file.');
            setValidationErrors(errors);
          }
        } catch (error) {
          alert('Error parsing JSON file.');
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <Grid>
      <Grid.Col span={12}>
        <FileInput
          leftSection={icon}
          placeholder="Upload a valid Cladogram node"
          leftSectionPointerEvents="none"
          accept=".json"
          value={value}
          onChange={handleFileUpload}
        />
      </Grid.Col>

      <Grid.Col span={12}>
        {validationErrors && (
          <div>
            <h3>Errors:</h3>
            <pre>{JSON.stringify(validationErrors, null, 2)}</pre>
          </div>
        )}
      </Grid.Col>
    </Grid>
  );
};
