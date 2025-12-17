import React from 'react';
import ComponentCreator from '@docusaurus/ComponentCreator';

export default [
  {
    path: '/AI-Humanoid-Robotics-text-book/chat',
    component: ComponentCreator('/AI-Humanoid-Robotics-text-book/chat', 'ba6'),
    exact: true
  },
  {
    path: '/AI-Humanoid-Robotics-text-book/',
    component: ComponentCreator('/AI-Humanoid-Robotics-text-book/', '46a'),
    exact: true
  },
  {
    path: '/AI-Humanoid-Robotics-text-book/',
    component: ComponentCreator('/AI-Humanoid-Robotics-text-book/', '9b4'),
    routes: [
      {
        path: '/AI-Humanoid-Robotics-text-book/',
        component: ComponentCreator('/AI-Humanoid-Robotics-text-book/', 'c52'),
        routes: [
          {
            path: '/AI-Humanoid-Robotics-text-book/',
            component: ComponentCreator('/AI-Humanoid-Robotics-text-book/', '04e'),
            routes: [
              {
                path: '/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/advanced-ros2-concepts',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/advanced-ros2-concepts', '663'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/advanced-urdf-humanoids',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/advanced-urdf-humanoids', '674'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/python-agents-rclpy',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/python-agents-rclpy', '8d3'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/ros2-fundamentals',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/ros2-fundamentals', 'f6e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/urdf-humanoids',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-1-robotic-nervous-system/urdf-humanoids', '38c'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-2-digital-twin/physics-simulation-gazebo',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-2-digital-twin/physics-simulation-gazebo', 'fd9'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-2-digital-twin/simulating-robotic-sensors',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-2-digital-twin/simulating-robotic-sensors', '5af'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-2-digital-twin/unity-hri',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-2-digital-twin/unity-hri', '30e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-3-ai-brain/isaac-ros-accelerated-vision-slam',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-3-ai-brain/isaac-ros-accelerated-vision-slam', '20e'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-3-ai-brain/isaac-sim-foundations',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-3-ai-brain/isaac-sim-foundations', '125'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-3-ai-brain/nav2-humanoid-navigation',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-3-ai-brain/nav2-humanoid-navigation', '205'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-4-vla/capstone-autonomous-humanoid',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-4-vla/capstone-autonomous-humanoid', '126'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-4-vla/cognitive-planning-using-llms',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-4-vla/cognitive-planning-using-llms', '15f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/module-4-vla/voice-to-action-whisper-ros2',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/module-4-vla/voice-to-action-whisper-ros2', 'e0f'),
                exact: true,
                sidebar: "tutorialSidebar"
              },
              {
                path: '/AI-Humanoid-Robotics-text-book/',
                component: ComponentCreator('/AI-Humanoid-Robotics-text-book/', '2ce'),
                exact: true
              }
            ]
          }
        ]
      }
    ]
  },
  {
    path: '*',
    component: ComponentCreator('*'),
  },
];
