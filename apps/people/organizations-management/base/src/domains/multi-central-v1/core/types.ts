export interface IUnidade {
  id: number;
  instituicao_id: number;
  unidade_id?: number;
  nome: string;
  sigla?: string;
}

export interface IEndereco {
  id: number;
  internacional: boolean;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: null | string;
  bairro: string;
  cidade: string;
  estado: Estado;
  pais: Pais;
}

export enum Estado {
  Rj = 'RJ',
  SP = 'SP',
}

export enum Pais {
  Brasil = 'Brasil',
}

export interface IFoto {
  id: number;
  nome_original: string;
  nome_final: string;
  path: string;
  encoding: Encoding;
  mimetype: Mimetype;
  tamanho: number;
}

export enum Encoding {
  The7Bit = '7bit',
}

export enum Mimetype {
  ImageJPEG = 'image/jpeg',
  ImagePNG = 'image/png',
}

export interface IInstituicao {
  id: number;
  nome: Nome;
  sigla: Sigla;
  documento_institucional: IDocumentoInstitucional | null;
  link_numero_patrimonio: null | string;
}

export enum IDocumentoInstitucional {
  NúmeroUSP = 'Número USP',
  RegistroFuncionalNúmeroDeMatrícula = 'Registro Funcional/Número de matrícula',
}

export enum Nome {
  HospitalDasClínicasFMUSP = 'Hospital das Clínicas - FMUSP',
  InstitutoDePesquisasEnergéticasENucleares = 'Instituto de Pesquisas Energéticas e Nucleares',
  UniversidadeDeSãoPaulo = 'Universidade de São Paulo',
  UniversidadeEstadualDeCampinhas = 'Universidade Estadual de Campinhas',
  UniversidadeEstadualPaulista = 'Universidade Estadual Paulista',
  UniversidadeFederalDeSãoPaulo = 'Universidade Federal de São Paulo',
}

export enum Sigla {
  Hcfmusp = 'HCFMUSP',
  Ipen = 'IPEN',
  Unesp = 'UNESP',
  Unicamp = 'Unicamp',
  Unifesp = 'UNIFESP',
  Usp = 'USP',
}

export interface IMultiCentralV1 {
  id: number;
  instituicao_id: number;
  unidade_id: number;
  departamento_id: number | null;
  nome: string;
  sigla: string;
  site: null | string;
  email: string;
  telefone1: string;
  telefone2: null | string;
  endereco_id: number | null;
  como_chegar: null | string;
  sobre: null | string;
  horario_atendimento: null | string;
  observacoes: null | string;
  tesouraria: boolean;
  passo_atual: number;
  central_status_id: number;
  foto_arquivo_id: number | null;
  created: Date;
  created_by: number;
  updated: Date;
  updated_by: number;
  deleted: null;
  instituicao: IInstituicao;
  unidade: IUnidade;
  departamento: IUnidade | null;
  foto: IFoto | null;
  endereco: IEndereco | null;
}
