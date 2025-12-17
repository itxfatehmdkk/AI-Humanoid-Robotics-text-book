---
sidebar_label: 'Advanced URDF Modeling for Humanoids'
title: 'Advanced URDF Modeling for Humanoids'
description: 'Comprehensive guide to modeling humanoid robots using URDF with kinematics, dynamics, and simulation considerations'
---

# Advanced URDF Modeling for Humanoids

## Overview

Universal Robot Description Format (URDF) is the standard format for representing robot models in ROS. When modeling humanoid robots, additional complexities arise from their anthropomorphic structure, multiple degrees of freedom, and complex kinematic chains. This chapter explores advanced techniques for creating detailed humanoid robot models in URDF with attention to kinematics, dynamics, and simulation fidelity.

### URDF Fundamentals Review

URDF defines a robot as a collection of rigid bodies connected by joints with material properties, visual geometry, and collision geometry. For humanoid robots, this becomes particularly complex due to:

- Multiple kinematic chains (arms, legs, spine)
- Complex joint types and limits
- Balanced mass distribution for stable locomotion
- Detailed visual representations

## Humanoid Kinematic Structure

### Typical Humanoid Configuration

Humanoid robots typically follow a human-like structure with:

- Trunk/base (torso) as the central body
- Two arms with shoulders, elbows, wrists
- Two legs with hips, knees, ankles
- Head/neck assembly
- Multiple degrees of freedom at each major joint

### URDF Implementation

