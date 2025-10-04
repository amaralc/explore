import { PeerEntity } from '@peerlab/researchers/peers/core/domains/peers/entities/peer/entity';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../../../data';
import { fetchPeers } from '../../store/peers-slice';
import { SubjectsTagsList } from './subjects-tags-list';

export const PeersList = () => {
  const dispatch = useAppDispatch();
  const peersEntities = useAppSelector((state) => state.peers.entities);
  const peersList = Object.entries(peersEntities).map(([key, peer]) => peer) as PeerEntity[];

  // TODO: avoid duplicate renders (this is currently being executed twice in the client side)
  useEffect(() => {
    dispatch(fetchPeers());
  }, [dispatch]);

  return (
    <ul>
      {peersList.map((peer) => (
        <li key={peer.id}>
          <a href={`/peer/${peer.username}`} target="_blank" rel="noopener noreferrer" data-test-id="peer-name">
            <p>{peer.name}</p>
          </a>
          <SubjectsTagsList subjects={peer.subjects} />
        </li>
      ))}
    </ul>
  );
};
