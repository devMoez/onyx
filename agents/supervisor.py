# agents/supervisor.py
"""
Supervisor Agent - Central task orchestrator and coordinator.
Responsible for task decomposition, agent assignment, and workflow coordination.
"""

from typing import Dict, Any, List, Optional
from datetime import datetime
from agents.base import BaseAgent
import json

class SupervisorAgent(BaseAgent):
    """
    Supervisor Agent - The 'Brain' of ONYX.
    Coordinates all other specialized agents.
    """
    
    def __init__(self, llm_router=None, memory_manager=None):
        from llm.router import LLMRouter
        super().__init__(
            name="Supervisor",
            role="Task Coordinator & Orchestrator",
            llm_router=llm_router or LLMRouter(),
            memory_manager=memory_manager
        )
        self.status = "idle"
        self.active_plan = None
    
    async def parse_intent(self, task_input: str) -> Dict[str, Any]:
        """Parse user input to understand intent using LLM and Intent Architect skill"""
        self.add_reasoning("Parsing Intent", f"Analyzing input: {task_input}")
        
        from core.skill_loader import SkillLoader
        intent_skill = SkillLoader.get_skill("Intent Architect")
        
        prompt = f"""
        {intent_skill if intent_skill else ""}
        
        Analyze the following user task for an AI OS named ONYX using the 'Intent Architect' framework.
        Task: "{task_input}"
        
        Proactively identify the core problem and suggest the 'Best Approach'.
        Respond with a JSON object containing:
        - intent: (e.g., programming, research, analysis, general_query)
        - core_problem: (The underlying issue being solved)
        - best_approach: (Your proactive recommendation)
        - options: {{ "User Path": "...", "Onyx Path": "...", "Expert Path": "..." }}
        - complexity: (low, medium, high)
        - requirements: list of specific subtasks or needs
        - suggested_agent: (programmer, researcher, analyzer, or executor)
        """
        
        response = await self.llm_router.chat(prompt)
        try:
            # Clean response if LLM added markdown
            clean_resp = response.strip()
            if "```json" in clean_resp:
                clean_resp = clean_resp.split("```json")[1].split("```")[0].strip()
            elif "```" in clean_resp:
                clean_resp = clean_resp.split("```")[1].split("```")[0].strip()
            
            intent_data = json.loads(clean_resp)
            self.add_reasoning("Intent Parsed", f"Detected intent: {intent_data.get('intent')}")
            return intent_data
        except Exception:
            # Fallback
            return {"intent": "general", "complexity": "low", "requirements": [], "suggested_agent": "researcher"}

    def decompose_task(self, intent_data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Break down high-level intent into subtasks"""
        intent = intent_data.get("intent", "general")
        requirements = intent_data.get("requirements", [])
        
        subtasks = []
        for i, req in enumerate(requirements):
            subtasks.append({
                "id": i + 1,
                "description": req,
                "agent": intent_data.get("suggested_agent", "researcher"),
                "status": "pending"
            })
            
        if not subtasks:
            subtasks.append({
                "id": 1,
                "description": "Address user query directly",
                "agent": "researcher",
                "status": "pending"
            })
            
        self.add_reasoning("Decomposition", f"Created {len(subtasks)} subtasks")
        return subtasks

    async def execute_task(self, task_input: str) -> Dict[str, Any]:
        """Primary entry point for task execution"""
        self.set_status("processing")
        self.add_reasoning("Execution Start", f"Supervising task: {task_input}")
        
        try:
            # Step 1: Parse Intent
            intent_data = await self.parse_intent(task_input)
            
            # Step 2: Directly handle simple queries or route to specialized agents
            # For this version, we'll use the LLM to provide the final response 
            # if it's a general query, or use specialized logic for complex ones.
            
            final_response = await self.llm_router.chat(task_input)
            
            # Check if LLM router returned an error message
            if "not available" in final_response.lower() or "error" in final_response.lower():
                self.add_reasoning("Error", final_response)
                self.set_status("error")
                return {"status": "error", "error": final_response}
            
            self.set_status("idle")
            return {
                "status": "completed",
                "intent": intent_data.get("intent"),
                "response": final_response,
                "timestamp": datetime.now().isoformat()
            }
            
        except Exception as e:
            self.add_reasoning("Error", str(e))
            self.set_status("error")
            return {"status": "error", "error": str(e)}

    def set_status(self, status: str):
        self.status = status
