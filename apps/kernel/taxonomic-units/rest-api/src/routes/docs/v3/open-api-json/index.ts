import express from 'express';
import { GetOpenApiV3SpecUseCase } from './use-case';

export default class OpenApiV3Controller {
  public async getOpenApiV3JsonSpecification(req: express.Request, res: express.Response) {
    try {
      const getOpenApiV3UseCase = new GetOpenApiV3SpecUseCase();
      const openApiV3JsonSpec = getOpenApiV3UseCase.execute();
      res.json(openApiV3JsonSpec);
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  }
}
