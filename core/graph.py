# core/graph.py
from typing import TypedDict, List, Dict, Any, Optional
import asyncio
from langgraph.graph import StateGraph, END
from langgraph.checkpoint.memory import MemorySaver
from agents.supervisor import SupervisorAgent
from agents.swarm import SwarmController
from agents.management import AgentGenAgent, ImproverAgent
from core.event_bus import event_bus

class AgentState(TypedDict):
    task_input: str
    intent: Optional[Dict[str, Any]]
    subtasks: List[Dict[str, Any]]
    plan: List[Any]
    results: Dict[str, Any]
    status: str
    retry_count: int

class OnyxGraph:
    def __init__(self, llm_router=None):
        self.llm_router = llm_router
        self.supervisor = SupervisorAgent(llm_router=self.llm_router)
        self.swarm = SwarmController(llm_router=self.llm_router)
        self.improver = ImproverAgent(llm_router=self.llm_router)
        self.event_bus = event_bus
        self.checkpointer = MemorySaver()
        
    def _parse(self, state: AgentState):
        intent = asyncio.run(self.supervisor.parse_intent(state["task_input"]))
        return {"intent": intent}

    def _decompose(self, state: AgentState):
        subtasks = self.supervisor.decompose_task(state["intent"])
        return {"subtasks": subtasks}
    
    def _plan(self, state: AgentState):
        # Implementation of planning
        return {"plan": ["phase1", "phase2"]}

    def _route(self, state: AgentState):
        # Implementation of routing
        return {"status": "routed"}

    def _execute(self, state: AgentState):
        # Delegate to SwarmController (now async)
        results = asyncio.run(self.swarm.run_swarm(state["subtasks"]))
        return {"results": {"swarm_output": str(results)}, "status": "executed"}

    def _verify(self, state: AgentState):
        # Verification logic
        if "error" in str(state["results"]):
            return {"status": "failed"}
        return {"status": "verified"}
def _learn(self, state: AgentState):
    from memory.memory_manager import memory
    # Optimization logic
    asyncio.run(self.improver.optimize_workflow(state["results"]))

    # PROACTIVE: Extract insights from session history
    asyncio.run(memory.extract_and_store_insights("default_session", self.llm_router))

    return {"status": "learned"}


    def should_retry(self, state: AgentState) -> str:
        if state["status"] == "failed" and state["retry_count"] < 3:
            return "execute"
        return "learn"

    def run(self, task_input: str):
        graph = self.build_graph()
        return graph.invoke({"task_input": task_input, "status": "started", "retry_count": 0})

    def build_graph(self):
        workflow = StateGraph(AgentState)
        
        workflow.add_node("parse", self._parse)
        workflow.add_node("decompose", self._decompose)
        workflow.add_node("plan", self._plan)
        workflow.add_node("route", self._route)
        workflow.add_node("execute", self._execute)
        workflow.add_node("verify", self._verify)
        workflow.add_node("learn", self._learn)
        
        workflow.set_entry_point("parse")
        workflow.add_edge("parse", "decompose")
        workflow.add_edge("decompose", "plan")
        workflow.add_edge("plan", "route")
        workflow.add_edge("route", "execute")
        workflow.add_edge("execute", "verify")
        
        workflow.add_conditional_edges(
            "verify",
            self.should_retry,
            {"execute": "execute", "learn": "learn"}
        )
        
        workflow.add_edge("learn", END)
        
        return workflow.compile(checkpointer=self.checkpointer)
