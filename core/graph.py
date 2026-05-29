# core/graph.py
from typing import Dict, Any, List
from datetime import datetime

class WorkflowState:
    def __init__(self):
        self.user_input = ""
        self.parsed_intent = {}
        self.subtasks = []
        self.current_node = "start"
        self.artifacts = []
        self.results = {}
        self.errors = []
        self.iteration = 0
        self.max_iterations = 10

class OnyxGraph:
    def __init__(self):
        self.state = WorkflowState()
        self.checkpoints = []
    
    def parse_input(self, user_input: str) -> Dict:
        """Node 1: Parse user input"""
        self.state.user_input = user_input
        self.state.parsed_intent = {
            "raw": user_input,
            "length": len(user_input),
            "has_code": "code" in user_input.lower() or "build" in user_input.lower(),
            "timestamp": datetime.now().isoformat()
        }
        self.state.current_node = "parse_input"
        return self.state.parsed_intent
    
    def decompose(self) -> List[Dict]:
        """Node 2: Decompose task"""
        self.state.subtasks = [
            {"id": 1, "name": "Research", "status": "pending"},
            {"id": 2, "name": "Plan", "status": "pending"},
            {"id": 3, "name": "Execute", "status": "pending"},
            {"id": 4, "name": "Verify", "status": "pending"},
            {"id": 5, "name": "Report", "status": "pending"}
        ]
        self.state.current_node = "decompose"
        return self.state.subtasks
    
    def execute(self) -> Dict:
        """Node 3: Execute subtasks"""
        results = {}
        for task in self.state.subtasks:
            task["status"] = "completed"
            results[task["name"]] = f"Executed {task['name']}"
        
        self.state.results = results
        self.state.current_node = "execute"
        return results
    
    def verify(self) -> bool:
        """Node 4: Verify results"""
        self.state.current_node = "verify"
        # Simple verification - all tasks completed
        all_completed = all(t["status"] == "completed" for t in self.state.subtasks)
        return all_completed
    
    def improve(self) -> Dict:
        """Node 5: Self-improvement cycle"""
        self.state.iteration += 1
        self.state.current_node = "improve"
        
        improvement = {
            "iteration": self.state.iteration,
            "changes_made": [],
            "status": "improving"
        }
        
        if self.state.iteration < self.state.max_iterations:
            improvement["status"] = "continuing"
        else:
            improvement["status"] = "completed"
        
        return improvement
    
    def save_checkpoint(self) -> str:
        """Save current state as checkpoint"""
        checkpoint = {
            "id": f"cp_{datetime.now().timestamp()}",
            "state": {
                "user_input": self.state.user_input,
                "current_node": self.state.current_node,
                "iteration": self.state.iteration,
                "artifacts": self.state.artifacts
            },
            "timestamp": datetime.now().isoformat()
        }
        self.checkpoints.append(checkpoint)
        return checkpoint["id"]
    
    def run(self, user_input: str) -> Dict[str, Any]:
        """Run the full workflow"""
        self.parse_input(user_input)
        self.decompose()
        self.execute()
        verified = self.verify()
        
        if not verified:
            self.improve()
        
        self.save_checkpoint()
        
        return {
            "status": "completed",
            "artifacts": self.state.artifacts,
            "results": self.state.results,
            "iterations": self.state.iteration,
            "checkpoints": len(self.checkpoints)
        }
