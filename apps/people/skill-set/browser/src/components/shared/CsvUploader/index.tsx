import React, { ChangeEvent, useState } from 'react';

interface CSVRow {
  [key: string]: string | number;
}

interface CsvUploaderProps {
  validateCsv: (csvData: any[]) => boolean;
  storeValidCsv: (csvData: any[]) => void;
}

const CsvUploader: React.FC<CsvUploaderProps> = ({ validateCsv, storeValidCsv }: CsvUploaderProps) => {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleFileUpload = () => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && typeof e.target.result === 'string') {
          const text = e.target.result;
          const data = parseCSV(text);
          const isValidCsv = validateCsv(data);
          if (isValidCsv) {
            storeValidCsv(data);
          }
        }
      };
      reader.readAsText(file);
    }
  };

  const parseCSV = (text: string): CSVRow[] => {
    const lines = text.split('\n');
    const headers = lines[0].split(',');
    return lines.slice(1).map((line) => {
      const values = line.split(',');
      return headers.reduce((obj, header, index) => {
        const value = values[index];
        if (Number.isNaN(Number(value))) {
          obj[header] = value;
          return obj;
        }

        obj[header] = Number(value);
        return obj;
      }, {} as CSVRow);
    });
  };

  return (
    <div>
      <input type="file" accept=".csv" onChange={handleFileChange} />
      <button onClick={handleFileUpload}>Upload CSV</button>
    </div>
  );
};

export default CsvUploader;