```xml
<?xml version="1.0"?>
<robot name="humanoid_robot">

  <!-- Base Link - Torso -->
  <link name="base_link">
    <visual>
      <origin xyz="0 0 0.5" rpy="0 0 0"/>
      <geometry>
        <box size="0.3 0.2 1.0"/>
      </geometry>
      <material name="light_grey">
        <color rgba="0.7 0.7 0.7 1.0"/>
      </material>
    </visual>
    
    <collision>
      <origin xyz="0 0 0.5" rpy="0 0 0"/>
      <geometry>
        <box size="0.3 0.2 1.0"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="10.0"/>
      <origin xyz="0 0 0.5" rpy="0 0 0"/>
      <inertia ixx="0.5" ixy="0.0" ixz="0.0" iyy="0.8" iyz="0.0" izz="0.6"/>
    </inertial>
  </link>

  <!-- Neck Joint -->
  <joint name="neck_joint" type="revolute">
    <parent link="base_link"/>
    <child link="head_link"/>
    <origin xyz="0.0 0.0 1.0" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="-0.78" upper="0.78" effort="50.0" velocity="1.0"/>
  </joint>

  <!-- Head Link -->
  <link name="head_link">
    <visual>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
      <material name="blue">
        <color rgba="0.3 0.3 1.0 1.0"/>
      </material>
    </visual>
    
    <collision>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <geometry>
        <sphere radius="0.15"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="2.0"/>
      <origin xyz="0 0 0" rpy="0 0 0"/>
      <inertia ixx="0.02" ixy="0.0" ixz="0.0" iyy="0.02" iyz="0.0" izz="0.02"/>
    </inertial>
  </link>

  <!-- Left Shoulder -->
  <joint name="left_shoulder_pan_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_upper_arm"/>
    <origin xyz="0.15 0.1 0.8" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
    <dynamics damping="1.0" friction="0.1"/>
  </joint>

  <link name="left_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.05"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.05"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15" rpy="0 0 0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
  </link>

  <!-- Left Elbow Joint -->
  <joint name="left_elbow_joint" type="revolute">
    <parent link="left_upper_arm"/>
    <child link="left_lower_arm"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.35" effort="80.0" velocity="2.0"/>
  </joint>

  <link name="left_lower_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.04"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.04"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.15" rpy="0 0 0"/>
      <inertia ixx="0.008" ixy="0.0" ixz="0.0" iyy="0.008" iyz="0.0" izz="0.004"/>
    </inertial>
  </link>

  <!-- Left Wrist Joint -->
  <joint name="left_wrist_joint" type="revolute">
    <parent link="left_lower_arm"/>
    <child link="left_hand"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="30.0" velocity="2.0"/>
  </joint>

  <link name="left_hand">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Right Arm (symmetric to left) -->
  <joint name="right_shoulder_pan_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_upper_arm"/>
    <origin xyz="0.15 -0.1 0.8" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
    <dynamics damping="1.0" friction="0.1"/>
  </joint>

  <link name="right_upper_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.05"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.05"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.5"/>
      <origin xyz="0 0 -0.15" rpy="0 0 0"/>
      <inertia ixx="0.01" ixy="0.0" ixz="0.0" iyy="0.01" iyz="0.0" izz="0.005"/>
    </inertial>
  </link>

  <!-- Right Elbow Joint -->
  <joint name="right_elbow_joint" type="revolute">
    <parent link="right_upper_arm"/>
    <child link="right_lower_arm"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.35" effort="80.0" velocity="2.0"/>
  </joint>

  <link name="right_lower_arm">
    <visual>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.04"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.15" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.2" radius="0.04"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.15" rpy="0 0 0"/>
      <inertia ixx="0.008" ixy="0.0" ixz="0.0" iyy="0.008" iyz="0.0" izz="0.004"/>
    </inertial>
  </link>

  <!-- Right Wrist Joint -->
  <joint name="right_wrist_joint" type="revolute">
    <parent link="right_lower_arm"/>
    <child link="right_hand"/>
    <origin xyz="0 0 -0.3" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-1.57" upper="1.57" effort="30.0" velocity="2.0"/>
  </joint>

  <link name="right_hand">
    <visual>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <geometry>
        <box size="0.1 0.1 0.1"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="0.5"/>
      <origin xyz="0 0 -0.05" rpy="0 0 0"/>
      <inertia ixx="0.001" ixy="0.0" ixz="0.0" iyy="0.001" iyz="0.0" izz="0.001"/>
    </inertial>
  </link>

  <!-- Left Hip Joint -->
  <joint name="left_hip_yaw_joint" type="revolute">
    <parent link="base_link"/>
    <child link="left_thigh"/>
    <origin xyz="-0.1 0.1 0.0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-0.78" upper="0.78" effort="200.0" velocity="1.5"/>
    <dynamics damping="2.0" friction="0.5"/>
  </joint>

  <link name="left_thigh">
    <visual>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.06"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.06"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="3.0"/>
      <origin xyz="0 0 -0.25" rpy="0 0 0"/>
      <inertia ixx="0.05" ixy="0.0" ixz="0.0" iyy="0.05" iyz="0.0" izz="0.02"/>
    </inertial>
  </link>

  <!-- Left Knee Joint -->
  <joint name="left_knee_joint" type="revolute">
    <parent link="left_thigh"/>
    <child link="left_shin"/>
    <origin xyz="0 0 -0.5" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.35" effort="200.0" velocity="1.5"/>
  </joint>

  <link name="left_shin">
    <visual>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.055"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.055"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="2.5"/>
      <origin xyz="0 0 -0.25" rpy="0 0 0"/>
      <inertia ixx="0.04" ixy="0.0" ixz="0.0" iyy="0.04" iyz="0.0" izz="0.015"/>
    </inertial>
  </link>

  <!-- Left Ankle Joint -->
  <joint name="left_ankle_joint" type="revolute">
    <parent link="left_shin"/>
    <child link="left_foot"/>
    <origin xyz="0 0 -0.5" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-0.78" upper="0.78" effort="100.0" velocity="1.0"/>
  </joint>

  <link name="left_foot">
    <visual>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <geometry>
        <box size="0.25 0.1 0.06"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <geometry>
        <box size="0.25 0.1 0.06"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.008" iyz="0.0" izz="0.008"/>
    </inertial>
  </link>

  <!-- Right Leg (symmetric to left) -->
  <joint name="right_hip_yaw_joint" type="revolute">
    <parent link="base_link"/>
    <child link="right_thigh"/>
    <origin xyz="-0.1 -0.1 0.0" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-0.78" upper="0.78" effort="200.0" velocity="1.5"/>
    <dynamics damping="2.0" friction="0.5"/>
  </joint>

  <link name="right_thigh">
    <visual>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.06"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.06"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="3.0"/>
      <origin xyz="0 0 -0.25" rpy="0 0 0"/>
      <inertia ixx="0.05" ixy="0.0" ixz="0.0" iyy="0.05" iyz="0.0" izz="0.02"/>
    </inertial>
  </link>

  <!-- Right Knee Joint -->
  <joint name="right_knee_joint" type="revolute">
    <parent link="right_thigh"/>
    <child link="right_shin"/>
    <origin xyz="0 0 -0.5" rpy="0 0 0"/>
    <axis xyz="0 1 0"/>
    <limit lower="0" upper="2.35" effort="200.0" velocity="1.5"/>
  </joint>

  <link name="right_shin">
    <visual>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.055"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.25" rpy="1.57 0 0"/>
      <geometry>
        <capsule length="0.4" radius="0.055"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="2.5"/>
      <origin xyz="0 0 -0.25" rpy="0 0 0"/>
      <inertia ixx="0.04" ixy="0.0" ixz="0.0" iyy="0.04" iyz="0.0" izz="0.015"/>
    </inertial>
  </link>

  <!-- Right Ankle Joint -->
  <joint name="right_ankle_joint" type="revolute">
    <parent link="right_shin"/>
    <child link="right_foot"/>
    <origin xyz="0 0 -0.5" rpy="0 0 0"/>
    <axis xyz="0 0 1"/>
    <limit lower="-0.78" upper="0.78" effort="100.0" velocity="1.0"/>
  </joint>

  <link name="right_foot">
    <visual>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <geometry>
        <box size="0.25 0.1 0.06"/>
      </geometry>
    </visual>
    
    <collision>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <geometry>
        <box size="0.25 0.1 0.06"/>
      </geometry>
    </collision>
    
    <inertial>
      <mass value="1.0"/>
      <origin xyz="0 0 -0.03" rpy="0 0 0"/>
      <inertia ixx="0.002" ixy="0.0" ixz="0.0" iyy="0.008" iyz="0.0" izz="0.008"/>
    </inertial>
  </link>

</robot>
```

