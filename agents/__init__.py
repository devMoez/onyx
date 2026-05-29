# agents/__init__.py
from typing import Dict, List, Optional, Any
from datetime import datetime

from agents.base import BaseAgent
from agents.supervisor import SupervisorAgent


class AgentRegistry:
    """
    Manages all agent instances and their lifecycle.
    Provides central registration, activation, and coordination of agents.
    """
    
    def __init__(self):
        """Initialize the agent registry"""
        self.agents: Dict[str, BaseAgent] = {}
        self.active_agents: List[str] = []
        self.created_at = datetime.now().isoformat()
    
    def register(self, agent_name: str, agent_instance: Any):
        """
        Register an agent in the registry.
        
        Args:
            agent_name: Unique identifier for the agent
            agent_instance: Instance of BaseAgent or agent-like object
            
        Raises:
            ValueError: If agent_name already registered or invalid instance
        """
        if agent_name in self.agents:
            raise ValueError(f"Agent '{agent_name}' is already registered")
        
        # Support both BaseAgent instances and agent-like objects (duck typing)
        # Check for required agent attributes
        required_attrs = ['name', 'role']
        if not all(hasattr(agent_instance, attr) for attr in required_attrs):
            raise TypeError(f"Agent must have 'name' and 'role' attributes, got {type(agent_instance)}")
        
        self.agents[agent_name] = agent_instance
    
    def unregister(self, agent_name: str):
        """
        Unregister an agent from the registry.
        
        Args:
            agent_name: Name of agent to unregister
        """
        if agent_name in self.agents:
            # Deactivate if active
            if agent_name in self.active_agents:
                self.active_agents.remove(agent_name)
            del self.agents[agent_name]
    
    def get_agent(self, agent_name: str) -> Optional[BaseAgent]:
        """
        Get agent by name.
        
        Args:
            agent_name: Name of agent to retrieve
            
        Returns:
            Agent instance or None if not found
        """
        return self.agents.get(agent_name)
    
    def list_agents(self) -> List[str]:
        """
        List all registered agent names.
        
        Returns:
            List of agent names
        """
        return list(self.agents.keys())
    
    def list_agents_detailed(self) -> List[Dict[str, Any]]:
        """
        Get detailed information about all agents.
        
        Returns:
            List of agent info dictionaries
        """
        return [
            {
                "name": name,
                "role": agent.role,
                "status": agent.status,
                "is_active": name in self.active_agents
            }
            for name, agent in self.agents.items()
        ]
    
    async def activate_agent(self, agent_name: str):
        """
        Activate an agent for current task.
        
        Args:
            agent_name: Name of agent to activate
            
        Raises:
            ValueError: If agent not found
        """
        agent = self.get_agent(agent_name)
        if not agent:
            raise ValueError(f"Agent '{agent_name}' not found in registry")
        
        agent.set_status("active")
        if agent_name not in self.active_agents:
            self.active_agents.append(agent_name)
    
    async def deactivate_agent(self, agent_name: str):
        """
        Deactivate an agent.
        
        Args:
            agent_name: Name of agent to deactivate
        """
        agent = self.get_agent(agent_name)
        if agent:
            agent.set_status("idle")
            if agent_name in self.active_agents:
                self.active_agents.remove(agent_name)
    
    async def activate_multiple(self, agent_names: List[str]):
        """
        Activate multiple agents.
        
        Args:
            agent_names: List of agent names to activate
        """
        for agent_name in agent_names:
            await self.activate_agent(agent_name)
    
    async def deactivate_all(self):
        """Deactivate all active agents"""
        active_copy = self.active_agents.copy()
        for agent_name in active_copy:
            await self.deactivate_agent(agent_name)
    
    def get_active_agents(self) -> List[str]:
        """
        Get list of active agent names.
        
        Returns:
            List of currently active agent names
        """
        return self.active_agents.copy()
    
    def is_active(self, agent_name: str) -> bool:
        """
        Check if an agent is active.
        
        Args:
            agent_name: Name of agent to check
            
        Returns:
            True if agent is active, False otherwise
        """
        return agent_name in self.active_agents
    
    async def get_agent_status(self, agent_name: str) -> Dict[str, Any]:
        """
        Get status report for a specific agent.
        
        Args:
            agent_name: Name of agent
            
        Returns:
            Status dictionary
        """
        agent = self.get_agent(agent_name)
        if not agent:
            return {"error": f"Agent '{agent_name}' not found"}
        
        return agent.get_status_report()
    
    async def get_all_status(self) -> Dict[str, Any]:
        """
        Get status report for all agents.
        
        Returns:
            Dictionary with all agent statuses
        """
        return {
            name: agent.get_status_report()
            for name, agent in self.agents.items()
        }
    
    def count_agents(self) -> int:
        """
        Get total count of registered agents.
        
        Returns:
            Number of registered agents
        """
        return len(self.agents)
    
    def count_active_agents(self) -> int:
        """
        Get count of active agents.
        
        Returns:
            Number of active agents
        """
        return len(self.active_agents)


# Global singleton registry instance
agent_registry = AgentRegistry()


__all__ = [
    "BaseAgent",
    "SupervisorAgent",
    "AgentRegistry",
    "agent_registry"
]
