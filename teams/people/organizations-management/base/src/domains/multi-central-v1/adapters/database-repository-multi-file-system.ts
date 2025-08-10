import { readJsonFile } from '@peerlab/kernel/shared-ts-utils/files/read-json-file';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { MultiCentralsV1DatabaseRepository } from '../core/database-repository';
import { MultiCentralV1Entity } from '../core/entity';
import { IMultiCentralV1Dto } from '../core/entity.schema.types';

export class FileSystemMultiCentralsV1Repository implements MultiCentralsV1DatabaseRepository {
  constructor(
    private readonly multiCentralsV1JsonFilePath = 'teams/people/organizations-management/base/src/domains/_shared/core/use-cases/extract-entities-from-external-source/fixtures/multi-centrals-v1-response-body.json',
  ) {}

  public async listAll(): Promise<Array<IMultiCentralV1Dto>> {
    const log: ILogMetadata = {
      steps: [],
      scope: {
        moduleName: FileSystemMultiCentralsV1Repository.name,
        methodName: 'listAll',
      },
    };

    try {
      log.steps.push({ message: 'Listing multi centrals from external multi source...' });
      const multiCentralsV1Response = readJsonFile(this.multiCentralsV1JsonFilePath) as {
        count: number;
        rows: Array<IMultiCentralV1Dto>;
      };

      const multiInstitutionsV1 = multiCentralsV1Response.rows;

      log.steps.push({ message: 'Validating multi centrals...' });
      const multiCentralsV1DtoList = multiInstitutionsV1.map((item) => {
        const entity = new MultiCentralV1Entity(item);
        return entity.getDto();
      });

      const uniqueIds = new Set(multiCentralsV1DtoList.map((item) => item.id));
      if (uniqueIds.size !== multiCentralsV1DtoList.length) {
        throw new Error('Duplicate IDs found in centrals data');
      }

      const multiCentralsV1ByAcronym = multiCentralsV1DtoList.reduce((acc, item) => {
        acc[item.sigla] = acc[item.sigla] + 1 || 1;
        return acc;
      }, {});

      log.steps.push({
        message: 'Listing centrals from external source...',
        metadata: {
          count: multiCentralsV1DtoList.length,
          centralsByAcronym: multiCentralsV1ByAcronym,
        },
      });

      winstonLogger.info('Success listing multi centrals from external source', log);
      return multiCentralsV1DtoList;
    } catch (error) {
      log.steps.push({
        message: 'Error reading multi centrals from external source.',
        metadata: { error: error.stack },
      });
      winstonLogger.error(`Error reading multi centrals from external source: ${error.message}`, log);
    }
  }
}
