---
sidebar_position: 2
title: "Cognitive Planning Using LLMs"
---

# Cognitive Planning Using LLMs

## Introduction to LLM-Based Cognitive Planning

Large Language Models (LLMs) have emerged as powerful tools for cognitive planning in robotics, enabling robots to understand complex tasks, reason about their environment, and generate sophisticated action sequences. Unlike traditional rule-based planning systems, LLMs can handle ambiguous, natural language instructions and adapt to novel situations through their learned world knowledge.

## Architecture of LLM-Based Cognitive Planning Systems

The cognitive planning system integrates LLMs with traditional robotics frameworks:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Natural       │    │   LLM-Based     │    │   Task          │
│   Language      │───▶│   Cognitive     │───▶│   Execution     │
│   Instruction   │    │   Planning      │    │   Framework     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         ▼                       ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Environment   │    │   Plan          │    │   Robot         │
│   Perception    │◀───│   Generation    │◀───│   Actions       │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## LLM Integration Framework

### Planning Interface

```python
import openai
import json
from typing import Dict, List, Any, Optional
from dataclasses import dataclass

@dataclass
class PlanningRequest:
    task_description: str
    environment_state: Dict[str, Any]
    robot_capabilities: List[str]
    constraints: List[str]

@dataclasses
class PlanningResponse:
    plan: List[Dict[str, Any]]
    confidence: float
    reasoning: str
    execution_steps: List[str]

class LLMBasedPlanner:
    def __init__(self, api_key: str, model: str = "gpt-4-turbo"):
        self.client = openai.OpenAI(api_key=api_key)
        self.model = model

    def generate_plan(self, request: PlanningRequest) -> PlanningResponse:
        """Generate a cognitive plan using LLM"""
        prompt = self._construct_planning_prompt(request)

        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": self._get_system_prompt()},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3,
            max_tokens=2000,
            response_format={"type": "json_object"}
        )

        plan_data = json.loads(response.choices[0].message.content)
        return self._parse_plan_response(plan_data)

    def _construct_planning_prompt(self, request: PlanningRequest) -> str:
        """Construct the planning prompt for the LLM"""
        return f"""
        Task: {request.task_description}

        Environment State:
        {json.dumps(request.environment_state, indent=2)}

        Robot Capabilities:
        {', '.join(request.robot_capabilities)}

        Constraints:
        {', '.join(request.constraints)}

        Generate a detailed cognitive plan with the following structure:
        {{
            "plan": [
                {{
                    "step": 1,
                    "action": "action_description",
                    "parameters": {{"param1": "value1", ...}},
                    "preconditions": ["condition1", "condition2"],
                    "postconditions": ["condition1", "condition2"],
                    "confidence": 0.8
                }}
            ],
            "confidence": 0.9,
            "reasoning": "Step-by-step reasoning for the plan",
            "execution_steps": ["step1_description", "step2_description"]
        }}

        Ensure the plan is executable with the given robot capabilities and respects all constraints.
        """

    def _get_system_prompt(self) -> str:
        """System prompt for cognitive planning"""
        return """
        You are an expert cognitive planning system for robotics. Your role is to generate detailed, executable plans for robots based on natural language instructions. Consider:

        1. Environmental constraints and object locations
        2. Robot capabilities and limitations
        3. Safety requirements
        4. Task dependencies and logical sequence
        5. Potential failure modes and recovery strategies

        Provide structured JSON output with detailed reasoning and confidence scores.
        """

    def _parse_plan_response(self, response_data: Dict) -> PlanningResponse:
        """Parse and validate the LLM response"""
        return PlanningResponse(
            plan=response_data.get("plan", []),
            confidence=response_data.get("confidence", 0.5),
            reasoning=response_data.get("reasoning", ""),
            execution_steps=response_data.get("execution_steps", [])
        )
```

## Environment Perception and State Representation

### State Perception Module

