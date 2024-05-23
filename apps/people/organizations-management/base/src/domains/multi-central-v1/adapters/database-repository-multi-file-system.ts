import { readJsonFile } from '@peerlab/kernel/shared-ts-utils/files/read-json-file';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { nativeLogger } from '@peerlab/kernel/shared-ts-utils/logs/native-logger';
import { MultiCentralsV1DatabaseRepository } from '../core/database-repository';
import { IMultiCentralV1Dto, MultiCentralV1Entity } from '../core/entity';

export class FileSystemMultiCentralsV1Repository implements MultiCentralsV1DatabaseRepository {
  private multiCentralsV1FilePath =
    'apps/people/organizations-management/base/src/domains/multi-central-v1/core/fixtures-content-multi-centrals.json';

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
      const multiCentralsV1Response = readJsonFile(this.multiCentralsV1FilePath) as {
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

      nativeLogger.info('Success listing agents from external source', log);
      return multiCentralsV1DtoList;
    } catch (error) {
      log.steps.push({
        message: 'Error reading multi centrals from external source.',
        metadata: { error: error.stack },
      });
      nativeLogger.error(`Error reading multi centrals from external source: ${error.message}`, log);
    }
  }
}
