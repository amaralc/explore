import { OpenApiV3Entity } from './entity';

export class GetOpenApiV3SpecUseCase {
  execute() {
    const openApiV3Entity = new OpenApiV3Entity();
    const openApiV3Spec = openApiV3Entity.getSpec();
    return openApiV3Spec;
  }
}
