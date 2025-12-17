---
sidebar_position: 1
title: "Voice-to-Action (Whisper + ROS 2)"
---

# Voice-to-Action (Whisper + ROS 2)

## Introduction to Voice-to-Action Systems

Voice-to-Action systems enable natural human-robot interaction by allowing users to control robots through spoken commands. By combining OpenAI's Whisper for speech recognition with ROS 2's distributed computing framework, we can create robust voice-controlled robotic systems that understand natural language and execute complex robotic tasks.

## System Architecture

The voice-to-action system consists of several interconnected components:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Voice Input   │    │   Speech        │    │   Natural       │
│   (Microphone)  │───▶│   Recognition   │───▶│   Language      │
│                 │    │   (Whisper)     │    │   Processing    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                                    │
                                                    ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   ROS 2         │    │   Command       │    │   Action        │
│   Action        │◀───│   Mapping       │◀───│   Execution     │
│   Client        │    │   Engine        │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## Setting Up Whisper for ROS 2 Integration

### Installation and Dependencies

```bash
# Install Whisper dependencies
pip install openai-whisper
pip install torch torchvision torchaudio
pip install sounddevice numpy

# ROS 2 dependencies
sudo apt install ros-humble-audio-common
sudo apt install ros-humble-std-srvs
```

### Basic Whisper Node Implementation

```python
import rclpy
from rclpy.node import Node
import whisper
import numpy as np
import sounddevice as sd
from std_msgs.msg import String
from audio_common_msgs.msg import AudioData
import threading
import queue

class WhisperROSNode(Node):
    def __init__(self):
        super().__init__('whisper_ros_node')

        # Initialize Whisper model
        self.model = whisper.load_model("base")  # or "small", "medium", "large"

        # Audio parameters
        self.sample_rate = 16000
        self.chunk_duration = 5  # seconds
        self.audio_queue = queue.Queue()

        # Publishers and subscribers
        self.command_publisher = self.create_publisher(
            String, 'voice_commands', 10
        )

        self.audio_subscriber = self.create_subscription(
            AudioData, 'audio_input', self.audio_callback, 10
        )

        # Start audio processing thread
        self.audio_thread = threading.Thread(target=self.process_audio, daemon=True)
        self.audio_thread.start()

        self.get_logger().info('Whisper ROS Node initialized')

    def audio_callback(self, msg):
        """Callback for audio data from microphone"""
        # Convert audio data to numpy array
        audio_data = np.frombuffer(msg.data, dtype=np.int16).astype(np.float32)
        audio_data /= 32768.0  # Normalize to [-1, 1]

        # Add to processing queue
        self.audio_queue.put(audio_data)

    def process_audio(self):
        """Process audio chunks and perform speech recognition"""
        while rclpy.ok():
            try:
                # Get audio chunk from queue
                audio_chunk = self.audio_queue.get(timeout=1.0)

                # Convert audio to the format expected by Whisper
                # Whisper expects audio at 16kHz
                if len(audio_chunk) > 0:
                    # Transcribe the audio
                    result = self.model.transcribe(audio_chunk)
                    text = result['text'].strip()

                    if text:  # Only publish if there's actual text
                        self.get_logger().info(f'Recognized: {text}')
                        cmd_msg = String()
                        cmd_msg.data = text
                        self.command_publisher.publish(cmd_msg)

            except queue.Empty:
                continue
            except Exception as e:
                self.get_logger().error(f'Error processing audio: {e}')
```

## Natural Language Command Processing

### Command Parser Implementation