## Advanced URDF Features

### Transmission Elements

Transmissions define how actuators connect to joints, which is critical for humanoid robots with many degrees of freedom:

```xml
<!-- Example transmission definition -->
<transmission name="left_elbow_trans">
  <type>transmission_interface/SimpleTransmission</type>
  <joint name="left_elbow_joint">
    <hardwareInterface>PositionJointInterface</hardwareInterface>
  </joint>
  <actuator name="left_elbow_motor">
    <mechanicalReduction>1</mechanicalReduction>
    <hardwareInterface>PositionJointInterface</hardwareInterface>
  </actuator>
</transmission>
```

### Gazebo-Specific Elements

To make humanoid robots work properly in simulation, Gazebo-specific elements are often needed:

```xml
<!-- Gazebo plugin for ROS control -->
<gazebo>
  <plugin name="gazebo_ros_control" filename="libgazebo_ros_control.so">
    <robotNamespace>/humanoid_robot</robotNamespace>
    <robotSimType>gazebo_ros_control/DefaultRobotHWSim</robotSimType>
  </plugin>
</gazebo>

<!-- Per-link Gazebo properties -->
<gazebo reference="left_foot">
  <mu1>0.8</mu1>
  <mu2>0.8</mu2>
  <kp>1000000.0</kp>
  <kd>100.0</kd>
  <minDepth>0.001</minDepth>
  <maxVel>1.0</maxVel>
</gazebo>
```

### Materials and Colors

Defining materials improves the visualization in simulation:

```xml
<!-- Color definitions -->
<material name="red">
  <color rgba="1 0 0 1"/>
</material>
<material name="green">
  <color rgba="0 1 0 1"/>
</material>
<material name="blue">
  <color rgba="0 0 1 1"/>
</material>
<material name="yellow">
  <color rgba="1 1 0 1"/>
</material>
<material name="white">
  <color rgba="1 1 1 1"/>
</material>
<material name="black">
  <color rgba="0 0 0 1"/>
</material>
<material name="grey">
  <color rgba="0.5 0.5 0.5 1"/>
</material>
```

## Joint Limits and Dynamics

### Conservative Limits for Safety

Humanoid robots require careful consideration of joint limits to prevent damage:

```xml
<!-- Conservative limits for humanoid safety -->
<joint name="left_shoulder_pan_joint" type="revolute">
  <parent link="base_link"/>
  <child link="left_upper_arm"/>
  <origin xyz="0.15 0.1 0.8" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <!-- More conservative limits than human range of motion -->
  <limit lower="-1.0" upper="1.0" effort="100.0" velocity="2.0"/>
  <!-- Include damping and friction for realistic simulation -->
  <dynamics damping="1.0" friction="0.1"/>
</joint>
```

### Custom Joint Types

For complex movements, URDF can define custom joint types or combinations:

