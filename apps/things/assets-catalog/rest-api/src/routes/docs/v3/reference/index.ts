import { apiReference } from '@scalar/express-api-reference';
import { GetOpenApiV3SpecUseCase } from '../open-api-json/use-case';

export default class ApiReferenceController {
  public getApiReference = apiReference({
    spec: {
      content: GetOpenApiV3SpecUseCase.execute(),
    },
  });
}
