---
sidebar_label: 'Python Agents + rclpy Control'
title: 'Python Agents + rclpy Control'
description: 'Bridging Python agents to ROS controllers using rclpy'
---

# Python Agents + rclpy Control

## Overview

Python agents in the context of robotics refer to intelligent software entities that can perceive their environment through sensors, make decisions based on that perception, and act upon the environment through actuators. Using rclpy (Python client library for ROS 2), we can create sophisticated agents that interact with robotic systems.

## Understanding Message Passing

Message passing is the fundamental communication mechanism in ROS 2. Nodes communicate by publishing messages to topics and subscribing to topics to receive messages. This decoupled communication pattern allows for flexible and robust system architectures.

### Message Types

ROS 2 provides a rich set of standard message types in packages like `std_msgs`, `geometry_msgs`, and `sensor_msgs`. You can also define custom message types using `.msg` files.

```python
# Example of using standard message types
from std_msgs.msg import String
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
```

## Bridging Python Agents to ROS Controllers

The bridge between Python agents and ROS controllers involves creating nodes that can interpret high-level agent decisions and translate them into low-level control commands.

### Agent Architecture Pattern

A typical agent architecture includes:

1. **Perception**: Processing sensor data
2. **Decision Making**: Planning and reasoning
3. **Action**: Executing control commands
4. **Learning**: Adapting behavior based on experience

```python
import rclpy
from rclpy.node import Node
from geometry_msgs.msg import Twist
from sensor_msgs.msg import LaserScan
import numpy as np

class RobotAgent(Node):
    def __init__(self):
        super().__init__('robot_agent')

        # Publishers and subscribers
        self.cmd_vel_publisher = self.create_publisher(Twist, 'cmd_vel', 10)
        self.laser_subscriber = self.create_subscription(
            LaserScan,
            'scan',
            self.laser_callback,
            10
        )

        # Agent state
        self.laser_data = None
        self.agent_state = 'exploring'  # exploring, avoiding_obstacle, etc.

        # Timer for agent behavior
        self.timer = self.create_timer(0.1, self.agent_behavior)

    def laser_callback(self, msg):
        """Process laser scan data"""
        self.laser_data = msg.ranges

    def agent_behavior(self):
        """Main agent behavior loop"""
        if self.laser_data is None:
            return

        # Simple obstacle avoidance
        min_distance = min(self.laser_data) if self.laser_data else float('inf')

        cmd_vel = Twist()

        if min_distance < 1.0:  # Obstacle detected
            cmd_vel.linear.x = 0.0
            cmd_vel.angular.z = 0.5  # Turn right
            self.agent_state = 'avoiding_obstacle'
        else:
            cmd_vel.linear.x = 0.5  # Move forward
            cmd_vel.angular.z = 0.0
            self.agent_state = 'exploring'

        self.cmd_vel_publisher.publish(cmd_vel)
```

## Implementing Intelligent Agents

### State Machines

State machines are a common pattern for implementing agent behavior:

```python
from enum import Enum

class AgentState(Enum):
    IDLE = 1
    EXPLORING = 2
    AVOIDING_OBSTACLE = 3
    GOAL_SEEKING = 4
    RECHARGING = 5

class StateMachineAgent(Node):
    def __init__(self):
        super().__init__('state_machine_agent')
        self.current_state = AgentState.IDLE
        self.state_functions = {
            AgentState.IDLE: self.state_idle,
            AgentState.EXPLORING: self.state_exploring,
            AgentState.AVOIDING_OBSTACLE: self.state_avoiding_obstacle,
            AgentState.GOAL_SEEKING: self.state_goal_seeking,
            AgentState.RECHARGING: self.state_recharging
        }

    def agent_tick(self):
        """Execute the current state's behavior"""
        if self.current_state in self.state_functions:
            self.state_functions[self.current_state]()

    def state_idle(self):
        """Idle state behavior"""
        cmd_vel = Twist()
        cmd_vel.linear.x = 0.0
        cmd_vel.angular.z = 0.0
        self.cmd_vel_publisher.publish(cmd_vel)

    def state_exploring(self):
        """Exploring state behavior"""
        # Implement exploration behavior
        pass

    def state_avoiding_obstacle(self):
        """Obstacle avoidance behavior"""
        # Implement obstacle avoidance
        pass
```

## Advanced Agent Patterns

### Behavior Trees

Behavior trees provide a more sophisticated approach to agent decision making:

```python
class BehaviorNode:
    def run(self):
        pass

class SequenceNode(BehaviorNode):
    def __init__(self, children):
        self.children = children

    def run(self):
        for child in self.children:
            result = child.run()
            if result != 'SUCCESS':
                return result
        return 'SUCCESS'

class SelectorNode(BehaviorNode):
    def __init__(self, children):
        self.children = children

    def run(self):
        for child in self.children:
            result = child.run()
            if result == 'SUCCESS':
                return result
        return 'FAILURE'
```

## Integration with ROS Controllers

### Controller Interfaces

ROS 2 provides various controller interfaces through the `ros2_control` framework:

```python
# Example of using JointStateController
from sensor_msgs.msg import JointState
from trajectory_msgs.msg import JointTrajectory, JointTrajectoryPoint
from control_msgs.action import FollowJointTrajectory
import rclpy.action

class AgentWithControllers(Node):
    def __init__(self):
        super().__init__('agent_with_controllers')

        # Subscribe to joint states
        self.joint_state_sub = self.create_subscription(
            JointState,
            'joint_states',
            self.joint_state_callback,
            10
        )

        # Publisher for joint trajectory commands
        self.joint_cmd_pub = self.create_publisher(
            JointTrajectory,
            '/position_trajectory_controller/joint_trajectory',
            10
        )

        # Action client for trajectory execution
        self.traj_action_client = rclpy.action.ActionClient(
            self,
            FollowJointTrajectory,
            'follow_joint_trajectory'
        )

        # Store current robot state
        self.current_positions = {}
        self.current_velocities = {}
        self.current_efforts = {}

    def joint_state_callback(self, msg):
        """Process joint state information"""
        for i, name in enumerate(msg.name):
            position = msg.position[i] if i < len(msg.position) else 0.0
            velocity = msg.velocity[i] if i < len(msg.velocity) else 0.0
            effort = msg.effort[i] if i < len(msg.effort) else 0.0

            # Update agent's understanding of robot state
            self.current_positions[name] = position
            self.current_velocities[name] = velocity
            self.current_efforts[name] = effort

    def send_joint_trajectory(self, joint_names, positions, velocities=None, duration=5.0):
        """Send a joint trajectory command"""
        traj_msg = JointTrajectory()
        traj_msg.joint_names = joint_names

        point = JointTrajectoryPoint()
        point.positions = positions
        if velocities:
            point.velocities = velocities
        point.time_from_start.sec = int(duration)
        point.time_from_start.nanosec = int((duration - int(duration)) * 1e9)

        traj_msg.points = [point]

        self.joint_cmd_pub.publish(traj_msg)

    def execute_trajectory_action(self, joint_names, trajectory_points):
        """Execute trajectory using action interface"""
        goal_msg = FollowJointTrajectory.Goal()
        goal_msg.trajectory.joint_names = joint_names
        goal_msg.trajectory.points = trajectory_points

        # Wait for action server
        self.traj_action_client.wait_for_server()

        # Send goal
        self.traj_action_client.send_goal_async(goal_msg)
```

### Hardware Interface Considerations

When designing agents that interact with real hardware, several considerations are important:

#### Real-time Constraints

```python
import threading
from rclpy.qos import QoSProfile, QoSReliabilityPolicy

class RealTimeAgent(Node):
    def __init__(self):
        super().__init__('realtime_agent')

        # High-frequency control loop
        self.control_freq = 100  # Hz
        self.control_period = 1.0 / self.control_freq

        # QoS for real-time communication
        rt_qos = QoSProfile(
            depth=1,
            reliability=QoSReliabilityPolicy.RELIABLE
        )

        # Publishers and subscribers for control
        self.cmd_pub = self.create_publisher(JointTrajectory, 'cmd_joint_trajectory', rt_qos)
        self.sensor_sub = self.create_subscription(
            JointState, 'joint_states', self.sensor_callback, rt_qos
        )

        # Use dedicated thread for control loop
        self.control_thread = threading.Thread(target=self.control_loop)
        self.control_running = True

        # Start control thread
        self.control_thread.start()

    def sensor_callback(self, msg):
        """Update internal state with latest sensor readings"""
        # Store in thread-safe manner
        self.latest_sensor_msg = msg

    def control_loop(self):
        """Real-time control loop running in dedicated thread"""
        import time

        while self.control_running:
            start_time = time.time()

            # Perform control calculations
            if hasattr(self, 'latest_sensor_msg'):
                cmd = self.compute_control_command(self.latest_sensor_msg)
                self.cmd_pub.publish(cmd)

            # Maintain consistent timing
            elapsed = time.time() - start_time
            sleep_time = self.control_period - elapsed
            if sleep_time > 0:
                time.sleep(sleep_time)
            else:
                self.get_logger().warn('Control loop exceeded period by {:.4f}s'.format(-sleep_time))

    def compute_control_command(self, sensor_msg):
        """Compute control command from sensor data"""
        # Implement control algorithm (PD, PID, etc.)
        cmd = JointTrajectory()
        # Fill in command based on control law
        return cmd
```

