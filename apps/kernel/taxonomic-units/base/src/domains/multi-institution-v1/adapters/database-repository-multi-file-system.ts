import { readJsonFile } from '@peerlab/kernel/shared-ts-utils/files/read-json-file';
import { ILogMetadata } from '@peerlab/kernel/shared-ts-utils/logs/application-logger';
import { winstonLogger } from '@peerlab/kernel/shared-ts-utils/logs/winston-logger';
import { MultiInstitutionsV1DatabaseRepository } from '../core/database-repository';
import { MultiInstitutionV1Entity } from '../core/entity';
import { IMultiInstitutionV1Dto } from '../core/entity.schema.types';

export class FileSystemMultiInstitutionsV1Repository implements MultiInstitutionsV1DatabaseRepository {
  constructor(
    private readonly multiInstitutionsV1JsonFilePath = 'apps/kernel/taxonomic-units/base/src/domains/_shared/core/use-cases/extract-entities-from-external-source/fixtures/multi-institutions-v1-response-body.json',
  ) {}

  public async listAll(): Promise<Array<IMultiInstitutionV1Dto>> {
    const log: ILogMetadata = {
      steps: [],
      scope: {
        moduleName: FileSystemMultiInstitutionsV1Repository.name,
        methodName: 'listAll',
      },
    };

    try {
      log.steps.push({ message: 'Listing multi institutions from external multi source...' });
      const responseData = readJsonFile(this.multiInstitutionsV1JsonFilePath) as Array<IMultiInstitutionV1Dto>;

      log.steps.push({ message: 'Validating multi institutions...' });
      const multiInstitutionsV1DtoList = responseData.map((item) => {
        const entity = new MultiInstitutionV1Entity(item);
        return entity.getDto();
      });

      const uniqueIds = new Set(multiInstitutionsV1DtoList.map((item) => item.id));
      if (uniqueIds.size !== multiInstitutionsV1DtoList.length) {
        throw new Error('Duplicate IDs found in institutions data');
      }

      const multiInstitutionsV1ByAchronym = multiInstitutionsV1DtoList.reduce((acc, item) => {
        acc[item.sigla] = acc[item.sigla] + 1 || 1;
        return acc;
      }, {});

      log.steps.push({
        message: 'Listing multi institutions from external source...',
        metadata: {
          count: multiInstitutionsV1DtoList.length,
          institutionsByAchronym: multiInstitutionsV1ByAchronym,
        },
      });

      winstonLogger.info('Success listing multi institutions from external source', log);
      return multiInstitutionsV1DtoList;
    } catch (error) {
      log.steps.push({
        message: 'Error reading multi institutions from external source.',
        metadata: { error: error.stack },
      });
      winstonLogger.error(`Error seeding database from external source: ${error.message}`, log);
    }
  }
}
