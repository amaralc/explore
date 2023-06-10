//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { composePlugins, withNx } = require('@nx/next');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  images: {
    remotePatterns: [
      {
        hostname: 'github.com',
      },
      {
        hostname: 'avatars.githubusercontent.com',
      },
    ],
    domains: ['github.com', 'avatars.githubusercontent.com'],
  },
};

// @ts-ignore: Add types for nextra
const withNextra = require('nextra')({
  theme: 'nextra-theme-docs',
  themeConfig: './theme.config.tsx',
  // options
  flexsearch: true,
  staticImage: true,
  defaultShowCopyCode: true,
});

const plugins = [
  withNextra,
  withNx,
  // Add more Next.js plugins to this list if needed.
];

module.exports = composePlugins(...plugins)(nextConfig);
