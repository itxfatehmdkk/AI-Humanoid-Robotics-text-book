// @ts-check

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Module 1 - The Robotic Nervous System (ROS 2)',
      items: [
        'module-1-robotic-nervous-system/ros2-fundamentals',
        'module-1-robotic-nervous-system/advanced-ros2-concepts',
        'module-1-robotic-nervous-system/python-agents-rclpy',
        'module-1-robotic-nervous-system/advanced-urdf-humanoids',
        'module-1-robotic-nervous-system/urdf-humanoids'
      ],
    },
    {
      type: 'category',
      label: 'Module 2 - The Digital Twin (Gazebo & Unity)',
      items: [
        'module-2-digital-twin/physics-simulation-gazebo',
        'module-2-digital-twin/unity-hri',
        'module-2-digital-twin/simulating-robotic-sensors'
      ],
    },
    {
      type: 'category',
      label: 'Module 3 - The AI-Robot Brain (NVIDIA Isaac)',
      items: [
        'module-3-ai-brain/isaac-sim-foundations',
        'module-3-ai-brain/isaac-ros-accelerated-vision-slam',
        'module-3-ai-brain/nav2-humanoid-navigation'
      ],
    },
    {
      type: 'category',
      label: 'Module 4 - Vision-Language-Action (VLA)',
      items: [
        'module-4-vla/voice-to-action-whisper-ros2',
        'module-4-vla/cognitive-planning-using-llms',
        'module-4-vla/capstone-autonomous-humanoid'
      ],
    },
  ],
};

module.exports = sidebars;