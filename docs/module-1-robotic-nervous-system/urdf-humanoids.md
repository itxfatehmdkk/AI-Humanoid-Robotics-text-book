---
sidebar_label: 'URDF for Humanoids'
title: 'URDF for Humanoids'
description: 'Building URDF files for biped robots: Joints, links, collision models'
---

# URDF for Humanoids

## Overview

Unified Robot Description Format (URDF) is an XML format for representing a robot model. For humanoid robots, URDF is particularly important as it describes the complex kinematic structure with multiple degrees of freedom. This chapter covers how to create URDF files specifically for bipedal robots.

## URDF Fundamentals

URDF describes a robot as a collection of links connected by joints. Each link represents a rigid body, and each joint represents a constraint between two links.

### Basic URDF Structure

```xml
<?xml version="1.0"?>
<robot name="humanoid_robot">
  <!-- Links -->
  <link name="base_link">
    <visual>
      <geometry>
        <box size="0.5 0.5 0.5"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.5 0.5 0.5"/>
      </geometry>
    </collision>
  </link>

  <!-- Joints -->
  <joint name="base_to_torso" type="fixed">
    <parent link="base_link"/>
    <child link="torso"/>
    <origin xyz="0 0 0.25" rpy="0 0 0"/>
  </joint>
</robot>
```

## Links in Humanoid Robots

Links represent the rigid bodies of a robot. For humanoid robots, typical links include:

- Torso
- Head
- Upper arms
- Lower arms
- Hands
- Pelvis
- Upper legs
- Lower legs
- Feet

### Link Properties

Each link can have:
- Visual properties (how it appears in simulation)
- Collision properties (for collision detection)
- Inertial properties (for physics simulation)

```xml
<link name="upper_arm">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.05" length="0.3"/>
    </geometry>
    <material name="blue">
      <color rgba="0 0 1 1"/>
    </material>
  </visual>
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <cylinder radius="0.05" length="0.3"/>
    </geometry>
  </collision>
  <inertial>
    <mass value="1.0"/>
    <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
  </inertial>
</link>
```

## Joints in Humanoid Robots

Joints connect links and define how they can move relative to each other. Humanoid robots require various joint types to achieve human-like movement.

### Joint Types

- **Fixed**: No movement (e.g., attaching sensors)
- **Revolute**: Rotational movement around an axis
- **Continuous**: Revolute joint without limits
- **Prismatic**: Linear sliding movement
- **Floating**: 6-DOF movement (rarely used in humanoid robots)

### Joint Properties

```xml
<joint name="shoulder_pitch" type="revolute">
  <parent link="torso"/>
  <child link="upper_arm"/>
  <origin xyz="0.0 0.2 0.1" rpy="0 0 0"/>
  <axis xyz="1 0 0"/>
  <limit lower="-1.57" upper="1.57" effort="100" velocity="1"/>
  <dynamics damping="0.1" friction="0.0"/>
</joint>
```

## Humanoid Robot Structure

A typical humanoid robot has the following structure:

```
base_link
├── torso
│   ├── head
│   ├── upper_left_arm
│   │   ├── lower_left_arm
│   │   └── left_hand
│   ├── upper_right_arm
│   │   ├── lower_right_arm
│   │   └── right_hand
│   ├── pelvis
│   │   ├── upper_left_leg
│   │   │   ├── lower_left_leg
│   │   │   └── left_foot
│   │   └── upper_right_leg
│   │       ├── lower_right_leg
│   │       └── right_foot
```

### Complete Humanoid URDF Example

```xml
<?xml version="1.0"?>
<robot name="simple_humanoid">
  <!-- Torso -->
  <link name="torso">
    <visual>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <box size="0.3 0.2 0.5"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="5.0"/>
      <inertia ixx="0.2" ixy="0.0" ixz="0.0" iyy="0.2" iyz="0.0" izz="0.2"/>
    </inertial>
  </link>

  <!-- Head -->
  <link name="head">
    <visual>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <sphere radius="0.1"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.01"/>
    </inertial>
  </link>

  <joint name="neck_joint" type="revolute">
    <parent link="torso"/>
    <child link="head"/>
    <origin xyz="0 0 0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.785" upper="0.785" effort="10" velocity="1"/>
  </joint>

  <!-- Left Arm -->
  <link name="upper_left_arm">
    <visual>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
    </visual>
    <collision>
      <geometry>
        <cylinder radius="0.05" length="0.3"/>
      </geometry>
    </collision>
    <inertial>
      <mass value="1.0"/>
      <inertia ixx="0.1" ixy="0.0" ixz="0.0" iyy="0.1" iyz="0.0" izz="0.1"/>
    </inertial>
  </link>

  <joint name="left_shoulder_pitch" type="revolute">
    <parent link="torso"/>
    <child link="upper_left_arm"/>
    <origin xyz="0.15 0.1 0.1" rpy="0 0 0"/>
    <axis xyz="1 0 0"/>
    <limit lower="-1.57" upper="1.57" effort="50" velocity="1"/>
  </joint>

  <!-- Additional links and joints would continue in this pattern -->
</robot>
```

## Collision Models

Collision models are crucial for humanoid robots to ensure proper physics simulation and avoid self-collisions.

### Collision Detection Considerations

- **Self-collision avoidance**: Ensure the robot doesn't collide with itself
- **Environment collision**: Detect collisions with the environment
- **Foot-ground contact**: Proper foot-ground contact for stable walking

### Simplified Collision Models

For computational efficiency, collision models can be simplified:

```xml
<!-- Instead of complex mesh collision -->
<collision>
  <geometry>
    <mesh filename="complex_arm.dae"/>
  </geometry>
</collision>

<!-- Use simplified primitive shapes -->
<collision>
  <geometry>
    <cylinder radius="0.05" length="0.3"/>
  </geometry>
</collision>
```

## Materials and Visuals

Materials define how the robot appears in simulation:

```xml
<material name="red">
  <color rgba="1 0 0 1"/>
</material>

<material name="blue">
  <color rgba="0 0 1 1"/>
</material>

<material name="white">
  <color rgba="1 1 1 1"/>
</material>
```

## Gazebo-Specific Elements

For simulation in Gazebo, additional elements can be added:

```xml
<gazebo reference="torso">
  <material>Gazebo/Blue</material>
  <mu1>0.9</mu1>
  <mu2>0.9</mu2>
</gazebo>
```

## Knowledge Summary

This chapter covered:
- URDF structure for humanoid robots
- Link and joint definitions
- Typical humanoid robot kinematic structure
- Collision model considerations
- Visual and material properties
- Gazebo-specific elements

## Exercises

1. Create a complete URDF for a simple biped robot with 12 degrees of freedom
2. Implement collision models that prevent self-collision
3. Add visual materials to make the robot look more realistic
4. Test the URDF in Gazebo to verify proper kinematics

## References

1. URDF Documentation: http://wiki.ros.org/urdf
2. ROS URDF Tutorials: http://wiki.ros.org/urdf/Tutorials
3. Gazebo Robot Models: http://gazebosim.org/tutorials?tut=ros_gzplugins