```python
import re
from typing import Dict, List, Optional
from dataclasses import dataclass

@dataclass
class RobotCommand:
    action: str
    parameters: Dict[str, any]
    confidence: float

class CommandParser:
    def __init__(self):
        # Define command patterns
        self.command_patterns = {
            'move': [
                r'move\s+(?P<direction>forward|backward|left|right)\s*(?P<distance>\d+\.?\d*)?\s*(?P<unit>meters?|cm|mm)?',
                r'go\s+(?P<direction>forward|backward|left|right)\s*(?P<distance>\d+\.?\d*)?\s*(?P<unit>meters?|cm|mm)?',
                r'walk\s+(?P<direction>forward|backward|left|right)\s*(?P<distance>\d+\.?\d*)?\s*(?P<unit>meters?|cm|mm)?'
            ],
            'rotate': [
                r'rotate\s+(?P<direction>left|right|clockwise|counterclockwise)\s*(?P<angle>\d+\.?\d*)?\s*(?P<unit>degrees?|radians?)?',
                r'turn\s+(?P<direction>left|right|clockwise|counterclockwise)\s*(?P<angle>\d+\.?\d*)?\s*(?P<unit>degrees?|radians?)?',
                r'spin\s+(?P<direction>left|right|clockwise|counterclockwise)\s*(?P<angle>\d+\.?\d*)?\s*(?P<unit>degrees?|radians?)?'
            ],
            'arm': [
                r'move\s+arm\s+to\s+(?P<position>.+)',
                r'pick\s+up\s+(?P<object>.+)',
                r'grasp\s+(?P<object>.+)',
                r'release\s+(?P<object>.+)'
            ],
            'stop': [
                r'stop',
                r'pause',
                r'hold',
                r'freeze'
            ],
            'follow': [
                r'follow\s+(?P<target>.+)',
                r'go\s+to\s+(?P<location>.+)',
                r'navigate\s+to\s+(?P<location>.+)'
            ]
        }

    def parse_command(self, text: str) -> Optional[RobotCommand]:
        """Parse natural language command and extract structured information"""
        text = text.lower().strip()

        for action, patterns in self.command_patterns.items():
            for pattern in patterns:
                match = re.search(pattern, text)
                if match:
                    params = match.groupdict()

                    # Process parameters
                    processed_params = {}
                    for key, value in params.items():
                        if value is not None:
                            processed_params[key] = self._process_parameter(key, value)

                    # Calculate confidence based on match quality
                    confidence = self._calculate_confidence(text, pattern, match)

                    return RobotCommand(
                        action=action,
                        parameters=processed_params,
                        confidence=confidence
                    )

        return None

    def _process_parameter(self, key: str, value: str) -> any:
        """Process and convert parameter values"""
        if key in ['distance', 'angle']:
            try:
                return float(value)
            except ValueError:
                return value
        return value

    def _calculate_confidence(self, text: str, pattern: str, match) -> float:
        """Calculate confidence score for the match"""
        # Simple confidence calculation based on match length
        match_length = len(match.group(0))
        text_length = len(text)
        return min(1.0, match_length / text_length)
```

## ROS 2 Action Client for Voice Commands