```python
import rclpy
from rclpy.node import Node
from sensor_msgs.msg import Image, PointCloud2
from nav_msgs.msg import OccupancyGrid
from std_msgs.msg import String
import cv2
from cv_bridge import CvBridge
import numpy as np
from typing import Dict, Any

class EnvironmentPerception(Node):
    def __init__(self):
        super().__init__('environment_perception')

        self.cv_bridge = CvBridge()
        self.bridge = CvBridge()

        # Subscribers for different sensor modalities
        self.image_sub = self.create_subscription(
            Image, '/camera/rgb/image_raw', self.image_callback, 10
        )
        self.depth_sub = self.create_subscription(
            Image, '/camera/depth/image_raw', self.depth_callback, 10
        )
        self.lidar_sub = self.create_subscription(
            PointCloud2, '/lidar/points', self.lidar_callback, 10
        )
        self.map_sub = self.create_subscription(
            OccupancyGrid, '/map', self.map_callback, 10
        )

        # Publisher for environment state
        self.state_pub = self.create_publisher(String, '/environment_state', 10)

        # Internal state
        self.current_objects = {}
        self.navigation_map = None
        self.robot_pose = None

    def image_callback(self, msg):
        """Process RGB camera data for object detection"""
        cv_image = self.cv_bridge.imgmsg_to_cv2(msg, desired_encoding='bgr8')

        # Perform object detection (using YOLO or similar)
        objects = self._detect_objects(cv_image)

        # Update current objects
        self.current_objects = objects

    def _detect_objects(self, image):
        """Detect and classify objects in the image"""
        # In practice, this would use a trained object detection model
        # For now, using a mock implementation
        detected_objects = {}

        # Example: detect common objects
        # This would be replaced with actual object detection
        if self._has_table(image):
            detected_objects['table'] = {
                'position': [1.0, 0.5, 0.0],
                'size': [1.0, 0.8, 0.75],
                'reachable': True
            }

        if self._has_cup(image):
            detected_objects['cup'] = {
                'position': [1.2, 0.6, 0.75],
                'size': [0.1, 0.1, 0.1],
                'reachable': True,
                'graspable': True
            }

        return detected_objects

    def lidar_callback(self, msg):
        """Process LIDAR data for obstacle detection"""
        # Process point cloud data
        obstacles = self._extract_obstacles_from_pointcloud(msg)

        # Update navigation map with obstacles
        self._update_navigation_map(obstacles)

    def map_callback(self, msg):
        """Update global navigation map"""
        self.navigation_map = msg

    def get_environment_state(self) -> Dict[str, Any]:
        """Get current environment state for planning"""
        return {
            'objects': self.current_objects,
            'navigation_map': self._serialize_map(self.navigation_map),
            'robot_pose': self.robot_pose,
            'time': self.get_clock().now().nanoseconds,
            'sensor_data': {
                'camera': 'active',
                'lidar': 'active',
                'imu': 'active'
            }
        }

    def _serialize_map(self, occupancy_grid):
        """Serialize occupancy grid for LLM processing"""
        if occupancy_grid is None:
            return None

        return {
            'resolution': occupancy_grid.info.resolution,
            'width': occupancy_grid.info.width,
            'height': occupancy_grid.info.height,
            'origin': {
                'x': occupancy_grid.info.origin.position.x,
                'y': occupancy_grid.info.origin.position.y,
                'z': occupancy_grid.info.origin.position.z
            },
            'data': occupancy_grid.data[:100]  # Sample first 100 values
        }
```

## Cognitive Reasoning and Plan Refinement

### Reasoning Engine

