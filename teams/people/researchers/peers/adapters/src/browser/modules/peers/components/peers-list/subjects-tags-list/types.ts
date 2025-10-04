import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';

export interface ISubjectsTagListProps {
  subjects: PeerEntity['subjects'];
}
export type ISubjectsTagList = (props: ISubjectsTagListProps) => JSX.Element;