## Machine Learning Integration

Modern robotics increasingly involves ML agents that learn from experience and adapt their behavior.

### Reinforcement Learning Agent

```python
import numpy as np
from std_msgs.msg import Float32

class RLAgent(Node):
    def __init__(self):
        super().__init__('rl_agent')

        # Environment state subscription
        self.observation_sub = self.create_subscription(
            JointState, 'observation', self.observation_callback, 10
        )

        # Action publisher
        self.action_pub = self.create_publisher(JointTrajectory, 'action', 10)

        # Reward feedback
        self.reward_sub = self.create_subscription(Float32, 'reward', self.reward_callback, 10)

        # Internal state
        self.current_observation = None
        self.current_reward = 0.0
        self.episode_steps = 0

        # ML model (placeholder - would typically be a neural network)
        self.policy_network = self.initialize_policy()

        # Training timer
        self.train_timer = self.create_timer(0.1, self.training_callback)

    def initialize_policy(self):
        """Initialize the policy network"""
        # This would typically involve loading a pre-trained model
        # or initializing weights for training
        return {
            'weights': np.random.rand(10, 8),  # Example: 8 obs dimensions to 10 action dimensions
            'bias': np.zeros(10),
            'learning_rate': 0.001
        }

    def observation_callback(self, msg):
        """Process observation from environment"""
        # Convert sensor message to observation vector
        observation = self.extract_features(msg)
        self.current_observation = observation

        # Compute action based on current policy
        action = self.select_action(observation)

        # Publish action
        self.publish_action(action)

    def extract_features(self, msg):
        """Extract relevant features from JointState message"""
        # Convert joint states to feature vector
        positions = np.array(msg.position)[:4]  # Take first 4 joints as example
        velocities = np.array(msg.velocity)[:4]  # Take first 4 velocities

        # Normalize features
        normalized_pos = np.tanh(positions)  # Normalize to [-1, 1]
        normalized_vel = np.tanh(velocities)  # Normalize to [-1, 1]

        # Concatenate features
        features = np.concatenate([normalized_pos, normalized_vel])

        return features

    def select_action(self, observation):
        """Select action using current policy"""
        # Forward pass through policy network
        hidden = np.dot(self.policy_network['weights'], observation) + self.policy_network['bias']
        action_values = np.tanh(hidden)  # Activation function

        # Add some noise for exploration (during training)
        if self.training_enabled:
            noise_scale = 0.1
            action_values += np.random.normal(0, noise_scale, action_values.shape)

        return action_values

    def publish_action(self, action):
        """Convert agent action to ROS message and publish"""
        cmd = JointTrajectory()
        cmd.joint_names = ['joint1', 'joint2', 'joint3', 'joint4']  # Example joint names

        point = JointTrajectoryPoint()
        # Map action values to joint positions/velocities
        point.positions = [float(a) for a in action[:4]]  # Use first 4 for positions
        point.velocities = [float(a) for a in action[4:8]]  # Use next 4 for velocities

        cmd.points = [point]
        self.action_pub.publish(cmd)

    def reward_callback(self, msg):
        """Process reward signal"""
        self.current_reward = msg.data

    def training_callback(self):
        """Perform training/update step"""
        # This is a simplified example - a real RL implementation would be more complex
        pass

    def update_policy(self, observation, action, reward, next_observation):
        """Update policy based on experience"""
        # Compute TD error (simplified)
        target = reward  # Simplified: immediate reward only

        # Compute gradient-based update
        grad_w = np.outer(action, observation) * self.policy_network['learning_rate']

        # Update weights
        self.policy_network['weights'] -= grad_w
```

## Agent Communication Patterns

Robots often need to coordinate with other agents or humans. Here are common communication patterns:

### Blackboard Architecture