```python
class CognitiveReasoningEngine:
    def __init__(self, llm_planner: LLMBasedPlanner):
        self.planner = llm_planner
        self.action_history = []
        self.failure_recovery = {}

    def refine_plan(self, initial_plan: List[Dict], environment_state: Dict) -> List[Dict]:
        """Refine plan based on current environment state"""
        # Check plan feasibility
        feasible_plan = self._check_plan_feasibility(initial_plan, environment_state)

        # Identify potential issues
        issues = self._identify_plan_issues(feasible_plan, environment_state)

        if issues:
            # Request plan revision from LLM
            revised_plan = self._request_plan_revision(
                initial_plan, environment_state, issues
            )
            return revised_plan

        return feasible_plan

    def _check_plan_feasibility(self, plan: List[Dict], state: Dict) -> List[Dict]:
        """Check if each step is feasible with current state"""
        feasible_steps = []

        for step in plan:
            if self._is_step_feasible(step, state):
                feasible_steps.append(step)
            else:
                # Modify step to make it feasible
                modified_step = self._modify_step_for_feasibility(step, state)
                if modified_step:
                    feasible_steps.append(modified_step)

        return feasible_steps

    def _is_step_feasible(self, step: Dict, state: Dict) -> bool:
        """Check if a step is feasible given current state"""
        action = step['action']
        params = step.get('parameters', {})

        # Check preconditions
        preconditions = step.get('preconditions', [])
        for condition in preconditions:
            if not self._evaluate_condition(condition, state):
                return False

        # Check if robot has capability for this action
        if not self._has_robot_capability(action, state):
            return False

        return True

    def _evaluate_condition(self, condition: str, state: Dict) -> bool:
        """Evaluate a logical condition against environment state"""
        # Parse and evaluate condition
        # This is a simplified example
        if 'object_present' in condition:
            obj_name = condition.split('(')[1].split(')')[0]
            return obj_name in state.get('objects', {})

        if 'reachable' in condition:
            obj_name = condition.split('(')[1].split(')')[0]
            obj_data = state.get('objects', {}).get(obj_name, {})
            return obj_data.get('reachable', False)

        return True  # Default to true for unknown conditions

    def _has_robot_capability(self, action: str, state: Dict) -> bool:
        """Check if robot has capability to perform action"""
        capabilities = state.get('robot_capabilities', [])
        return action in capabilities

    def _modify_step_for_feasibility(self, step: Dict, state: Dict) -> Optional[Dict]:
        """Modify a step to make it feasible"""
        # Example: if object is not reachable, find alternative
        if step['action'] == 'grasp' and not self._is_object_reachable(step, state):
            # Look for alternative approach
            return self._find_alternative_grasp(step, state)

        return step  # Return original if no modification needed

    def _request_plan_revision(self, plan: List[Dict], state: Dict, issues: List[str]) -> List[Dict]:
        """Request LLM to revise plan based on identified issues"""
        revision_request = PlanningRequest(
            task_description=f"Revise plan due to issues: {', '.join(issues)}",
            environment_state=state,
            robot_capabilities=state.get('robot_capabilities', []),
            constraints=state.get('constraints', [])
        )

        response = self.planner.generate_plan(revision_request)
        return response.plan
```

## Plan Execution and Monitoring

### Execution Monitor

```python
import asyncio
from enum import Enum
from typing import Optional

class ExecutionStatus(Enum):
    PENDING = "pending"
    EXECUTING = "executing"
    SUCCESS = "success"
    FAILED = "failed"
    RECOVERING = "recovering"

class PlanExecutionMonitor:
    def __init__(self, robot_interface):
        self.robot_interface = robot_interface
        self.current_plan = []
        self.current_step = 0
        self.status = ExecutionStatus.PENDING
        self.execution_history = []

    async def execute_plan(self, plan: List[Dict]) -> bool:
        """Execute the cognitive plan step by step"""
        self.current_plan = plan
        self.current_step = 0
        self.status = ExecutionStatus.EXECUTING

        for step_idx, step in enumerate(plan):
            self.current_step = step_idx

            success = await self._execute_step(step)
            if not success:
                # Handle failure
                recovery_success = await self._handle_failure(step_idx, step)
                if not recovery_success:
                    self.status = ExecutionStatus.FAILED
                    return False

        self.status = ExecutionStatus.SUCCESS
        return True

    async def _execute_step(self, step: Dict) -> bool:
        """Execute a single plan step"""
        action = step['action']
        parameters = step.get('parameters', {})

        try:
            # Map action to robot command
            command = self._map_action_to_command(action, parameters)

            # Execute command
            result = await self.robot_interface.execute_command(command)

            # Log execution
            self.execution_history.append({
                'step': step,
                'result': result,
                'timestamp': time.time()
            })

            return result.get('success', False)

        except Exception as e:
            self.get_logger().error(f'Error executing step: {e}')
            return False

    def _map_action_to_command(self, action: str, parameters: Dict) -> Dict:
        """Map high-level action to robot command"""
        command_map = {
            'navigate': 'move_base',
            'grasp': 'manipulation/grasp',
            'place': 'manipulation/place',
            'detect': 'perception/detect'
        }

        command_type = command_map.get(action, 'generic')
        return {
            'type': command_type,
            'parameters': parameters,
            'timeout': 30.0
        }

    async def _handle_failure(self, step_idx: int, step: Dict) -> bool:
        """Handle plan execution failure"""
        self.get_logger().warning(f'Failed to execute step {step_idx}: {step}')

        # Try recovery strategies
        recovery_strategies = [
            self._retry_step,
            self._alternative_approach,
            self._request_human_assistance
        ]

        for strategy in recovery_strategies:
            try:
                success = await strategy(step)
                if success:
                    return True
            except Exception as e:
                self.get_logger().error(f'Recovery strategy failed: {e}')
                continue

        return False

    async def _retry_step(self, step: Dict) -> bool:
        """Retry the failed step"""
        self.get_logger().info('Retrying failed step...')
        return await self._execute_step(step)

    async def _alternative_approach(self, step: Dict) -> bool:
        """Try an alternative approach to achieve the same goal"""
        self.get_logger().info('Trying alternative approach...')

        # In practice, this would use LLM to generate alternative steps
        # For now, a simple example
        if step['action'] == 'grasp':
            # Try different grasp approach
            alt_step = step.copy()
            alt_step['parameters']['approach'] = 'side_grasp'
            return await self._execute_step(alt_step)

        return False
```

