import { store } from '@adapters/browser/data';
import createEmotionCache from '@adapters/browser/styles/create-emotion-cache';
import { CacheProvider, EmotionCache } from '@emotion/react';
import type { NextPage } from 'next';
import { AppProps } from 'next/app';
import { ReactElement, ReactNode } from 'react';
import { Provider } from 'react-redux';

// Client-side cache, shared for the whole session of the user in the browser
const clientSideEmotionCache = createEmotionCache();

// Use getLayout
type NextPageWithLayout = NextPage & {
  getLayout?: (page: ReactElement) => ReactNode;
};

type MyAppPropsWithLayout = AppProps & {
  Component: NextPageWithLayout;
  emotionCache?: EmotionCache;
};

const MyApp = ({
  Component,
  pageProps: { session, ...pageProps },
  emotionCache = clientSideEmotionCache,
}: MyAppPropsWithLayout): JSX.Element => {
  // Use the layout defined at the page level, if available
  const getLayout = Component.getLayout ?? ((page) => page);

  return (
    <CacheProvider value={emotionCache}>
      <Provider store={store}>{getLayout(<Component {...pageProps} />)}</Provider>
    </CacheProvider>
  );
};

export default MyApp;
