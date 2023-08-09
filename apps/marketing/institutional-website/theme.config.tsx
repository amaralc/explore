import { useRouter } from 'next/router';

const Logo = ({ height }: { height: number }) => <strong>Peerlab</strong>;

const FooterEditLink = () => {
  const { route } = useRouter();
  if (route.includes('/showcases/')) {
    return null;
  }
  return 'Edit this page on GitHub';
};

const themeConfig = {
  project: {
    link: 'https://github.com/amaralc/peerlab/blob/production/apps/marketing/institutional-website',
  },
  logo: <Logo height={48} />,
  docsRepositoryBase: 'https://github.com/amaralc/peerlab/blob/production/apps/marketing/institutional-website',
  projectLink: 'https://github.com/amaralc/peerlab',
  search: true,
  titleSuffix: '',
  unstable_flexsearch: true,
  unstable_faviconGlyph: '⚫️',
  floatTOC: true,
  head: ({ title, meta }: { title: string; meta: { description: string | undefined } }) => {
    const ogImage = 'https://repository-images.githubusercontent.com/429536908/62a4e686-8613-4b45-b7bb-fa35b558ae8e';

    return (
      <>
        <meta name="msapplication-TileColor" content="#ffffff" />
        <meta httpEquiv="Content-Language" content="en" />
        <meta name="description" content={meta?.description || 'A 5kB WebGL globe library.'} />
        <meta name="og:description" content={meta?.description || 'A 5kB WebGL globe library.'} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:site" content="@shuding_" />
        <meta name="twitter:image" content={ogImage} />
        <meta name="og:title" content={title ? title + ' – COBE' : 'COBE'} />
        <meta name="og:image" content={ogImage} />
        <meta name="apple-mobile-web-app-title" content="COBE" />
      </>
    );
  },
  footerText: ({ locale }: { locale: string }) => {
    return (
      <p className="no-underline text-current font-semibold">
        Made by{' '}
        <a href="https://twitter.com/shuding_" target="_blank" rel="noopener" className="no-underline font-semibold">
          @shuding_
        </a>
        , deployed on{' '}
        <a
          href="https://vercel.com/?utm_source=cobe"
          target="_blank"
          rel="noopener"
          className="no-underline font-semibold"
        >
          Vercel
        </a>
        .
      </p>
    );
  },
  footerEditLink: <FooterEditLink />,
  gitTimestamp: false,
};

export default themeConfig;