## Integration with ROS 2 Action Servers

### Cognitive Planning Action Server

```python
import rclpy
from rclpy.action import ActionServer, GoalResponse, CancelResponse
from rclpy.node import Node
from rclpy.executors import MultiThreadedExecutor
from std_msgs.msg import String
from geometry_msgs.msg import Pose
from cognitive_planning_msgs.action import PlanAndExecute

class CognitivePlanningServer(Node):
    def __init__(self):
        super().__init__('cognitive_planning_server')

        # Initialize components
        self.planner = LLMBasedPlanner(api_key=self._get_api_key())
        self.reasoning_engine = CognitiveReasoningEngine(self.planner)
        self.execution_monitor = PlanExecutionMonitor(self)
        self.perception = EnvironmentPerception()

        # Action server
        self._action_server = ActionServer(
            self,
            PlanAndExecute,
            'plan_and_execute',
            execute_callback=self._execute_callback,
            goal_callback=self._goal_callback,
            cancel_callback=self._cancel_callback
        )

        # Publishers for state updates
        self.status_pub = self.create_publisher(String, '/cognitive_planning/status', 10)

    def _get_api_key(self) -> str:
        """Get API key from parameters or environment"""
        api_key = self.declare_parameter('openai_api_key', '').value
        if not api_key:
            api_key = os.getenv('OPENAI_API_KEY')

        if not api_key:
            raise ValueError('OpenAI API key not provided')

        return api_key

    def _goal_callback(self, goal_request):
        """Handle goal request"""
        self.get_logger().info(f'Received planning request: {goal_request.task_description}')
        return GoalResponse.ACCEPT

    def _cancel_callback(self, goal_handle):
        """Handle goal cancellation"""
        self.get_logger().info('Received cancel request')
        return CancelResponse.ACCEPT

    async def _execute_callback(self, goal_handle):
        """Execute the planning and execution goal"""
        feedback_msg = PlanAndExecute.Feedback()
        result_msg = PlanAndExecute.Result()

        try:
            # Get current environment state
            env_state = self.perception.get_environment_state()

            # Create planning request
            request = PlanningRequest(
                task_description=goal_handle.request.task_description,
                environment_state=env_state,
                robot_capabilities=goal_handle.request.robot_capabilities,
                constraints=goal_handle.request.constraints
            )

            # Generate initial plan
            self.get_logger().info('Generating cognitive plan...')
            plan_response = self.planner.generate_plan(request)

            # Refine plan based on current state
            refined_plan = self.reasoning_engine.refine_plan(
                plan_response.plan, env_state
            )

            # Publish feedback
            feedback_msg.status = f'Plan generated with {len(refined_plan)} steps'
            feedback_msg.confidence = plan_response.confidence
            goal_handle.publish_feedback(feedback_msg)

            # Execute the plan
            self.get_logger().info('Executing cognitive plan...')
            execution_success = await self.execution_monitor.execute_plan(refined_plan)

            # Set result
            result_msg.success = execution_success
            result_msg.plan = refined_plan
            result_msg.reasoning = plan_response.reasoning

            if execution_success:
                goal_handle.succeed()
                self.get_logger().info('Cognitive planning task completed successfully')
            else:
                goal_handle.abort()
                self.get_logger().error('Cognitive planning task failed')

        except Exception as e:
            self.get_logger().error(f'Error in cognitive planning: {e}')
            goal_handle.abort()
            result_msg.success = False
            result_msg.error_message = str(e)

        return result_msg
```

