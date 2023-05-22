//@ts-check

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { withNx } = require('@nx/next/plugins/with-nx');

/**
 * @type {import('@nx/next/plugins/with-nx').WithNxOptions}
 **/
const nextConfig = {
  nx: {
    // Set this to true if you would like to use SVGR
    // See: https://github.com/gregberge/svgr
    svgr: false,
  },
  trailingSlash: false,
  /**
   * Page Extensions
   *
   * https://github.com/vercel/next.js/issues/3728#issuecomment-895568757
   * https://nextjs.org/docs/api-reference/next.config.js/custom-page-extensions
   */
  pageExtensions: ['page.tsx', 'page.ts', 'page.jsx', 'page.js', 'page.md', 'page.mdx'],
};

module.exports = withNx(nextConfig);