```xml
<!-- Spherical joint approximation using multiple revolute joints -->
<joint name="left_shoulder_spherical_yaw" type="revolute">
  <parent link="base_link"/>
  <child link="left_shoulder_yaw_link"/>
  <origin xyz="0.15 0.1 0.8" rpy="0 0 0"/>
  <axis xyz="0 0 1"/>
  <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
</joint>

<link name="left_shoulder_yaw_link"/>

<joint name="left_shoulder_spherical_pitch" type="revolute">
  <parent link="left_shoulder_yaw_link"/>
  <child link="left_shoulder_pitch_link"/>
  <origin xyz="0 0 0" rpy="0 0 0"/>
  <axis xyz="0 1 0"/>
  <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
</joint>

<link name="left_shoulder_pitch_link"/>

<joint name="left_shoulder_spherical_roll" type="revolute">
  <parent link="left_shoulder_pitch_link"/>
  <child link="left_upper_arm"/>
  <origin xyz="0 0 0" rpy="0 0 0"/>
  <axis xyz="1 0 0"/>
  <limit lower="-1.57" upper="1.57" effort="100.0" velocity="2.0"/>
</joint>
```

## Mass Distribution and Inertial Properties

### Center of Mass Considerations

For stable humanoid locomotion, careful mass distribution is crucial:

```xml
<!-- Inertial properties with accurate center of mass placement -->
<link name="base_link">
  <visual>
    <origin xyz="0 0 0.5" rpy="0 0 0"/>
    <geometry>
      <box size="0.3 0.2 1.0"/>
    </geometry>
  </visual>
  
  <collision>
    <origin xyz="0 0 0.5" rpy="0 0 0"/>
    <geometry>
      <box size="0.3 0.2 1.0"/>
    </geometry>
  </collision>
  
  <!-- Carefully calculated inertial properties for stability -->
  <inertial>
    <mass value="15.0"/>  <!-- Increased mass for stability -->
    <origin xyz="0 0 0.3" rpy="0 0 0"/>  <!-- Lower CoM for stability -->
    <!-- Moments of inertia based on approximate shape -->
    <inertia ixx="1.0" ixy="0.0" ixz="0.0" iyy="1.3" iyz="0.0" izz="0.9"/>
  </inertial>
</link>
```

### Inertia Calculation Methods

There are several approaches to calculating accurate inertial properties:

1. **CAD-based calculation**: Export from CAD software
2. **Approximation using primitive shapes**
3. **Measurement on physical robot**

```python
"""
Python script to calculate inertial properties for complex geometries
This is a conceptual example - in practice, you'd use CAD software or specific libraries
"""

def calculate_box_inertia(mass, width, height, depth):
    """Calculate moments of inertia for a box"""
    ixx = (1/12.0) * mass * (height*height + depth*depth)
    iyy = (1/12.0) * mass * (width*width + depth*depth)
    izz = (1/12.0) * mass * (width*width + height*height)
    return ixx, iyy, izz

def calculate_cylinder_inertia(mass, radius, height):
    """Calculate moments of inertia for a cylinder"""
    ixx = (1/12.0) * mass * (3*radius*radius + height*height)
    iyy = (1/12.0) * mass * (3*radius*radius + height*height)
    izz = (1/2.0) * mass * radius*radius
    return ixx, iyy, izz

# Example calculation for humanoid thigh
thigh_mass = 3.0  # kg
thigh_radius = 0.06  # m
thigh_height = 0.4  # m

ixx, iyy, izz = calculate_cylinder_inertia(thigh_mass, thigh_radius, thigh_height)
print(f"Thigh inertia: ixx={ixx:.3f}, iyy={iyy:.3f}, izz={izz:.3f}")
```

## Visual and Collision Geometry

### Detailed Visual Models

While maintaining simple collision geometry for performance:

```xml
<!-- Complex visual geometry -->
<link name="head_visual_detail">
  <visual>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <!-- Use mesh files for detailed appearance -->
      <mesh filename="package://humanoid_description/meshes/head.dae" scale="1 1 1"/>
    </geometry>
    <material name="head_material">
      <color rgba="0.8 0.8 0.8 1.0"/>
    </material>
  </visual>
  
  <!-- Simple collision geometry for performance -->
  <collision>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <geometry>
      <!-- Use simple shapes for collision -->
      <sphere radius="0.15"/>
    </geometry>
  </collision>
  
  <inertial>
    <mass value="2.0"/>
    <origin xyz="0 0 0" rpy="0 0 0"/>
    <inertia ixx="0.02" ixy="0.0" ixz="0.0" iyy="0.02" iyz="0.0" izz="0.02"/>
  </inertial>
</link>
```

