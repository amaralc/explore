import { IMultiDepartmentV1Dto } from './entity';

export const multiDepartmentsV1Fixtures: Array<IMultiDepartmentV1Dto> = [
  {
    id: 1,
    instituicao_id: 1,
    unidade_id: 1,
    nome: 'Fake Department 1',
  },
  {
    id: 2,
    instituicao_id: 1,
    unidade_id: 2,
    nome: 'Fake Department 2',
  },
  {
    id: 3,
    instituicao_id: 2,
    unidade_id: 3,
    nome: 'Fake Department 3',
  },
];
