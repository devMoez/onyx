# agents/base.py
from typing import Dict, Any, List, Optional
from datetime import datetime
import asyncio
from tools.tool_registry import tools


class BaseAgent:
    """
    Base class for all ONYX agents.
    Provides common functionality for task execution, memory management, and reasoning.
    """
    
    def __init__(
        self,
        name: str,
        role: str,
        llm_router=None,
        memory_manager=None
    ):
        """
        Initialize base agent.
        """
        self.name = name
        self.role = role
        self.llm = llm_router  # LLM Router for model selection
        
        # Default to global memory singleton if not provided
        if memory_manager is None:
            try:
                from memory.memory_manager import memory
                self.memory = memory
            except ImportError:
                self.memory = None
        else:
            self.memory = memory_manager
            
        self.status = "idle"
        self.current_task = None
        self.task_history = []  # Track completed tasks
        self.artifacts = []  # Code, documents, analysis, etc.
        self.reasoning_trace = []  # Transparent thinking for debugging
        self.created_at = datetime.now().isoformat()
        self.tools = tools # Registry access
    
    async def initialize(self):
        """
        Initialize agent with LLM and memory connections.
        Override in subclasses for specific initialization logic.
        """
        self.status = "initialized"
        if self.memory:
            # Initialize memory context for this agent
            await self._ensure_memory_ready()
    
    async def _ensure_memory_ready(self):
        """Ensure memory manager is ready for this agent"""
        if self.memory and hasattr(self.memory, 'initialize'):
            try:
                await self.memory.initialize()
            except Exception as e:
                self._add_reasoning_trace(
                    f"Warning: Memory initialization failed: {str(e)}"
                )
    
    async def think(self, prompt: str) -> str:
        """
        Agent reasoning - shows transparent thinking.
        Uses LLM to think through a problem and stores reasoning trace.
        
        Args:
            prompt: The reasoning prompt
            
        Returns:
            Reasoning result from LLM
        """
        self._add_reasoning_trace(f"Thinking: {prompt}")
        
        if not self.llm:
            result = f"[Reasoning: No LLM available] {prompt}"
        else:
            try:
                # Call LLM for reasoning (implementation depends on llm_router)
                if hasattr(self.llm, 'reason'):
                    result = await self.llm.reason(prompt)
                else:
                    result = f"[Reasoning] {prompt}"
            except Exception as e:
                result = f"[Reasoning failed: {str(e)}] {prompt}"
        
        self._add_reasoning_trace(f"Result: {result}")
        return result
    
    async def execute_task(self, task: Dict[str, Any]) -> Dict[str, Any]:
        """
        Execute a single task.
        
        This is the main task execution method that should be overridden
        in subclasses with specific agent logic.
        
        Args:
            task: Task dictionary containing task details
            
        Returns:
            Dictionary with keys:
                - status: "completed", "failed", "pending"
                - result: Task result/output
                - artifacts: Generated code, documents, etc.
                - error: Error message if failed
        """
        self.set_status("processing")
        self.current_task = task
        
        try:
            # Default implementation - override in subclasses
            result = {
                "status": "completed",
                "result": f"Task '{task.get('name', 'unknown')}' executed",
                "artifacts": [],
                "reasoning": self.get_reasoning_trace()
            }
            
            # Record in history
            self.task_history.append({
                "task": task,
                "result": result,
                "timestamp": datetime.now().isoformat()
            })
            
            self.set_status("idle")
            return result
            
        except Exception as e:
            self.set_status("error")
            return {
                "status": "failed",
                "result": None,
                "artifacts": [],
                "error": str(e),
                "reasoning": self.get_reasoning_trace()
            }
    
    def set_status(self, status: str):
        """
        Update agent status.
        
        Args:
            status: One of: idle, initialized, processing, completed, error, active
        """
        valid_statuses = ["idle", "initialized", "processing", "completed", "error", "active"]
        if status not in valid_statuses:
            raise ValueError(f"Invalid status: {status}. Must be one of {valid_statuses}")
        self.status = status
    
    def add_artifact(
        self,
        artifact_type: str,
        content: str,
        metadata: Optional[Dict[str, Any]] = None
    ):
        """
        Store generated code, documents, analysis, etc.
        
        Args:
            artifact_type: Type of artifact (code, document, analysis, report, etc.)
            content: The artifact content
            metadata: Optional metadata about the artifact
        """
        artifact = {
            "type": artifact_type,
            "content": content,
            "timestamp": datetime.now().isoformat(),
            "metadata": metadata or {},
            "agent": self.name
        }
        self.artifacts.append(artifact)
    
    def _add_reasoning_trace(self, reasoning_step: str):
        """
        Add a step to the reasoning trace.
        
        Args:
            reasoning_step: Description of reasoning step
        """
        self.reasoning_trace.append({
            "timestamp": datetime.now().isoformat(),
            "step": reasoning_step
        })
    
    def get_reasoning_trace(self) -> List[Dict[str, Any]]:
        """
        Return complete transparent reasoning history.
        
        Returns:
            List of reasoning steps with timestamps
        """
        return self.reasoning_trace
    
    def clear_reasoning_trace(self):
        """Clear the reasoning trace"""
        self.reasoning_trace = []
    
    def get_artifacts(self, artifact_type: Optional[str] = None) -> List[Dict[str, Any]]:
        """
        Get artifacts, optionally filtered by type.
        
        Args:
            artifact_type: Optional type filter
            
        Returns:
            List of artifacts
        """
        if artifact_type:
            return [a for a in self.artifacts if a["type"] == artifact_type]
        return self.artifacts
    
    def get_status_report(self) -> Dict[str, Any]:
        """
        Get comprehensive status report for this agent.
        
        Returns:
            Status dictionary with agent info and metrics
        """
        return {
            "name": self.name,
            "role": self.role,
            "status": self.status,
            "created_at": self.created_at,
            "current_task": self.current_task,
            "tasks_completed": len(self.task_history),
            "artifacts_count": len(self.artifacts),
            "reasoning_steps": len(self.reasoning_trace)
        }
    
    async def shutdown(self):
        """
        Shutdown agent and clean up resources.
        Override in subclasses for specific cleanup logic.
        """
        self.set_status("idle")
        self.current_task = None
