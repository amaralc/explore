import createCache from '@emotion/cache';
import { CacheProvider } from '@emotion/react';
import type { FC } from 'react';
import { useEffect } from 'react';
import stylisRTLPlugin from 'stylis-plugin-rtl';
import { ITextDirectionRightToLeftProps } from './text-direction-right-to-left.types';

const styleCache = () => {
  return createCache({
    key: 'rtl',
    prepend: true,
    stylisPlugins: [stylisRTLPlugin],
  });
};

export const TextDirectionRightToLeft: FC<ITextDirectionRightToLeftProps> = (props) => {
  const { children, direction = 'ltr' } = props;

  useEffect(() => {
    document.dir = direction;
  }, [direction]);

  if (direction === 'rtl') {
    return <CacheProvider value={styleCache()}>{children}</CacheProvider>;
  }

  return <>{children}</>;
};
