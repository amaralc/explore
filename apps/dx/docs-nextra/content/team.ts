export type AuthorDetails = {
  name: string;
  twitterUsername?: string;
  picture: string;
};

export const PEERLAB_TEAM: Record<string, AuthorDetails> = {
  amaralc: {
    name: 'Calil Amaral',
    twitterUsername: 'amaralc',
    picture: 'https://github.com/amaralc.png',
  },
};

export type Author = keyof typeof PEERLAB_TEAM;