### Concave Shapes with Convex Decomposition

For complex shapes that need concave collision geometry:

```xml
<!-- Convex decomposition for complex shapes -->
<link name="complex_link">
  <collision>
    <geometry>
      <mesh filename="package://humanoid_description/meshes/complex_shape_convex_part1.stl"/>
    </geometry>
  </collision>
  
  <collision>
    <geometry>
      <mesh filename="package://humanoid_description/meshes/complex_shape_convex_part2.stl"/>
    </geometry>
  </collision>
  
  <collision>
    <geometry>
      <mesh filename="package://humanoid_description/meshes/complex_shape_convex_part3.stl"/>
    </geometry>
  </collision>
</link>
```

## Xacro Macros for Complex Models

### Xacro for Repetitive Structures

Xacro (XML Macros) is extremely useful for humanoid robots with symmetrical limbs:

```xml
<?xml version="1.0"?>
<robot xmlns:xacro="http://www.ros.org/wiki/xacro" name="humanoid_xacro">

  <!-- Include common properties -->
  <xacro:property name="M_PI" value="3.1415926535897931" />
  
  <!-- Materials -->
  <xacro:macro name="default_material" params="color_name:=grey r:=0.5 g:=0.5 b:=0.5">
    <material name="${color_name}">
      <color rgba="${r} ${g} ${b} 1.0"/>
    </material>
  </xacro:macro>
  
  <!-- Generic link macro -->
  <xacro:macro name="generic_link" 
               params="name mass ixx iyy izz xyz_origin:=0 0 0 rpy_origin:=0 0 0 
                       visual_geometry collision_geometry material_name:=grey">
    <link name="${name}">
      <visual>
        <origin xyz="${xyz_origin}" rpy="${rpy_origin}"/>
        <geometry>
          ${visual_geometry}
        </geometry>
        <material name="${material_name}"/>
      </visual>
      
      <collision>
        <origin xyz="${xyz_origin}" rpy="${rpy_origin}"/>
        <geometry>
          ${collision_geometry}
        </geometry>
      </collision>
      
      <inertial>
        <mass value="${mass}"/>
        <origin xyz="${xyz_origin}" rpy="${rpy_origin}"/>
        <inertia ixx="${ixx}" ixy="0" ixz="0" iyy="${iyy}" iyz="0" izz="${izz}"/>
      </inertial>
    </link>
  </xacro:macro>
  
  <!-- Arm macro -->
  <xacro:macro name="arm_chain" params="prefix parent_link xyz_origin rpy_origin shoulder_offset mult:=1">
    <!-- Shoulder Pan Joint -->
    <joint name="${prefix}_shoulder_pan_joint" type="revolute">
      <parent link="${parent_link}"/>
      <child link="${prefix}_upper_arm"/>
      <origin xyz="${xyz_origin}" rpy="${rpy_origin}"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-0.78*mult}" upper="${0.78*mult}" effort="100.0" velocity="2.0"/>
      <dynamics damping="1.0" friction="0.1"/>
    </joint>
    
    <!-- Upper Arm -->
    <xacro:generic_link 
      name="${prefix}_upper_arm"
      mass="1.5" 
      ixx="0.01" iyy="0.01" izz="0.005"
      xyz_origin="0 0 -0.15"
      rpy_origin="${M_PI/2} 0 0"
      visual_geometry="<capsule length='0.2' radius='0.05'/>"
      collision_geometry="<capsule length='0.2' radius='0.05'/>"
      material_name="light_grey"/>
    
    <!-- Elbow Joint -->
    <joint name="${prefix}_elbow_joint" type="revolute">
      <parent link="${prefix}_upper_arm"/>
      <child link="${prefix}_lower_arm"/>
      <origin xyz="0 0 -0.3" rpy="0 0 0"/>
      <axis xyz="0 1 0"/>
      <limit lower="0" upper="${2.35*mult}" effort="80.0" velocity="2.0"/>
    </joint>
    
    <!-- Lower Arm -->
    <xacro:generic_link 
      name="${prefix}_lower_arm"
      mass="1.0" 
      ixx="0.008" iyy="0.008" izz="0.004"
      xyz_origin="0 0 -0.15"
      rpy_origin="${M_PI/2} 0 0"
      visual_geometry="<capsule length='0.2' radius='0.04'/>"
      collision_geometry="<capsule length='0.2' radius='0.04'/>"
      material_name="light_grey"/>
    
    <!-- Wrist Joint -->
    <joint name="${prefix}_wrist_joint" type="revolute">
      <parent link="${prefix}_lower_arm"/>
      <child link="${prefix}_hand"/>
      <origin xyz="0 0 -0.3" rpy="0 0 0"/>
      <axis xyz="0 0 1"/>
      <limit lower="${-0.78*mult}" upper="${0.78*mult}" effort="30.0" velocity="2.0"/>
    </joint>
    
    <!-- Hand -->
    <xacro:generic_link 
      name="${prefix}_hand"
      mass="0.5" 
      ixx="0.001" iyy="0.001" izz="0.001"
      xyz_origin="0 0 -0.05"
      rpy_origin="0 0 0"
      visual_geometry="<box size='0.1 0.1 0.1'/>"
      collision_geometry="<box size='0.1 0.1 0.1'/>"
      material_name="dark_grey"/>
  </xacro:macro>
  
  <!-- Torso -->
  <xacro:generic_link 
    name="base_link"
    mass="10.0" 
    ixx="0.5" iyy="0.8" izz="0.6"
    xyz_origin="0 0 0.5"
    rpy_origin="0 0 0"
    visual_geometry="<box size='0.3 0.2 1.0'/>"
    collision_geometry="<box size='0.3 0.2 1.0'/>"
    material_name="medium_grey"/>
  
  <!-- Instantiate arms -->
  <xacro:arm_chain prefix="left" parent_link="base_link" 
                  xyz_origin="0.15 0.1 0.8" rpy_origin="0 0 0" 
                  shoulder_offset="0.1" mult="1"/>
                  
  <xacro:arm_chain prefix="right" parent_link="base_link" 
                  xyz_origin="0.15 -0.1 0.8" rpy_origin="0 0 0" 
                  shoulder_offset="-0.1" mult="1"/>
  
  <!-- Include the rest of the robot using similar macros -->
  
</robot>
```

