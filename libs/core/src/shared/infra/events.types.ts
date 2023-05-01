export interface IHeaders {
  [key: string]: Buffer | string | (Buffer | string)[] | undefined;
}

interface IMessageSetEntry {
  key: Buffer | null;
  value: Buffer | null;
  timestamp: string;
  attributes: number;
  offset: string;
  size: number;
  headers?: never;
}

interface IRecordBatchEntry {
  key: Buffer | null;
  value: Buffer | null;
  timestamp: string;
  attributes: number;
  offset: string;
  headers: IHeaders;
  size?: never;
}

export type IKafkaMessage = IMessageSetEntry | IRecordBatchEntry;

export interface ISimplifiedProducerRecord {
  topic: string;
  messages: Array<{ key: string; value: string }>;
}

export type ITransporter =
  | 'nestjs-default-kafka-transporter'
  | 'nestjs-custom-kafka-transporter'
  | 'simple-kafka-transporter';

export type IEventsProvider = 'kafka' | 'in-memory';

export enum ICompressionTypes {
  None = 0,
  GZIP = 1,
  Snappy = 2,
  LZ4 = 3,
  ZSTD = 4,
}

export interface IMessage {
  key?: Buffer | string | null;
  value: Buffer | string | null;
  partition?: number;
  headers?: IHeaders;
  timestamp?: string;
}
export interface IProducerRecord {
  topic: string;
  messages: IMessage[];
  acks?: number;
  timeout?: number;
  compression?: ICompressionTypes;
}

export type IPayload = Array<{
  topic: string;
  attributes: number;
  messages: Array<{
    key: string;
    value: string;
  }>;
}>;

export interface IRetryOptions {
  maxRetryTime?: number;
  initialRetryTime?: number;
  factor?: number;
  multiplier?: number;
  retries?: number;
  restartOnFailure?: (e: Error) => Promise<boolean>;
}

export type IPartitionMetadata = {
  partitionErrorCode: number;
  partitionId: number;
  leader: number;
  replicas: number[];
  isr: number[];
  offlineReplicas?: number[];
};

export interface IPartitionerArgs {
  topic: string;
  partitionMetadata: IPartitionMetadata[];
  message: IMessage;
}

export type ICustomPartitioner = () => (args: IPartitionerArgs) => number;
export interface ProducerConfig {
  createPartitioner?: ICustomPartitioner;
  retry?: IRetryOptions;
  metadataMaxAge?: number;
  allowAutoTopicCreation?: boolean;
  idempotent?: boolean;
  transactionalId?: string;
  transactionTimeout?: number;
  maxInFlightRequests?: number;
}

export type IProducerOptions = {
  // requireAcks: number; // TODO: refactor other services that pass this parameter unecessaryly
  // ackTimeoutMs: number; // TODO: refactor other services that pass this parameter unecessaryly
  idempotent: boolean;
  transactionalId: string;
  clientId: string;
};

export interface IEachMessagePayload {
  topic: string;
  partition: number;
  message: IKafkaMessage;
  heartbeat(): Promise<void>;
  pause(): () => void;
}

export type ITopicSubscribers = {
  [topic: string]: (payload: Pick<IEachMessagePayload, 'message' | 'partition' | 'topic'>) => Promise<void>;
};

export type IConsumerGroupInstanceTopics = Record<string, any> | undefined;
export type IConsumerGroupOptions = {
  kafkaHost: string;
  clientId: string;
  groupId: string;
};

export type ICallback = (topic: string, partition: number, message: IKafkaMessage) => Promise<void>;