```python
import rclpy
from rclpy.action import ActionClient
from rclpy.node import Node
from geometry_msgs.msg import Twist, Pose
from nav2_msgs.action import NavigateToPose
from std_msgs.msg import String

class VoiceCommandExecutor(Node):
    def __init__(self):
        super().__init__('voice_command_executor')

        # Command parser
        self.command_parser = CommandParser()

        # Publishers
        self.cmd_vel_publisher = self.create_publisher(Twist, 'cmd_vel', 10)
        self.status_publisher = self.create_publisher(String, 'voice_status', 10)

        # Action clients
        self.nav_client = ActionClient(self, NavigateToPose, 'navigate_to_pose')

        # Subscriber for voice commands
        self.voice_subscriber = self.create_subscription(
            String, 'voice_commands', self.voice_command_callback, 10
        )

        self.get_logger().info('Voice Command Executor initialized')

    def voice_command_callback(self, msg):
        """Process incoming voice commands"""
        command_text = msg.data
        self.get_logger().info(f'Received voice command: {command_text}')

        # Parse the command
        parsed_command = self.command_parser.parse_command(command_text)

        if parsed_command and parsed_command.confidence > 0.5:
            self.get_logger().info(
                f'Parsed command: {parsed_command.action} with confidence {parsed_command.confidence}'
            )
            self.execute_command(parsed_command)
        else:
            self.get_logger().warning(f'Could not parse command: {command_text}')
            self.publish_status('Command not recognized')

    def execute_command(self, command: RobotCommand):
        """Execute the parsed command"""
        if command.action == 'move':
            self.execute_move_command(command.parameters)
        elif command.action == 'rotate':
            self.execute_rotate_command(command.parameters)
        elif command.action == 'stop':
            self.execute_stop_command()
        elif command.action == 'follow':
            self.execute_follow_command(command.parameters)
        elif command.action == 'arm':
            self.execute_arm_command(command.parameters)
        else:
            self.get_logger().warning(f'Unknown command action: {command.action}')
            self.publish_status(f'Unknown command: {command.action}')

    def execute_move_command(self, params: Dict):
        """Execute movement command"""
        msg = Twist()

        distance = params.get('distance', 1.0)  # default 1 meter
        direction = params.get('direction', 'forward')

        if direction in ['forward', 'ahead']:
            msg.linear.x = 0.5  # m/s
        elif direction == 'backward':
            msg.linear.x = -0.5
        elif direction == 'left':
            msg.linear.y = 0.5
        elif direction == 'right':
            msg.linear.y = -0.5

        # Publish for duration based on distance
        duration = distance / 0.5  # assuming 0.5 m/s
        self.move_for_duration(msg, duration)

    def execute_rotate_command(self, params: Dict):
        """Execute rotation command"""
        msg = Twist()

        angle = params.get('angle', 90.0)  # default 90 degrees
        direction = params.get('direction', 'left')

        if direction in ['left', 'counterclockwise']:
            msg.angular.z = 0.5  # rad/s
        elif direction in ['right', 'clockwise']:
            msg.angular.z = -0.5

        # Calculate duration for rotation
        duration = abs(angle) / 180.0 * 3.14159 / 0.5  # convert degrees to time
        self.rotate_for_duration(msg, duration)

    def move_for_duration(self, twist_msg, duration):
        """Move robot for specified duration"""
        start_time = self.get_clock().now()
        end_time = start_time + rclpy.time.Duration(seconds=duration)

        while self.get_clock().now() < end_time:
            self.cmd_vel_publisher.publish(twist_msg)
            rclpy.spin_once(self, timeout_sec=0.1)

        # Stop robot
        stop_msg = Twist()
        self.cmd_vel_publisher.publish(stop_msg)

    def rotate_for_duration(self, twist_msg, duration):
        """Rotate robot for specified duration"""
        start_time = self.get_clock().now()
        end_time = start_time + rclpy.time.Duration(seconds=duration)

        while self.get_clock().now() < end_time:
            self.cmd_vel_publisher.publish(twist_msg)
            rclpy.spin_once(self, timeout_sec=0.1)

        # Stop robot
        stop_msg = Twist()
        self.cmd_vel_publisher.publish(stop_msg)

    def execute_stop_command(self):
        """Stop all robot motion"""
        stop_msg = Twist()
        self.cmd_vel_publisher.publish(stop_msg)
        self.publish_status('Robot stopped')

    def execute_follow_command(self, params: Dict):
        """Execute navigation command"""
        location = params.get('location', params.get('target', 'unknown'))

        if location == 'kitchen':
            # Navigate to kitchen coordinates
            self.navigate_to_coordinates(-2.0, 1.5, 0.0)
        elif location == 'living room':
            # Navigate to living room coordinates
            self.navigate_to_coordinates(1.0, -2.0, 0.0)
        else:
            self.get_logger().warning(f'Unknown location: {location}')
            self.publish_status(f'Unknown location: {location}')

    def navigate_to_coordinates(self, x, y, theta):
        """Navigate to specific coordinates using Nav2"""
        goal_msg = NavigateToPose.Goal()
        goal_msg.pose.header.frame_id = 'map'
        goal_msg.pose.header.stamp = self.get_clock().now().to_msg()
        goal_msg.pose.pose.position.x = x
        goal_msg.pose.pose.position.y = y
        goal_msg.pose.pose.position.z = 0.0

        # Convert theta to quaternion
        import math
        goal_msg.pose.pose.orientation.z = math.sin(theta / 2.0)
        goal_msg.pose.pose.orientation.w = math.cos(theta / 2.0)

        self.nav_client.wait_for_server()
        self._send_goal_future = self.nav_client.send_goal_async(
            goal_msg,
            feedback_callback=self.nav_feedback_callback
        )
        self._send_goal_future.add_done_callback(self.nav_goal_response_callback)

    def nav_feedback_callback(self, feedback_msg):
        """Navigation feedback callback"""
        self.get_logger().info(
            f'Navigation feedback: {feedback_msg.feedback.distance_remaining}m remaining'
        )

    def nav_goal_response_callback(self, future):
        """Navigation goal response callback"""
        goal_handle = future.result()
        if not goal_handle.accepted:
            self.get_logger().info('Navigation goal rejected')
            self.publish_status('Navigation goal rejected')
            return

        self.get_logger().info('Navigation goal accepted')
        self.publish_status('Navigation in progress')

    def publish_status(self, status: str):
        """Publish status message"""
        msg = String()
        msg.data = status
        self.status_publisher.publish(msg)
```

## Advanced Voice Processing with Context Awareness

### Context Manager for Multi-Turn Conversations