## Validation and Testing

### Checking URDF Models

Several tools can validate your URDF models:

```bash
# Check for URDF errors
check_urdf /path/to/your/robot.urdf

# Visualize in RViz
ros2 run rviz2 rviz2

# Load in Gazebo
ros2 launch gazebo_ros gazebo.launch.py

# Check kinematics
ros2 run tf2_tools view_frames
```

### Python Script for URDF Validation

```python
#!/usr/bin/env python3
"""
Script to validate basic URDF properties programmatically
"""
import xml.etree.ElementTree as ET
import math

def validate_urdf(urdf_path):
    """Validate basic properties of URDF file"""
    try:
        tree = ET.parse(urdf_path)
        root = tree.getroot()
        
        # Check if robot element exists
        if root.tag != 'robot':
            raise ValueError("URDF must have 'robot' as root element")
        
        robot_name = root.attrib.get('name')
        if not robot_name:
            raise ValueError("Robot must have a name attribute")
        
        print(f"Validating robot: {robot_name}")
        
        # Find all links and joints
        links = root.findall('link')
        joints = root.findall('joint')
        
        print(f"Found {len(links)} links and {len(joints)} joints")
        
        # Validate that all joints connect existing links
        link_names = [link.attrib['name'] for link in links]
        
        for joint in joints:
            parent = joint.find('parent')
            child = joint.find('child')
            
            if parent is None or child is None:
                raise ValueError(f"Joint {joint.attrib['name']} missing parent or child")
                
            parent_name = parent.attrib['link']
            child_name = child.attrib['link']
            
            if parent_name not in link_names:
                raise ValueError(f"Joint {joint.attrib['name']} references non-existent parent link: {parent_name}")
                
            if child_name not in link_names:
                raise ValueError(f"Joint {joint.attrib['name']} references non-existent child link: {child_name}")
        
        # Check for unique names
        link_name_counts = {}
        joint_name_counts = {}
        
        for link in links:
            name = link.attrib['name']
            link_name_counts[name] = link_name_counts.get(name, 0) + 1
        
        for joint in joints:
            name = joint.attrib['name']
            joint_name_counts[name] = joint_name_counts.get(name, 0) + 1
        
        duplicate_links = [name for name, count in link_name_counts.items() if count > 1]
        duplicate_joints = [name for name, count in joint_name_counts.items() if count > 1]
        
        if duplicate_links:
            raise ValueError(f"Duplicate link names found: {duplicate_links}")
        
        if duplicate_joints:
            raise ValueError(f"Duplicate joint names found: {duplicate_joints}")
        
        print("URDF validation passed!")
        return True
        
    except ET.ParseError as e:
        print(f"XML parsing error: {e}")
        return False
    except Exception as e:
        print(f"Validation error: {e}")
        return False

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 2:
        print("Usage: python urdf_validator.py <urdf_file>")
        sys.exit(1)
    
    urdf_path = sys.argv[1]
    validate_urdf(urdf_path)
```

