# agents/swarm.py
from typing import Dict, List, Any, Optional, Callable, Coroutine
from enum import Enum
from datetime import datetime
import asyncio
import uuid
import logging
from dataclasses import dataclass, field
from agents.base import BaseAgent

# Setup logging for coordination
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TaskState(Enum):
    """Task state enumeration"""
    PENDING = "pending"
    ASSIGNED = "assigned"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class Task:
    """Task data structure with state tracking"""
    id: str = field(default_factory=lambda: str(uuid.uuid4()))
    state: TaskState = TaskState.PENDING
    data: Dict[str, Any] = field(default_factory=dict)
    assigned_agent: Optional[str] = None
    assigned_at: Optional[str] = None
    started_at: Optional[str] = None
    completed_at: Optional[str] = None
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    retry_count: int = 0
    max_retries: int = 3
    
    def to_dict(self) -> Dict[str, Any]:
        """Convert task to dictionary"""
        return {
            "id": self.id,
            "state": self.state.value,
            "data": self.data,
            "assigned_agent": self.assigned_agent,
            "assigned_at": self.assigned_at,
            "started_at": self.started_at,
            "completed_at": self.completed_at,
            "result": self.result,
            "error": self.error,
            "retry_count": self.retry_count,
            "max_retries": self.max_retries
        }


class WorkflowStep:
    """Represents a single step in a workflow"""
    
    def __init__(self, step_id: str, agent_name: str, task: Dict[str, Any], 
                 depends_on: Optional[List[str]] = None):
        self.id = step_id
        self.agent_name = agent_name
        self.task = task
        self.depends_on = depends_on or []
        self.state = TaskState.PENDING
        self.result = None
        self.error = None
        self.started_at = None
        self.completed_at = None