```python
from dataclasses import dataclass
from typing import Dict, Any
import time

@dataclass
class ConversationContext:
    current_task: str = ""
    task_parameters: Dict[str, Any] = None
    last_command_time: float = 0.0
    user_id: str = "default"

class ContextAwareVoiceProcessor:
    def __init__(self):
        self.contexts: Dict[str, ConversationContext] = {}
        self.command_history = []

    def process_command_with_context(self, text: str, user_id: str = "default"):
        """Process command considering conversation context"""
        # Get or create context for user
        if user_id not in self.contexts:
            self.contexts[user_id] = ConversationContext(user_id=user_id)

        context = self.contexts[user_id]

        # If in middle of a task, handle follow-up commands
        if context.current_task and self._is_followup_command(text):
            return self._handle_followup(text, context)

        # Parse new command
        parsed_command = self.command_parser.parse_command(text)

        if parsed_command:
            # Update context
            context.current_task = parsed_command.action
            context.last_command_time = time.time()

            # Add to history
            self.command_history.append({
                'command': parsed_command,
                'user_id': user_id,
                'timestamp': time.time()
            })

        return parsed_command

    def _is_followup_command(self, text: str) -> bool:
        """Check if command is a follow-up to previous command"""
        followup_indicators = ['more', 'faster', 'slower', 'continue', 'again', 'please']
        text_lower = text.lower()
        return any(indicator in text_lower for indicator in followup_indicators)

    def _handle_followup(self, text: str, context: ConversationContext):
        """Handle follow-up command to current task"""
        # Modify current task based on follow-up
        if context.current_task in ['move', 'rotate']:
            # Add speed or distance modification
            if 'faster' in text.lower():
                context.task_parameters = {'speed_multiplier': 1.5}
            elif 'slower' in text.lower():
                context.task_parameters = {'speed_multiplier': 0.5}

        return RobotCommand(
            action=context.current_task,
            parameters={**context.task_parameters, 'followup': True},
            confidence=0.8
        )
```

## Audio Preprocessing and Noise Reduction

### Audio Enhancement for Better Recognition

```python
import numpy as np
from scipy import signal
import webrtcvad

class AudioPreprocessor:
    def __init__(self):
        # Initialize WebRTC VAD for voice activity detection
        self.vad = webrtcvad.Vad()
        self.vad.set_mode(1)  # Aggressiveness mode (0-3)

        # Audio parameters
        self.sample_rate = 16000
        self.frame_duration = 30  # ms
        self.frame_size = int(self.sample_rate * self.frame_duration / 1000)

    def preprocess_audio(self, audio_data: np.ndarray) -> np.ndarray:
        """Preprocess audio for better Whisper recognition"""
        # Apply noise reduction
        audio_clean = self._reduce_noise(audio_data)

        # Apply voice activity detection
        audio_vad = self._apply_vad(audio_clean)

        # Normalize audio
        audio_normalized = self._normalize_audio(audio_vad)

        return audio_normalized

    def _reduce_noise(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply basic noise reduction"""
        # Simple spectral subtraction for noise reduction
        # In practice, use more sophisticated methods like spectral gating
        return audio_data

    def _apply_vad(self, audio_data: np.ndarray) -> np.ndarray:
        """Apply voice activity detection to remove silence"""
        # Split audio into frames for VAD
        frames = self._frame_audio(audio_data)
        voiced_frames = []

        for frame in frames:
            # Convert to 16-bit PCM for VAD
            frame_pcm = (frame * 32767).astype(np.int16)
            is_speech = self.vad.is_speech(
                frame_pcm.tobytes(),
                self.sample_rate
            )
            if is_speech:
                voiced_frames.append(frame)

        if voiced_frames:
            return np.concatenate(voiced_frames)
        else:
            return audio_data  # Return original if no speech detected

    def _normalize_audio(self, audio_data: np.ndarray) -> np.ndarray:
        """Normalize audio amplitude"""
        if len(audio_data) > 0:
            max_amplitude = np.max(np.abs(audio_data))
            if max_amplitude > 0:
                return audio_data / max_amplitude
        return audio_data

    def _frame_audio(self, audio_data: np.ndarray) -> List[np.ndarray]:
        """Split audio into frames for VAD processing"""
        frames = []
        for i in range(0, len(audio_data), self.frame_size):
            frame = audio_data[i:i + self.frame_size]
            # Pad if necessary
            if len(frame) < self.frame_size:
                frame = np.pad(frame, (0, self.frame_size - len(frame)))
            frames.append(frame)
        return frames
```

## Integration with ROS 2 Launch System

### Launch File for Voice-to-Action System

