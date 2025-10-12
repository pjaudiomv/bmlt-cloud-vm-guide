import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'BMLT Cloud VM Guide',
  tagline: 'Complete guide for managing BMLT and YAP on Ubuntu cloud servers',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://vmdocs.pjbuilds.dev',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'pjaudiomv', // Usually your GitHub org/user name.
  projectName: 'bmlt-cloud-vm-guide', // Usually your repo name.

  onBrokenLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl:
            'https://github.com/pjaudiomv/bmlt-cloud-vm-guide/tree/main/docs/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/docusaurus-social-card.jpg',
    colorMode: {
      respectPrefersColorScheme: true,
    },
    metadata: [
      {name: 'algolia-site-verification', content: '56BFACB171992947'},
    ],
    // Algolia DocSearch configuration
    algolia: {
      // The application ID provided by Algolia
      appId: 'PH8HRF2VMO',
      // Public API key: it is safe to commit it
      apiKey: '14ed559458f59bb8bcc7ee29cbc0f71d',
      // The index name
      indexName: 'vmdocs_pjbuilds_dev_ph8hrf2vmo_pages',
      // Optional: see doc section below
      contextualSearch: true,
      // Optional: Algolia search parameters
      searchParameters: {},
      // Optional: path for search page that enabled by default (`false` to disable it)
      searchPagePath: 'search',
    },
    navbar: {
      title: 'BMLT Cloud VM Guide',
      logo: {
        alt: 'BMLT Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Guide',
        },
        {
          href: 'https://bmlt.app/',
          label: 'BMLT Project',
          position: 'right',
        },
        {
          href: 'https://github.com/pjaudiomv/bmlt-cloud-vm-guide',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Guide Sections',
          items: [
            {
              label: 'Getting Started',
              to: '/docs',
            },
            {
              label: 'Prerequisites',
              to: '/docs/initial-setup/prerequisites',
            },
            {
              label: 'Database Backup',
              to: '/docs/backup/database-backup',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/troubleshooting/common-issues',
            },
          ],
        },
        {
          title: 'BMLT Resources',
          items: [
            {
              label: 'BMLT Project',
              href: 'https://bmlt.app/',
            },
            {
              label: 'YAP (Phone System)',
              href: 'https://github.com/bmlt-enabled/yap',
            },
            {
              label: 'BMLT Root Server',
              href: 'https://github.com/bmlt-enabled/bmlt-root-server',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/pjaudiomv/bmlt-cloud-vm-guide',
            },
            {
              label: 'Issues',
              href: 'https://github.com/pjaudiomv/bmlt-cloud-vm-guide/issues',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} pjaudiomv. BMLT Cloud VM Guide - Licensed under GPL v2+.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