## Advanced Reasoning Techniques

### Multi-Modal Reasoning

```python
class MultiModalReasoning:
    def __init__(self):
        self.vision_processor = VisionProcessor()
        self.language_processor = LanguageProcessor()
        self.spatial_reasoner = SpatialReasoner()

    def reason_with_multimodal_input(self, text_query: str, image_data: np.ndarray,
                                   depth_data: np.ndarray) -> Dict[str, Any]:
        """Perform reasoning using text, vision, and spatial information"""

        # Process visual information
        visual_info = self.vision_processor.process_image(image_data, depth_data)

        # Extract spatial relationships
        spatial_info = self.spatial_reasoner.analyze_scene(visual_info)

        # Combine with language query
        combined_reasoning = self._combine_modalities(
            text_query, visual_info, spatial_info
        )

        return combined_reasoning

    def _combine_modalities(self, text: str, visual: Dict, spatial: Dict) -> Dict[str, Any]:
        """Combine information from different modalities for reasoning"""
        # Use LLM to integrate multi-modal information
        reasoning_prompt = f"""
        Text Query: {text}

        Visual Information:
        - Objects detected: {list(visual.get('objects', {}).keys())}
        - Object properties: {visual.get('object_properties', {})}

        Spatial Information:
        - Object positions: {spatial.get('positions', {})}
        - Spatial relationships: {spatial.get('relationships', {})}

        Provide reasoning about the query based on all available information.
        """

        # In practice, this would call the LLM
        return {
            'reasoning': 'Multi-modal reasoning result',
            'action_recommendation': 'Recommended action',
            'confidence': 0.85
        }
```

## Safety and Verification

### Plan Verification System

```python
class PlanVerifier:
    def __init__(self):
        self.safety_rules = self._load_safety_rules()
        self.verification_history = []

    def verify_plan(self, plan: List[Dict], environment_state: Dict) -> Dict[str, Any]:
        """Verify plan safety and correctness"""
        verification_results = {
            'is_safe': True,
            'is_feasible': True,
            'issues': [],
            'confidence': 1.0
        }

        for step_idx, step in enumerate(plan):
            step_verification = self._verify_step(step, environment_state)

            if not step_verification['is_safe']:
                verification_results['is_safe'] = False
                verification_results['issues'].append(
                    f'Step {step_idx} is not safe: {step_verification["safety_issues"]}'
                )

            if not step_verification['is_feasible']:
                verification_results['is_feasible'] = False
                verification_results['issues'].append(
                    f'Step {step_idx} is not feasible: {step_verification["feasibility_issues"]}'
                )

            verification_results['confidence'] *= step_verification.get('confidence', 1.0)

        # Log verification
        self.verification_history.append({
            'plan': plan,
            'results': verification_results,
            'timestamp': time.time()
        })

        return verification_results

    def _verify_step(self, step: Dict, state: Dict) -> Dict[str, Any]:
        """Verify individual step safety and feasibility"""
        verification = {
            'is_safe': True,
            'is_feasible': True,
            'safety_issues': [],
            'feasibility_issues': [],
            'confidence': 0.95
        }

        # Check safety rules
        for rule in self.safety_rules:
            if not rule.evaluate(step, state):
                verification['is_safe'] = False
                verification['safety_issues'].append(rule.description)

        # Check feasibility
        if not self._is_step_feasible_with_current_state(step, state):
            verification['is_feasible'] = False
            verification['feasibility_issues'].append('Step not feasible with current state')

        return verification

    def _load_safety_rules(self) -> List:
        """Load safety rules for plan verification"""
        return [
            SafetyRule(
                name="collision_avoidance",
                condition=lambda step, state: not self._would_cause_collision(step, state),
                description="Plan step would cause collision"
            ),
            SafetyRule(
                name="human_safety",
                condition=lambda step, state: not self._would_endanger_humans(step, state),
                description="Plan step would endanger humans"
            ),
            SafetyRule(
                name="object_safety",
                condition=lambda step, state: not self._would_damage_objects(step, state),
                description="Plan step would damage objects"
            )
        ]
```

