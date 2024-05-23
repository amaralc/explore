import { IMultiUnitV1Dto } from './entity';

export const multiUnitsV1Fixtures: Array<IMultiUnitV1Dto> = [
  {
    id: 1,
    instituicao_id: 1,
    nome: 'Fake Unit 1',
    sigla: 'FU1',
  },
  {
    id: 2,
    instituicao_id: 2,
    nome: 'Fake Unit 2',
    sigla: 'FU2',
  },
  {
    id: 3,
    instituicao_id: 1,
    nome: 'Fake Unit 3',
    sigla: 'FU3',
  },
];
