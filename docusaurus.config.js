// @ts-check
const { themes } = require('prism-react-renderer');

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'The Humanoid Robotics Course Curriculum',
  tagline: 'AI Assistant with Robotics Education',
  favicon: 'img/favicon.ico',

  // PRODUCTION URL for GitHub Pages
  url: 'https://itxfatehmdkk.github.io',

  // REPO NAME - must include leading and trailing slash
  baseUrl: '/AI-Humanoid-Robotics-text-book/',

  // GitHub deployment info
  organizationName: 'itxfatehmdkk',
  projectName: 'AI-Humanoid-Robotics-text-book',
  
  trailingSlash: false,

  onBrokenLinks: 'throw',

  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  presets: [
    [
      'classic',
      ({
        docs: {
          sidebarPath: require.resolve('./sidebars.js'),

          // docs root path
          routeBasePath: '/',

          // GitHub edit link
          editUrl:
            'https://github.com/itxfatehmdkk/AI-Humanoid-Robotics-text-book/tree/main/textbook-frontend/',
        },
        blog: false,
        theme: {
          customCss: require.resolve('./src/css/custom.css'),
        },
      }),
    ],
  ],

  themeConfig: ({
    image: 'img/docusaurus-social-card.jpg',

    navbar: {
      title: '🤖 The Humanoid Robotics Course',
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: '📚 Course',
        },
        {
          type: 'dropdown',
          label: 'Modules 📘',
          position: 'left',
          items: [
            {
              label: '1️⃣ ROS 2 Fundamentals',
              to: '/module-1-robotic-nervous-system/ros2-fundamentals',
            },
            {
              label: '2️⃣ Digital Twin (Gazebo & Unity)',
              to: '/module-2-digital-twin/physics-simulation-gazebo',
            },
            {
              label: '3️⃣ AI-Robot Brain (NVIDIA Isaac)',
              to: '/module-3-ai-brain/isaac-sim-foundations',
            },
            {
              label: '4️⃣ Vision-Language-Action (VLA)',
              to: '/module-4-vla/voice-to-action-whisper-ros2',
            },
          ],
        },
        {
          href: 'https://github.com/itxfatehmdkk/AI-Humanoid-Robotics-text-book',
          label: '🐙 GitHub',
          position: 'right',
        },
        {
          label: '💬 Chat',
          position: 'right',
          to: '/chat',
        },
      ],
    },

    footer: {
      style: 'dark',
      links: [
        {
          title: 'Learning Path',
          items: [
            { label: 'Module 1: ROS 2 Fundamentals', to: '/module-1-robotic-nervous-system/ros2-fundamentals' },
            { label: 'Module 2: Digital Twin', to: '/module-2-digital-twin/physics-simulation-gazebo' },
            { label: 'Module 3: AI-Robot Brain', to: '/module-3-ai-brain/isaac-sim-foundations' },
            { label: 'Module 4: Voice-to-Action', to: '/module-4-vla/voice-to-action-whisper-ros2' },
          ],
        },
        {
          title: 'Community',
          items: [
            { label: 'GitHub', href: 'https://github.com/itxfatehmdkk/AI-Humanoid-Robotics-text-book' },
            { label: 'ROS Community', href: 'https://discourse.ros.org/' },
            { label: 'Docusaurus Forum', href: 'https://docusaurus.io/showcase' },
          ],
        },
        {
          title: 'More',
          items: [
            { label: 'Report an Issue', href: 'https://github.com/itxfatehmdkk/AI-Humanoid-Robotics-text-book/issues' },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} The Humanoid Robotics Course Curriculum. Built with Docusaurus.`,
    },
  }),
};

module.exports = config;