## Performance Optimization

### Caching and Prediction

```python
from functools import lru_cache
import pickle

class OptimizedCognitivePlanner:
    def __init__(self, base_planner: LLMBasedPlanner):
        self.base_planner = base_planner
        self.plan_cache = {}
        self.prediction_model = None  # ML model for plan prediction

    @lru_cache(maxsize=100)
    def get_cached_plan(self, task_description: str, environment_signature: str):
        """Get cached plan if available"""
        cache_key = f"{task_description}_{environment_signature}"
        return self.plan_cache.get(cache_key)

    def store_plan_in_cache(self, task_description: str, env_state: Dict, plan: List[Dict]):
        """Store plan in cache"""
        env_signature = self._generate_environment_signature(env_state)
        cache_key = f"{task_description}_{env_signature}"
        self.plan_cache[cache_key] = plan

    def _generate_environment_signature(self, state: Dict) -> str:
        """Generate a signature for environment state for caching"""
        # Create hash of relevant environment features
        relevant_features = {
            'object_types': sorted(state.get('objects', {}).keys()),
            'object_positions': [
                obj.get('position') for obj in state.get('objects', {}).values()
                if obj.get('position')
            ],
            'navigation_map_info': state.get('navigation_map', {})
        }

        return str(hash(str(relevant_features)))

    def predict_plan_feasibility(self, plan: List[Dict], state: Dict) -> float:
        """Predict plan feasibility using ML model"""
        if self.prediction_model:
            features = self._extract_plan_features(plan, state)
            return self.prediction_model.predict(features)
        else:
            # Fallback to rule-based estimation
            return self._estimate_plan_feasibility(plan, state)
```

## Real-World Deployment Considerations

### Adaptive Learning

```python
class AdaptiveCognitivePlanner:
    def __init__(self):
        self.execution_feedback = []
        self.adaptation_rules = []
        self.performance_metrics = {}

    def learn_from_execution(self, plan: List[Dict], execution_result: Dict):
        """Learn from plan execution results"""
        feedback = {
            'plan': plan,
            'result': execution_result,
            'environment': execution_result.get('environment_state'),
            'timestamp': time.time()
        }

        self.execution_feedback.append(feedback)

        # Update adaptation rules based on feedback
        self._update_adaptation_rules(feedback)

    def adapt_planning_strategy(self, task_description: str, environment_state: Dict):
        """Adapt planning strategy based on learned patterns"""
        # Apply adaptation rules
        adapted_description = task_description
        for rule in self.adaptation_rules:
            if rule.applies_to(task_description, environment_state):
                adapted_description = rule.apply(adapted_description)

        return adapted_description

    def _update_adaptation_rules(self, feedback: Dict):
        """Update adaptation rules based on execution feedback"""
        # Analyze feedback to identify patterns
        # This would use ML techniques in practice
        if feedback['result'].get('success') == False:
            # Learn from failure
            failure_pattern = self._analyze_failure_pattern(feedback)
            if failure_pattern:
                self.adaptation_rules.append(failure_pattern)
```

## Summary

LLM-based cognitive planning represents a significant advancement in robotic autonomy, enabling robots to understand complex tasks expressed in natural language and generate sophisticated action sequences. The integration of LLMs with traditional robotics frameworks creates systems capable of reasoning about their environment, adapting to novel situations, and recovering from failures. Key components include environment perception, cognitive reasoning, plan execution monitoring, and safety verification. Success in deploying these systems requires careful consideration of performance optimization, safety guarantees, and adaptive learning from experience.

In the next chapter, we'll explore the capstone project that integrates all the concepts learned throughout the textbook to build an autonomous humanoid robot system.