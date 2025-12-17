---
sidebar_label: 'ROS 2 Fundamentals'
title: 'ROS 2 Fundamentals'
description: 'Understanding the fundamentals of ROS 2: Nodes, Topics, Services, and Actions'
---

# ROS 2 Fundamentals

## Overview

Robot Operating System 2 (ROS 2) is a flexible framework for writing robot software. It's a collection of tools, libraries, and conventions that aim to simplify the task of creating complex and robust robot behavior across a wide variety of robot platforms.

ROS 2 provides hardware abstraction, device drivers, libraries, visualizers, message-passing, package management, and more. It's designed to support the development of robot applications from research and prototyping phases to deployment and production.

## Nodes

Nodes are the fundamental building blocks of a ROS 2 system. A node is a process that performs computation and communicates with other nodes through messages. Each node runs independently and can be written in different programming languages (C++, Python, etc.).

### Creating a Node

In ROS 2, nodes are typically created by inheriting from the `rclpy.Node` class in Python or using the `rclcpp::Node` class in C++. Here's a simple example in Python:

```python
import rclpy
from rclpy.node import Node

class MinimalNode(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.get_logger().info('Hello from ROS 2 Node!')

def main(args=None):
    rclpy.init(args=args)
    minimal_node = MinimalNode()

    rclpy.spin(minimal_node)

    minimal_node.destroy_node()
    rclpy.shutdown()

if __name__ == '__main__':
    main()
```

## Topics

Topics are named buses over which nodes exchange messages. They implement a publish/subscribe communication pattern where publishers send messages to topics and subscribers receive messages from topics.

### Publishers and Subscribers

- **Publisher**: A node that sends messages to a topic
- **Subscriber**: A node that receives messages from a topic

```python
# Publisher example
import rclpy
from rclpy.node import Node
from std_msgs.msg import String

class MinimalPublisher(Node):
    def __init__(self):
        super().__init__('minimal_publisher')
        self.publisher_ = self.create_publisher(String, 'topic', 10)
        timer_period = 0.5  # seconds
        self.timer = self.create_timer(timer_period, self.timer_callback)
        self.i = 0

    def timer_callback(self):
        msg = String()
        msg.data = 'Hello World: %d' % self.i
        self.publisher_.publish(msg)
        self.get_logger().info('Publishing: "%s"' % msg.data)
        self.i += 1
```

## Services

Services provide a request/response communication pattern in ROS 2. A service has a client that sends a request and a server that processes the request and returns a response.

### Service Definition

Services are defined using `.srv` files that specify the request and response message types:

```
# Request message
string name
int32 age
---
# Response message
bool success
string message
```

## Actions

Actions are used for long-running tasks in ROS 2. They extend the service concept by adding feedback during execution and the ability to cancel a task.

### Action Components

- **Goal**: Request to start an action
- **Feedback**: Periodic updates during execution
- **Result**: Final outcome of the action

## DDS Communication for Robots

ROS 2 uses Data Distribution Service (DDS) as its middleware. DDS provides the underlying communication layer that enables the publish/subscribe, service, and action patterns.

DDS provides:
- **Discovery**: Automatic discovery of nodes
- **Quality of Service (QoS)**: Configurable communication behavior
- **Reliability**: Guaranteed delivery options
- **Real-time performance**: Support for real-time systems

## Knowledge Summary

This chapter covered the fundamental concepts of ROS 2:
- Nodes as the basic computational units
- Topics for publish/subscribe communication
- Services for request/response communication
- Actions for long-running tasks with feedback
- DDS as the underlying communication middleware

## Exercises

1. Create a simple ROS 2 node that publishes a counter value every second
2. Create a subscriber that receives the counter value and prints it to the console
3. Implement a service that adds two numbers together
4. Research and compare the QoS policies available in ROS 2

## References

1. ROS 2 Documentation: https://docs.ros.org/en/humble/
2. ROS 2 Tutorials: https://docs.ros.org/en/humble/Tutorials.html
3. DDS Specification: https://www.omg.org/spec/DDS/About-DDS/