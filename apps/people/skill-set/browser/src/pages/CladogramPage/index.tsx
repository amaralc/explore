import { schemaValidator } from '@peerlab/kernel/shared-ts-utils/validators/json-schema-validator';
import { ErrorObject } from 'ajv';
import { useCallback, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import CsvUploader from '../../components/shared/CsvUploader';
import { CladogramChart } from './CladogramChart';
import { FlatNode, INode, flatNodeSchema } from './CladogramChart/types';

const node: INode = {
  name: 'Skills',
  length: 1.0,
  branchset: [
    {
      name: 'Soft Skills',
      length: 3.0,
      branchset: [],
    },
    {
      name: 'Technical Skills',
      length: 1.0,
      branchset: [],
    },
  ],
};

type IErrorsObjects = ErrorObject<string, Record<string, any>, unknown>[];

export const CladogramPage = () => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isValidCsv, setIsValidCsv] = useState<boolean>(false);
  const [validCsv, setValidCsv] = useState<any[]>([]);
  const [csv, setCsv] = useState<any[]>([]);
  const [csvErrors, setCsvErrors] = useState<Array<IErrorsObjects>>([]);

  const selectChartElement = () => {
    return ref.current;
  };

  const isValidFlatNode = useCallback(
    (data: any): data is FlatNode => {
      const { errors, isValid } = schemaValidator.validate(flatNodeSchema, data);
      if (!isValid) {
        setCsvErrors([...csvErrors, errors]);
      }
      return isValid;
    },
    [csvErrors],
  );

  const validateCSVData = (csvData: any[]): boolean => {
    setCsv(csvData);

    const csvDataIsValid = csvData.every(isValidFlatNode);
    if (!csvDataIsValid) {
      window.alert('Invalid CSV data');
      return false;
    }

    setIsValidCsv(csvDataIsValid);
    return true;
  };

  console.log('csvErrors', csvErrors);

  const storeValidCsv = (csvData: any[]) => {
    setValidCsv(csvData);
  };

  console.log(isValidCsv);

  return (
    <div>
      <h1>Cladogram</h1>
      <Link to="/">Click here to go back to root page.</Link>
      <hr />
      <CsvUploader validateCsv={validateCSVData} storeValidCsv={storeValidCsv} />
      <hr />
      {!isValidCsv && (
        <div>
          <p>Invalid CSV data</p>
          <p>{JSON.stringify(csv)}</p>
        </div>
      )}

      <div id="cladogram-chart" ref={ref} />
      {isValidCsv && <CladogramChart node={node} selectChartElement={selectChartElement} />}
      <CladogramChart node={node} selectChartElement={selectChartElement} ref={ref} />
    </div>
  );
};