## Troubleshooting Common Issues

### Self-Collision Problems

Common issues with complex humanoid models include self-collisions:

```xml
<!-- Disable self-collision between adjacent links if needed -->
<link name="left_upper_arm">
  <self_collide>false</self_collide>
  <!-- ... other definitions ... -->
</link>
```

Alternatively, use the `disable_collision` element to selectively disable collisions:

```xml
<!-- Disable collision between specific pairs of links -->
<disable_collision link1="base_link" link2="left_upper_arm" reason="Adjacent" />
<disable_collision link1="left_upper_arm" link2="left_lower_arm" reason="Adjacent" />
<!-- And so on... -->
```

### Inverse Kinematics Considerations

For humanoid manipulation, proper kinematic chain setup is crucial:

```xml
<!-- Define kinematic chains for IK solvers -->
<chain base_link="base_link" tip_link="left_hand" />
<chain base_link="base_link" tip_link="right_hand" />
<chain base_link="base_link" tip_link="left_foot" />
<chain base_link="base_link" tip_link="right_foot" />
```

## Best Practices

### Organizational Best Practices

1. **Modular URDF files**: Split large models across multiple files
2. **Consistent naming**: Use prefixes for left/right symmetry
3. **Documentation**: Comment complex sections
4. **Version control**: Track changes to URDF files
5. **Mesh management**: Organize mesh files logically

### Performance Best Practices

1. **Collision simplification**: Use simple shapes for collision
2. **Appropriate mesh resolution**: Balance detail with performance
3. **Efficient kinematic structures**: Minimize unnecessary complexity
4. **Proper scaling**: Keep link sizes reasonable

## Knowledge Summary

This chapter covered advanced URDF modeling techniques specifically for humanoid robots:

- **Kinematic Structure**: Understanding the complex multi-chain structure of humanoid robots and how to represent it in URDF
- **Detailed Modeling**: Creating realistic visual and collision geometry for each body part
- **Inertial Properties**: Accurate mass distribution and center of mass placement for stable locomotion
- **Advanced Features**: Using transmissions, Gazebo plugins, and material definitions
- **Xacro Macros**: Leveraging XML macros for repetitive structures like arms and legs
- **Validation**: Techniques for checking URDF correctness and performance
- **Best Practices**: Organizational and performance tips for complex models

Proper URDF modeling is fundamental to humanoid robotics development, affecting everything from simulation quality to controller performance. Attention to joint limits, mass distribution, and collision geometry directly impacts the robot's ability to perform complex behaviors.

## Exercises

1. Modify the provided humanoid URDF to add 3 additional degrees of freedom to each leg (hip roll, hip pitch, ankle pitch) and adjust the inertial properties accordingly.

2. Create a Xacro macro for the humanoid head and neck assembly that allows for multiple configurations (with/without cameras, different sensor payloads).

3. Calculate the required torque ratings for each joint in the humanoid model assuming worst-case static loads (robot lifting its own weight with extended arms).

4. Design a collision-free trajectory for moving the left arm from a neutral position to a position where the hand is above the head, considering self-collision constraints.

5. Implement a URDF validation function that checks if the center of mass projection remains within the feet's support polygon for a given pose.

## References

1. URDF/XML Reference: http://wiki.ros.org/urdf/XML
2. Gazebo Model Documentation: http://gazebosim.org/tutorials?cat=build_robot
3. Xacro Tutorial: http://wiki.ros.org/xacro
4. Inertial Parameter Identification: https://ieeexplore.ieee.org/document/8646887
5. Humanoid Robot Design Guidelines: https://link.springer.com/chapter/10.1007/978-3-319-91563-0_3