```python
from std_msgs.msg import String

class BlackboardNode(Node):
    """Central blackboard for inter-agent communication"""
    def __init__(self):
        super().__init__('blackboard')

        # Topic for writing to blackboard
        self.write_pub = self.create_publisher(String, 'blackboard/write', 10)

        # Topic for reading from blackboard
        self.read_sub = self.create_subscription(
            String, 'blackboard/read_request', self.read_request_cb, 10
        )

        # Topic for notifications
        self.notify_pub = self.create_publisher(String, 'blackboard/notification', 10)

        # Internal blackboard storage
        self.entries = {}

    def read_request_cb(self, msg):
        """Handle read requests"""
        key = msg.data
        if key in self.entries:
            response_msg = String()
            response_msg.data = f"{key}:{self.entries[key]}"
            # In a real implementation, use service calls or more sophisticated response mechanism
```

### Publisher-Agent Pattern

```python
class PublisherAgent(Node):
    """Agent that coordinates other agents through pub/sub"""
    def __init__(self):
        super().__init__('publisher_agent')

        # Publishers for coordinating other agents
        self.agent1_pub = self.create_publisher(String, 'agent1_commands', 10)
        self.agent2_pub = self.create_publisher(String, 'agent2_commands', 10)

        # Subscribers for monitoring other agents
        self.agent1_status_sub = self.create_subscription(
            String, 'agent1_status', self.agent1_status_cb, 10
        )
        self.agent2_status_sub = self.create_subscription(
            String, 'agent2_status', self.agent2_status_cb, 10
        )

        # Coordination timer
        self.coordination_timer = self.create_timer(1.0, self.coordination_callback)

        # Internal state for coordination
        self.agent_statuses = {'agent1': 'idle', 'agent2': 'idle'}
        self.active_tasks = []

    def agent1_status_cb(self, msg):
        """Update agent1 status"""
        self.agent_statuses['agent1'] = msg.data

    def agent2_status_cb(self, msg):
        """Update agent2 status"""
        self.agent_statuses['agent2'] = msg.data

    def coordination_callback(self):
        """Make coordination decisions"""
        # Example: if agent1 is idle and there's work, assign it
        if self.agent_statuses['agent1'] == 'idle' and self.has_work():
            # Assign work to agent1
            work_msg = String()
            work_msg.data = f'do_task:{self.get_next_task()}'
            self.agent1_pub.publish(work_msg)

    def has_work(self):
        """Check if there's work available"""
        # Implementation depends on the task system
        return len(self.active_tasks) > 0

    def get_next_task(self):
        """Get the next task to assign"""
        # Return first task in queue or None
        return self.active_tasks[0] if self.active_tasks else None
```

## Knowledge Summary

This chapter covered advanced topics in integrating Python agents with ROS 2 systems:

- **Message Passing**: Detailed exploration of communication mechanisms in ROS 2 with emphasis on efficient and reliable message handling
- **Agent Architectures**: Implementation of state machines, behavior trees, and other sophisticated agent architectures
- **Controller Integration**: Connecting agents with ROS 2 control systems for real-world interaction
- **Real-time Considerations**: Approaches to meet timing requirements in robotic systems
- **Machine Learning Integration**: Incorporating reinforcement learning and other ML techniques into robotic agents
- **Communication Patterns**: Various approaches for inter-agent communication and coordination

These advanced concepts enable developers to build sophisticated robotic agents capable of complex behaviors, learning, and coordination.

## Exercises

1. Implement a complete reinforcement learning environment using ROS 2 messages for state, action, and reward communication.

2. Design and implement a multi-agent system where multiple ROS nodes coordinate to achieve a common goal using the publisher-agent pattern.

3. Create a real-time control node that meets strict timing requirements and interfaces with both simulation and physical hardware.

4. Implement a behavior tree-based agent that can switch between different behaviors based on environmental conditions and internal state.

5. Integrate a pre-trained machine learning model (using TensorFlow/PyTorch) into a ROS 2 agent for perception or decision-making tasks.

## References

1. ROS 2 Python Client Library: https://docs.ros.org/en/humble/p/rclpy/
2. Behavior Trees in Robotics: https://arxiv.org/abs/1709.00084
3. ROS 2 Control: https://control.ros.org/
4. Reinforcement Learning for Robotics: https://arxiv.org/abs/1810.06614
5. Real-time ROS 2: https://docs.ros.org/en/humble/How-To-Guides/Real-Time-Programming.html