import cn from 'classnames';
import type { Author } from '../content/team';
import { PEERLAB_TEAM } from '../content/team';
import { Avatar } from './Avatar';

export function Authors({ authors }: { authors: Array<Author> }) {
  const validAuthors = authors.filter((author) => PEERLAB_TEAM[author]);
  return (
    <div className="w-full border-b border-gray-400 authors border-opacity-20">
      <div className={cn('flex flex-wrap py-8 mx-auto gap-7', authors.length > 4 && 'max-w-3xl')}>
        {validAuthors.map((username) => (
          <Avatar key={username} {...PEERLAB_TEAM[username]} />
        ))}
      </div>
    </div>
  );
}
