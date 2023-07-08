// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require('prism-react-renderer/themes/github');
const darkCodeTheme = require('prism-react-renderer/themes/dracula');

// TODO: Wait for docusaurus typescript support
// Ref:https://github.com/easyops-cn/docusaurus-search-local/issues/328
/** @type {import('@docusaurus/types').PluginConfig} */
const searchLocalPluging = [
  require.resolve('@easyops-cn/docusaurus-search-local'),
  /** @type {import("@easyops-cn/docusaurus-search-local").PluginOptions} */
  //@ts-ignore: Wait for docusaurus typescript support
  ({
    // ... Your options.
    // `hashed` is recommended as long-term-cache of index file is possible.
    hashed: true,
    // For Docs using Chinese, The `language` is recommended to set to:
    // ```
    // language: ["en", "zh"],
    // ```
  }),
];

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Peerlab Developers',
  tagline: 'Connecting universities and companies to build the future',
  url: 'https://peerlab.com.br',
  baseUrl: '/',
  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',
  favicon: 'img/favicon.ico',
  organizationName: 'amaralc', // Usually your GitHub org/user name.
  projectName: 'docusaurus', // Usually your repo name.

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),
          // Please change this to your repo.
          editUrl: 'https://github.com/amaralc/peerlab/edit/production/apps/dx/dev-docs-browser/',
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl: 'https://github.com/amaralc/peerlab/edit/production/apps/dx/dev-docs-browser/',
        },
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themes: [searchLocalPluging],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      navbar: {
        title: 'Peerlab Developers',
        logo: {
          alt: 'Peerlab Developers Logo',
          src: 'img/logo.svg',
        },
        items: [
          {
            type: 'doc',
            docId: 'intro',
            position: 'left',
            label: 'Tutorial',
          },
          { to: '/blog', label: 'Blog', position: 'left' },
          {
            href: 'https://github.com/amaralc/peerlab',
            label: 'GitHub',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Docs',
            items: [
              {
                label: 'Tutorial',
                to: '/docs/learning/docusaurus/intro',
              },
            ],
          },
          {
            title: 'Community',
            items: [
              // {
              //   label: 'Stack Overflow',
              //   href: 'https://stackoverflow.com/questions/tagged/docusaurus',
              // },
              // {
              //   label: 'Discord',
              //   href: 'https://discordapp.com/invite/docusaurus',
              // },
              // {
              //   label: 'Twitter',
              //   href: 'https://twitter.com/docusaurus',
              // },
            ],
          },
          {
            title: 'More',
            items: [
              {
                label: 'Blog',
                to: '/blog',
              },
              {
                label: 'GitHub',
                href: 'https://github.com/amaralc/peerlab',
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} Peerlab.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
