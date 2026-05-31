# agents/swarm.py
import asyncio
from typing import List, Dict, Any
from agents.supervisor import SupervisorAgent
from agents.programmer import ProgrammerAgent
from agents.specialized import ResearcherAgent, AnalyzerAgent, ExecutorAgent
from agents.management import AgentGenAgent, ImproverAgent
from tools.tool_registry import tools
from llm.router import LLMRouter

class SwarmController:
    """Custom Multi-Agent Swarm Controller (Non-CrewAI version for stability)"""
    def __init__(self, llm_router=None):
        self.llm_router = llm_router or LLMRouter()
        
        # Initialize specialized agents
        self.agents = {
            "programmer": ProgrammerAgent(llm_router=self.llm_router),
            "researcher": ResearcherAgent(llm_router=self.llm_router),
            "executor": ExecutorAgent(llm_router=self.llm_router),
            "tester": AnalyzerAgent(llm_router=self.llm_router)
        }

    async def run_swarm(self, subtasks: List[Dict[str, Any]]) -> str:
        """Execute subtasks using the agent swarm in parallel/sequence."""
        results = []
        for st in subtasks:
            agent_type = st.get("agent", "executor")
            agent = self.agents.get(agent_type, self.agents["executor"])
            
            print(f"DEBUG: Swarm assigning '{st['description']}' to {agent_type}")
            
            # Use execute_task instead of CrewAI Task
            result = await agent.execute_task({"input": st["description"]})
            results.append(f"[{agent_type.upper()}]: {result.get('result', 'Task completed')}")
            
        return "\n".join(results)

    def _map_agent(self, agent_type: str):
        # Kept for compatibility if needed elsewhere
        return self.agents.get(agent_type, self.agents["executor"])