```xml
<!-- voice_to_action.launch.py -->
from launch import LaunchDescription
from launch_ros.actions import Node
from launch.actions import DeclareLaunchArgument
from launch.substitutions import LaunchConfiguration

def generate_launch_description():
    return LaunchDescription([
        # Declare launch arguments
        DeclareLaunchArgument(
            'whisper_model',
            default_value='base',
            description='Whisper model size (tiny, base, small, medium, large)'
        ),

        # Whisper ROS node
        Node(
            package='voice_to_action',
            executable='whisper_ros_node',
            name='whisper_node',
            parameters=[
                {
                    'model_size': LaunchConfiguration('whisper_model'),
                    'sample_rate': 16000,
                    'chunk_duration': 5.0
                }
            ],
            output='screen'
        ),

        # Command executor node
        Node(
            package='voice_to_action',
            executable='voice_command_executor',
            name='command_executor',
            parameters=[
                {
                    'command_timeout': 30.0,
                    'confidence_threshold': 0.5
                }
            ],
            output='screen'
        ),

        # Audio input node (if using direct microphone input)
        Node(
            package='audio_capture',
            executable='audio_capture_node',
            name='audio_input',
            parameters=[
                {
                    'device_index': -1,  # Use default device
                    'sample_rate': 16000,
                    'chunk_size': 1024
                }
            ],
            output='screen'
        )
    ])
```

## Performance Optimization and Real-Time Considerations

### Efficient Audio Processing Pipeline

```python
import asyncio
import threading
from collections import deque
import time

class RealTimeVoiceProcessor:
    def __init__(self):
        self.audio_buffer = deque(maxlen=10)  # Circular buffer
        self.is_processing = False
        self.last_transcription_time = 0
        self.min_transcription_interval = 2.0  # seconds

        # Threading for non-blocking processing
        self.processing_lock = threading.Lock()

    async def process_audio_stream(self, audio_stream):
        """Process continuous audio stream efficiently"""
        async for audio_chunk in audio_stream:
            # Add to buffer
            self.audio_buffer.append(audio_chunk)

            # Check if it's time for transcription
            current_time = time.time()
            if (current_time - self.last_transcription_time >
                self.min_transcription_interval and
                not self.is_processing):

                # Start transcription in background
                asyncio.create_task(self._transcribe_buffer())

    async def _transcribe_buffer(self):
        """Transcribe accumulated audio buffer"""
        with self.processing_lock:
            if self.is_processing:
                return

            self.is_processing = True

        try:
            # Combine audio chunks
            combined_audio = np.concatenate(list(self.audio_buffer))

            if len(combined_audio) > 0:
                # Perform transcription
                result = await self._async_transcribe(combined_audio)

                # Publish result
                self.publish_transcription(result)

                self.last_transcription_time = time.time()

        finally:
            self.is_processing = False

    async def _async_transcribe(self, audio_data):
        """Asynchronous transcription to avoid blocking"""
        # In practice, this would use async Whisper API or run in thread pool
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(None, self.model.transcribe, audio_data)
```

## Error Handling and Robustness

### Comprehensive Error Handling

```python
class RobustVoiceToAction:
    def __init__(self):
        self.error_count = 0
        self.max_errors = 5
        self.error_recovery_time = 30  # seconds
        self.last_error_time = 0

    def safe_process_audio(self, audio_data):
        """Safely process audio with error handling"""
        try:
            # Check if we're in error recovery mode
            if (self.error_count >= self.max_errors and
                time.time() - self.last_error_time < self.error_recovery_time):
                self.get_logger().warning('In error recovery mode, skipping processing')
                return None

            # Process audio
            result = self._process_audio_internal(audio_data)

            # Reset error count on success
            self.error_count = 0
            return result

        except Exception as e:
            self.error_count += 1
            self.last_error_time = time.time()
            self.get_logger().error(f'Audio processing error #{self.error_count}: {e}')

            # Trigger recovery if needed
            if self.error_count >= self.max_errors:
                self._trigger_error_recovery()

            return None

    def _trigger_error_recovery(self):
        """Trigger recovery procedures"""
        self.get_logger().info('Triggering error recovery procedures')

        # Restart audio input
        self._restart_audio_input()

        # Reinitialize Whisper model if needed
        self._reinitialize_model()

        # Reset error count
        self.error_count = 0
```

## Summary

The Voice-to-Action system combines OpenAI's Whisper for speech recognition with ROS 2's distributed computing framework to create natural human-robot interaction. Key components include audio preprocessing, speech recognition, natural language processing, and command execution. The system handles various voice commands from simple movements to complex navigation tasks, with considerations for real-time performance, error handling, and context awareness.

In the next chapter, we'll explore cognitive planning using LLMs for more sophisticated robot behavior.