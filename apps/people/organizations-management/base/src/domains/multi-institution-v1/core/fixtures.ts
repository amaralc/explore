import { IMultiInstitutionV1Dto } from './entity';

export const multiInstitutionsV1Fixtures: Array<IMultiInstitutionV1Dto> = [
  {
    documento_institucional: null,
    id: 1,
    link_numero_patrimonio: 'https://fake-link-numero-patrimonio-1.com',
    nome: 'Fake Multi Institution 1',
    sigla: 'FMI1',
  },
  {
    documento_institucional: 'Fake Documento Institucional 2',
    id: 2,
    link_numero_patrimonio: 'https://fake-link-numero-patrimonio-2.com',
    nome: 'Fake Multi Institution 2',
    sigla: 'FMI2',
  },
  {
    documento_institucional: 'Fake Documento Institucional 3',
    id: 3,
    link_numero_patrimonio: 'https://fake-link-numero-patrimonio-3.com',
    nome: 'Fake Multi Institution 3',
    sigla: 'FMI3',
  },
];
