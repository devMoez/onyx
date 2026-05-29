from typing import Dict, Any, List
from datetime import datetime

class WorkflowState:
    """Represents current state of a workflow execution"""
    
    def __init__(self, user_input: str = ""):
        self.user_input = user_input
        self.parsed_intent = {}
        self.subtasks = []
        self.current_node = "start"
        self.artifacts = []
        self.results = {}
        self.errors = []
        self.iteration = 0
        self.max_iterations = 10
        self.reasoning_trace = []
        self.timestamp_started = datetime.now().isoformat()
        self.timestamp_updated = datetime.now().isoformat()
        self.context = {}  # Custom context data
    
    def add_reasoning(self, step: str, reasoning: str, agent_name: str = None):
        """Add transparent reasoning step"""
        self.reasoning_trace.append({
            "step": step,
            "reasoning": reasoning,
            "agent": agent_name,
            "timestamp": datetime.now().isoformat()
        })
        self.timestamp_updated = datetime.now().isoformat()
    
    def update_node(self, node_name: str) -> str:
        """Move to next workflow node"""
        self.current_node = node_name
        self.timestamp_updated = datetime.now().isoformat()
        return node_name
    
    def add_error(self, error_msg: str, severity: str = "warning", error_type: str = None):
        """Log an error or warning"""
        self.errors.append({
            "message": error_msg,
            "severity": severity,  # "info", "warning", "error", "critical"
            "type": error_type,
            "timestamp": datetime.now().isoformat()
        })
        self.timestamp_updated = datetime.now().isoformat()
        if severity == "critical":
            self.iteration = self.max_iterations  # Trigger max iterations
    
    def get_errors(self) -> list:
        """Get all errors"""
        return self.errors
    
    def get_errors_by_severity(self, severity: str) -> list:
        """Filter errors by severity"""
        return [e for e in self.errors if e.get("severity") == severity]
    
    def clear_errors(self):
        """Clear all errors"""
        self.errors = []
    
    def increment_iteration(self) -> bool:
        """Increment iteration counter for loops"""
        self.iteration += 1
        if self.iteration >= self.max_iterations:
            self.add_error(f"Max iterations ({self.max_iterations}) reached", "warning")
            return False
        return True
    
    def get_iteration(self) -> int:
        """Get current iteration count"""
        return self.iteration
    
    def reset_iterations(self):
        """Reset iteration counter"""
        self.iteration = 0
    
    def add_artifact(self, artifact_type: str, content: str, metadata: Dict = None):
        """Add generated artifact"""
        artifact = {
            "type": artifact_type,  # "code", "document", "analysis", "output"
            "content": content,
            "metadata": metadata or {},
            "timestamp": datetime.now().isoformat()
        }
        self.artifacts.append(artifact)
        self.timestamp_updated = datetime.now().isoformat()
    
    def get_artifacts(self) -> list:
        """Get all artifacts"""
        return self.artifacts
    
    def get_artifacts_by_type(self, artifact_type: str) -> list:
        """Filter artifacts by type"""
        return [a for a in self.artifacts if a.get("type") == artifact_type]
    
    def add_subtask(self, subtask: Dict) -> str:
        """Add a subtask"""
        if "id" not in subtask:
            subtask["id"] = f"subtask_{len(self.subtasks)}"
        if "status" not in subtask:
            subtask["status"] = "pending"
        if "timestamp" not in subtask:
            subtask["timestamp"] = datetime.now().isoformat()
        self.subtasks.append(subtask)
        self.timestamp_updated = datetime.now().isoformat()
        return subtask["id"]
    
    def update_subtask(self, subtask_id: str, status: str):
        """Update subtask status"""
        for st in self.subtasks:
            if st.get("id") == subtask_id:
                st["status"] = status
                st["updated"] = datetime.now().isoformat()
        self.timestamp_updated = datetime.now().isoformat()
    
    def get_subtasks(self) -> list:
        """Get all subtasks"""
        return self.subtasks
    
    def add_result(self, key: str, value: Any):
        """Store a result"""
        self.results[key] = value
        self.timestamp_updated = datetime.now().isoformat()
    
    def get_result(self, key: str) -> Any:
        """Retrieve a result"""
        return self.results.get(key)
    
    def get_all_results(self) -> Dict:
        """Get all results"""
        return self.results
    
    def set_context(self, key: str, value: Any):
        """Store custom context"""
        self.context[key] = value
    
    def get_context(self, key: str) -> Any:
        """Retrieve custom context"""
        return self.context.get(key)
    
    def get_summary(self) -> Dict[str, Any]:
        """Get workflow state summary"""
        return {
            "current_node": self.current_node,
            "iteration": self.iteration,
            "max_iterations": self.max_iterations,
            "subtasks_total": len(self.subtasks),
            "subtasks_pending": len([s for s in self.subtasks if s.get("status") == "pending"]),
            "subtasks_completed": len([s for s in self.subtasks if s.get("status") == "completed"]),
            "artifacts_count": len(self.artifacts),
            "errors_count": len(self.errors),
            "errors_critical": len([e for e in self.errors if e.get("severity") == "critical"]),
            "reasoning_steps": len(self.reasoning_trace),
            "timestamp_started": self.timestamp_started,
            "timestamp_updated": self.timestamp_updated,
        }
    
    def get_full_state(self) -> Dict[str, Any]:
        """Get complete state object (for serialization)"""
        return {
            "user_input": self.user_input,
            "parsed_intent": self.parsed_intent,
            "subtasks": self.subtasks,
            "current_node": self.current_node,
            "artifacts": self.artifacts,
            "results": self.results,
            "errors": self.errors,
            "iteration": self.iteration,
            "max_iterations": self.max_iterations,
            "reasoning_trace": self.reasoning_trace,
            "context": self.context,
            "timestamp_started": self.timestamp_started,
            "timestamp_updated": self.timestamp_updated,
        }