class AgentSwarm:
    """
    Multi-agent coordination system for distributed task execution.
    Manages agent registration, load balancing, task distribution, and workflow coordination.
    """
    
    def __init__(self, max_concurrent_tasks: int = 10):
        """
        Initialize the agent swarm.
        
        Args:
            max_concurrent_tasks: Maximum number of concurrent tasks across all agents
        """
        self.agents: Dict[str, BaseAgent] = {}
        self.agent_load: Dict[str, int] = {}
        self.agent_max_load: Dict[str, int] = {}
        self.agent_capacity: Dict[str, int] = {}
        self.agent_state_history: Dict[str, List[Dict]] = {}
        
        # Task tracking
        self.tasks: Dict[str, Task] = {}
        self.task_queue: asyncio.Queue = None
        self.pending_tasks: List[str] = []
        self.completed_tasks: List[str] = []
        self.failed_tasks: List[str] = []
        
        # Workflow tracking
        self.workflows: Dict[str, Dict] = {}
        self.active_workflows: Dict[str, Dict] = {}
        
        # Coordination and monitoring
        self.coordination_log: List[Dict] = []
        self.statistics = {
            "tasks_total": 0,
            "tasks_completed": 0,
            "tasks_failed": 0,
            "workflows_total": 0,
            "workflows_completed": 0,
            "workflows_failed": 0,
            "total_execution_time": 0,
            "avg_task_duration": 0,
            "agent_efficiency": {}
        }
        
        self.max_concurrent_tasks = max_concurrent_tasks
        self.running = False
        self.start_time = None
        self.shutdown_event = asyncio.Event()
    
    async def initialize(self):
        """Initialize the swarm for operation"""
        self.task_queue = asyncio.Queue()
        self.running = True
        self.start_time = datetime.now()
        self._log_event("swarm_initialized", {
            "max_concurrent_tasks": self.max_concurrent_tasks
        })
        logger.info(f"Agent Swarm initialized with max {self.max_concurrent_tasks} concurrent tasks")
    
    def register_agent(self, agent: BaseAgent, capacity: int = 5):
        """
        Register an agent in the swarm.
        
        Args:
            agent: BaseAgent instance to register
            capacity: Maximum concurrent tasks for this agent
        """
        if agent.name in self.agents:
            self._log_event("agent_registration_failed", {
                "agent": agent.name,
                "reason": "Agent already registered"
            })
            raise ValueError(f"Agent {agent.name} already registered")
        
        self.agents[agent.name] = agent
        self.agent_load[agent.name] = 0
        self.agent_capacity[agent.name] = capacity
        self.agent_max_load[agent.name] = 0
        self.agent_state_history[agent.name] = []
        
        self._log_event("agent_registered", {
            "agent": agent.name,
            "role": agent.role,
            "capacity": capacity
        })
        logger.info(f"Agent {agent.name} registered with capacity {capacity}")
    
    def unregister_agent(self, agent_name: str) -> bool:
        """
        Unregister an agent from the swarm.
        
        Args:
            agent_name: Name of agent to unregister
            
        Returns:
            True if successful, False otherwise
        """
        if agent_name not in self.agents:
            self._log_event("agent_unregistration_failed", {
                "agent": agent_name,
                "reason": "Agent not found"
            })
            return False
        
        # Check if agent is busy
        if self.agent_load[agent_name] > 0:
            self._log_event("agent_unregistration_failed", {
                "agent": agent_name,
                "reason": "Agent still has pending tasks",
                "current_load": self.agent_load[agent_name]
            })
            return False
        
        del self.agents[agent_name]
        del self.agent_load[agent_name]
        del self.agent_capacity[agent_name]
        del self.agent_max_load[agent_name]
        
        self._log_event("agent_unregistered", {"agent": agent_name})
        logger.info(f"Agent {agent_name} unregistered")
        return True
    
    def _get_least_loaded_agent(self) -> Optional[str]:
        """
        Get the name of the least-loaded agent available.
        
        Returns:
            Agent name or None if no agents available
        """
        available_agents = [
            (name, load) for name, load in self.agent_load.items()
            if load < self.agent_capacity[name]
        ]
        
        if not available_agents:
            return None
        
        return min(available_agents, key=lambda x: x[1])[0]
    
    async def submit_task(self, task_data: Dict[str, Any], 
                         agent_name: Optional[str] = None) -> str:
        """
        Submit a task for execution.
        
        Args:
            task_data: Task data dictionary
            agent_name: Optional specific agent name. If not provided, uses load balancing.
            
        Returns:
            Task ID
            
        Raises:
            ValueError: If agent not found or swarm not initialized
        """
        if not self.running:
            raise ValueError("Swarm is not running. Call initialize() first.")
        
        task = Task(data=task_data)
        task.state = TaskState.PENDING
        self.tasks[task.id] = task
        self.pending_tasks.append(task.id)
        self.statistics["tasks_total"] += 1
        
        self._log_event("task_submitted", {
            "task_id": task.id,
            "requested_agent": agent_name,
            "data_keys": list(task_data.keys())
        })
        
        # Queue task for assignment
        await self.task_queue.put((task.id, agent_name))
        return task.id
    
    async def assign_task(self, task_id: str, agent_name: Optional[str] = None) -> bool:
        """
        Assign a task to an agent.
        
        Args:
            task_id: Task ID to assign
            agent_name: Optional specific agent. If None, uses load balancing.
            
        Returns:
            True if assignment successful, False otherwise
        """
        if task_id not in self.tasks:
            self._log_event("task_assignment_failed", {
                "task_id": task_id,
                "reason": "Task not found"
            })
            return False
        
        task = self.tasks[task_id]
        
        # Determine target agent
        if agent_name:
            if agent_name not in self.agents:
                self._log_event("task_assignment_failed", {
                    "task_id": task_id,
                    "requested_agent": agent_name,
                    "reason": "Agent not found"
                })
                return False
            target_agent = agent_name
        else:
            target_agent = self._get_least_loaded_agent()
            if not target_agent:
                self._log_event("task_assignment_deferred", {
                    "task_id": task_id,
                    "reason": "No available agents"
                })
                return False
        
        # Update task state
        task.assigned_agent = target_agent
        task.assigned_at = datetime.now().isoformat()
        task.state = TaskState.ASSIGNED
        self.agent_load[target_agent] += 1
        
        if self.agent_load[target_agent] > self.agent_max_load[target_agent]:
            self.agent_max_load[target_agent] = self.agent_load[target_agent]
        
        self._log_event("task_assigned", {
            "task_id": task_id,
            "agent": target_agent,
            "agent_load": self.agent_load[target_agent]
        })
        
        return True
    
    async def execute_task(self, task_id: str) -> Dict[str, Any]:
        """
        Execute a single task.
        
        Args:
            task_id: Task ID to execute
            
        Returns:
            Execution result dictionary
        """
        if task_id not in self.tasks:
            return {
                "status": "error",
                "task_id": task_id,
                "error": "Task not found"
            }
        
        task = self.tasks[task_id]
        
        if not task.assigned_agent:
            return {
                "status": "error",
                "task_id": task_id,
                "error": "Task not assigned to any agent"
            }
        
        agent = self.agents[task.assigned_agent]
        task.state = TaskState.IN_PROGRESS
        task.started_at = datetime.now().isoformat()
        
        try:
            self._log_event("task_execution_started", {
                "task_id": task_id,
                "agent": task.assigned_agent
            })
            
            # Execute task with the agent
            result = await agent.execute_task(task.data)
            
            task.result = result
            task.state = TaskState.COMPLETED
            task.completed_at = datetime.now().isoformat()
            
            # Update tracking
            if task_id in self.pending_tasks:
                self.pending_tasks.remove(task_id)
            self.completed_tasks.append(task_id)
            self.statistics["tasks_completed"] += 1
            
            # Decrease agent load
            self.agent_load[task.assigned_agent] -= 1
            
            self._log_event("task_execution_completed", {
                "task_id": task_id,
                "agent": task.assigned_agent,
                "result_status": result.get("status", "unknown")
            })
            
            return {
                "status": "completed",
                "task_id": task_id,
                "agent": task.assigned_agent,
                "result": result
            }
            
        except Exception as e:
            task.state = TaskState.FAILED
            task.error = str(e)
            task.completed_at = datetime.now().isoformat()
            task.retry_count += 1
            
            if task_id in self.pending_tasks:
                self.pending_tasks.remove(task_id)
            self.failed_tasks.append(task_id)
            self.statistics["tasks_failed"] += 1
            self.agent_load[task.assigned_agent] -= 1
            
            self._log_event("task_execution_failed", {
                "task_id": task_id,
                "agent": task.assigned_agent,
                "error": str(e),
                "retry_count": task.retry_count
            })
            
            logger.error(f"Task {task_id} failed on agent {task.assigned_agent}: {str(e)}")
            
            return {
                "status": "failed",
                "task_id": task_id,
                "agent": task.assigned_agent,
                "error": str(e),
                "retry_count": task.retry_count
            }
    
    async def distribute_tasks(self, tasks_data: List[Dict[str, Any]]) -> List[str]:
        """
        Distribute multiple tasks across the swarm with load balancing.
        
        Args:
            tasks_data: List of task data dictionaries
            
        Returns:
            List of task IDs
        """
        task_ids = []
        for task_data in tasks_data:
            task_id = await self.submit_task(task_data)
            task_ids.append(task_id)
        
        # Process all tasks
        execution_tasks = []
        for task_id in task_ids:
            # Assign task
            assigned = await self.assign_task(task_id)
            if assigned:
                # Execute task
                execution_tasks.append(self.execute_task(task_id))
        
        # Wait for all tasks to complete
        if execution_tasks:
            await asyncio.gather(*execution_tasks, return_exceptions=True)
        
        return task_ids
    
    async def execute_workflow(self, workflow_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a multi-step workflow with task dependencies.
        
        Args:
            workflow_data: Workflow definition dictionary with:
                - id (optional): Workflow ID
                - name: Workflow name
                - steps: List of workflow steps
                  Each step should have:
                    - id: Step ID
                    - agent: Agent name for this step
                    - task: Task data for this step
                    - depends_on (optional): List of step IDs this step depends on
                    
        Returns:
            Workflow execution result
        """
        workflow_id = workflow_data.get("id", str(uuid.uuid4()))
        workflow_name = workflow_data.get("name", "unknown_workflow")
        steps = workflow_data.get("steps", [])
        
        self.statistics["workflows_total"] += 1
        
        self._log_event("workflow_started", {
            "workflow_id": workflow_id,
            "workflow_name": workflow_name,
            "steps_count": len(steps)
        })
        
        workflow_result = {
            "workflow_id": workflow_id,
            "workflow_name": workflow_name,
            "steps_total": len(steps),
            "steps_completed": 0,
            "steps_failed": 0,
            "step_results": [],
            "errors": [],
            "started_at": datetime.now().isoformat(),
            "completed_at": None
        }
        
        # Create workflow steps
        workflow_steps: Dict[str, WorkflowStep] = {}
        for step_data in steps:
            step = WorkflowStep(
                step_id=step_data["id"],
                agent_name=step_data["agent"],
                task=step_data["task"],
                depends_on=step_data.get("depends_on", [])
            )
            workflow_steps[step.id] = step
        
        self.active_workflows[workflow_id] = {
            "name": workflow_name,
            "steps": workflow_steps,
            "started_at": datetime.now().isoformat()
        }
        
        # Execute steps respecting dependencies
        completed_steps = set()
        while len(completed_steps) < len(workflow_steps):
            # Find steps that are ready (all dependencies completed)
            ready_steps = []
            for step_id, step in workflow_steps.items():
                if step.state == TaskState.PENDING:
                    if all(dep_id in completed_steps for dep_id in step.depends_on):
                        ready_steps.append(step)
            
            if not ready_steps:
                # Check if there are uncompleted steps without all dependencies ready
                pending_steps = [s for s in workflow_steps.values() if s.state == TaskState.PENDING]
                if pending_steps:
                    self._log_event("workflow_deadlock", {
                        "workflow_id": workflow_id,
                        "pending_steps": [s.id for s in pending_steps]
                    })
                    workflow_result["errors"].append("Workflow deadlock: circular dependencies detected")
                    break
            
            # Execute ready steps in parallel
            execution_tasks = []
            for step in ready_steps:
                task = Task(data=step.task)
                self.tasks[task.id] = task
                
                # Assign to specified agent
                task.assigned_agent = step.agent_name
                task.assigned_at = datetime.now().isoformat()
                task.state = TaskState.ASSIGNED
                
                if step.agent_name not in self.agents:
                    step.state = TaskState.FAILED
                    step.error = f"Agent {step.agent_name} not found"
                    workflow_result["steps_failed"] += 1
                    workflow_result["errors"].append(step.error)
                    completed_steps.add(step.id)
                else:
                    self.agent_load[step.agent_name] += 1
                    step.state = TaskState.IN_PROGRESS
                    step.started_at = datetime.now().isoformat()
                    execution_tasks.append((step, task, self.execute_task(task.id)))
            
            # Wait for all execution tasks to complete
            if execution_tasks:
                results = await asyncio.gather(
                    *[task[2] for task in execution_tasks],
                    return_exceptions=True
                )
                
                for (step, task, _), result in zip(execution_tasks, results):
                    if isinstance(result, Exception):
                        step.state = TaskState.FAILED
                        step.error = str(result)
                        workflow_result["steps_failed"] += 1
                        workflow_result["errors"].append(f"Step {step.id}: {str(result)}")
                    elif result.get("status") == "completed":
                        step.state = TaskState.COMPLETED
                        step.result = result
                        workflow_result["steps_completed"] += 1
                    else:
                        step.state = TaskState.FAILED
                        step.error = result.get("error", "Unknown error")
                        workflow_result["steps_failed"] += 1
                        workflow_result["errors"].append(f"Step {step.id}: {step.error}")
                    
                    workflow_result["step_results"].append({
                        "step_id": step.id,
                        "state": step.state.value,
                        "result": step.result,
                        "error": step.error
                    })
                    
                    completed_steps.add(step.id)
        
        workflow_result["completed_at"] = datetime.now().isoformat()
        
        if workflow_result["steps_failed"] == 0:
            self.statistics["workflows_completed"] += 1
            self._log_event("workflow_completed", {
                "workflow_id": workflow_id,
                "steps_completed": workflow_result["steps_completed"]
            })
        else:
            self.statistics["workflows_failed"] += 1
            self._log_event("workflow_failed", {
                "workflow_id": workflow_id,
                "steps_completed": workflow_result["steps_completed"],
                "steps_failed": workflow_result["steps_failed"]
            })
        
        # Remove from active workflows
        if workflow_id in self.active_workflows:
            del self.active_workflows[workflow_id]
        
        return workflow_result
    
    def get_task_status(self, task_id: str) -> Optional[Dict[str, Any]]:
        """
        Get status of a specific task.
        
        Args:
            task_id: Task ID
            
        Returns:
            Task status dictionary or None if not found
        """
        if task_id not in self.tasks:
            return None
        
        return self.tasks[task_id].to_dict()
    
    def get_all_tasks_status(self) -> Dict[str, List[Dict[str, Any]]]:
        """
        Get status of all tasks grouped by state.
        
        Returns:
            Dictionary with task lists grouped by state
        """
        tasks_by_state = {
            "pending": [],
            "assigned": [],
            "in_progress": [],
            "completed": [],
            "failed": []
        }
        
        for task in self.tasks.values():
            tasks_by_state[task.state.value].append(task.to_dict())
        
        return tasks_by_state
    
    def get_swarm_status(self) -> Dict[str, Any]:
        """
        Get overall swarm status including agent loads and statistics.
        
        Returns:
            Comprehensive swarm status dictionary
        """
        total_load = sum(self.agent_load.values())
        total_capacity = sum(self.agent_capacity.values())
        
        agent_details = []
        for agent_name, agent in self.agents.items():
            agent_details.append({
                "name": agent_name,
                "role": agent.role,
                "status": agent.status,
                "current_load": self.agent_load[agent_name],
                "capacity": self.agent_capacity[agent_name],
                "utilization": f"{(self.agent_load[agent_name] / self.agent_capacity[agent_name] * 100):.1f}%" if self.agent_capacity[agent_name] > 0 else "N/A",
                "max_load": self.agent_max_load[agent_name],
                "tasks_completed": len([t for t in self.tasks.values() if t.assigned_agent == agent_name and t.state == TaskState.COMPLETED])
            })
        
        # Calculate statistics
        total_duration = 0
        completed_task_count = 0
        for task in self.tasks.values():
            if task.state == TaskState.COMPLETED and task.completed_at and task.started_at:
                try:
                    start = datetime.fromisoformat(task.started_at)
                    end = datetime.fromisoformat(task.completed_at)
                    total_duration += (end - start).total_seconds()
                    completed_task_count += 1
                except:
                    pass
        
        avg_task_duration = total_duration / completed_task_count if completed_task_count > 0 else 0
        
        return {
            "running": self.running,
            "total_agents": len(self.agents),
            "active_agents": sum(1 for load in self.agent_load.values() if load > 0),
            "total_load": total_load,
            "total_capacity": total_capacity,
            "utilization": f"{(total_load / total_capacity * 100):.1f}%" if total_capacity > 0 else "N/A",
            "agent_details": agent_details,
            "tasks": {
                "total": self.statistics["tasks_total"],
                "pending": len(self.pending_tasks),
                "completed": self.statistics["tasks_completed"],
                "failed": self.statistics["tasks_failed"]
            },
            "workflows": {
                "total": self.statistics["workflows_total"],
                "active": len(self.active_workflows),
                "completed": self.statistics["workflows_completed"],
                "failed": self.statistics["workflows_failed"]
            },
            "performance": {
                "avg_task_duration_seconds": f"{avg_task_duration:.2f}",
                "total_execution_time": f"{(datetime.now() - self.start_time).total_seconds():.2f}s" if self.start_time else "N/A"
            }
        }
    
    def get_agent_statistics(self) -> Dict[str, Dict[str, Any]]:
        """
        Get detailed statistics for each agent.
        
        Returns:
            Dictionary with per-agent statistics
        """
        stats = {}
        for agent_name, agent in self.agents.items():
            agent_tasks = [t for t in self.tasks.values() if t.assigned_agent == agent_name]
            completed = [t for t in agent_tasks if t.state == TaskState.COMPLETED]
            failed = [t for t in agent_tasks if t.state == TaskState.FAILED]
            
            stats[agent_name] = {
                "role": agent.role,
                "status": agent.status,
                "total_tasks_assigned": len(agent_tasks),
                "tasks_completed": len(completed),
                "tasks_failed": len(failed),
                "success_rate": f"{(len(completed) / len(agent_tasks) * 100):.1f}%" if agent_tasks else "N/A",
                "current_load": self.agent_load[agent_name],
                "capacity": self.agent_capacity[agent_name],
                "utilization": f"{(self.agent_load[agent_name] / self.agent_capacity[agent_name] * 100):.1f}%" if self.agent_capacity[agent_name] > 0 else "N/A"
            }
        
        return stats
    
    def get_coordination_log(self, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Get coordination log entries.
        
        Args:
            limit: Maximum number of entries to return
            
        Returns:
            List of recent log entries
        """
        return self.coordination_log[-limit:]
    
    def _log_event(self, event: str, data: Dict[str, Any]):
        """
        Log a coordination event.
        
        Args:
            event: Event type/name
            data: Event data
        """
        log_entry = {
            "event": event,
            "timestamp": datetime.now().isoformat(),
            "data": data
        }
        self.coordination_log.append(log_entry)
        logger.debug(f"[{event}] {data}")
    
    async def shutdown(self):
        """
        Shutdown the swarm gracefully.
        Waits for all agents to complete their tasks.
        """
        self.running = False
        self._log_event("swarm_shutdown_initiated", {
            "pending_tasks": len(self.pending_tasks),
            "total_load": sum(self.agent_load.values())
        })
        
        # Wait for all agents to finish
        while sum(self.agent_load.values()) > 0:
            await asyncio.sleep(0.1)
        
        # Shutdown all agents
        for agent in self.agents.values():
            try:
                await agent.shutdown()
            except Exception as e:
                logger.error(f"Error shutting down agent {agent.name}: {str(e)}")
        
        self.shutdown_event.set()
        self._log_event("swarm_shutdown_completed", {
            "tasks_completed": self.statistics["tasks_completed"],
            "tasks_failed": self.statistics["tasks_failed"],
            "workflows_completed": self.statistics["workflows_completed"],
            "workflows_failed": self.statistics["workflows_failed"]
        })
        logger.info("Agent Swarm shutdown completed")


# Global singleton instance
_agent_swarm_instance: Optional[AgentSwarm] = None


def get_agent_swarm(max_concurrent_tasks: int = 10) -> AgentSwarm:
    """
    Get the global agent swarm singleton instance.
    
    Args:
        max_concurrent_tasks: Max concurrent tasks (only used on first call)
        
    Returns:
        AgentSwarm singleton instance
    """
    global _agent_swarm_instance
    if _agent_swarm_instance is None:
        _agent_swarm_instance = AgentSwarm(max_concurrent_tasks=max_concurrent_tasks)
    return _agent_swarm_instance


def reset_agent_swarm():
    """Reset the global agent swarm singleton instance"""
    global _agent_swarm_instance
    _agent_swarm_instance = None


# Default global instance
agent_swarm = AgentSwarm()
