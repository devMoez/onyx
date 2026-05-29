"""Phase 4 Integration Tests - Multi-Agent Coordination System"""

import asyncio
import pytest
from datetime import datetime

# Import Phase 4 components
from agents.programmer import ProgrammerAgent
from agents.specialized import ResearcherAgent, AnalyzerAgent, ExecutorAgent
from agents.swarm import AgentSwarm
from agents.learning import LearningSystem


class TestProgrammerAgent:
    """Test Programmer Agent"""
    
    def test_initialization(self):
        programmer = ProgrammerAgent()
        assert programmer.name == "ProgrammerAgent"
        assert programmer.status == "idle"
    
    @pytest.mark.asyncio
    async def test_full_workflow(self):
        programmer = ProgrammerAgent()
        task = {
            "type": "code_generation",
            "requirements": "Create a simple counter class",
            "language": "python"
        }
        result = await programmer.execute_task(task)
        assert result is not None


class TestSpecializedAgents:
    """Test Specialized Agents"""
    
    def test_researcher_init(self):
        researcher = ResearcherAgent()
        assert researcher.name == "ResearcherAgent"
    
    def test_analyzer_init(self):
        analyzer = AnalyzerAgent()
        assert analyzer.name == "AnalyzerAgent"
    
    def test_executor_init(self):
        executor = ExecutorAgent()
        assert executor.name == "ExecutorAgent"


class TestAgentSwarm:
    """Test Agent Swarm"""
    
    def test_initialization(self):
        swarm = AgentSwarm()
        assert isinstance(swarm.agents, dict)
        assert isinstance(swarm.agent_load, dict)
    
    def test_agent_registration(self):
        swarm = AgentSwarm()
        agent = ProgrammerAgent()
        swarm.register_agent(agent)
        assert agent.name in swarm.agents
    
    def test_swarm_status(self):
        swarm = AgentSwarm()
        swarm.register_agent(ProgrammerAgent())
        status = swarm.get_swarm_status()
        assert "total_agents" in status
        assert "active_agents" in status


class TestLearningSystem:
    """Test Learning System"""
    
    def test_initialization(self):
        learning = LearningSystem()
        assert isinstance(learning.failure_history, list)
    
    def test_failure_analysis(self):
        learning = LearningSystem()
        result = learning.analyze_failure(
            {"type": "api"},
            "ConnectionError"
        )
        assert result is not None
        assert len(learning.failure_history) > 0
    
    def test_success_recording(self):
        learning = LearningSystem()
        record = learning.record_success(
            {"type": "api"},
            {"ok": True},
            0.45
        )
        assert record is not None
    
    def test_improvement_report(self):
        learning = LearningSystem()
        learning.record_success({"type": "test"}, {"ok": True}, 0.1)
        learning.analyze_failure({"type": "test"}, "Error")
        report = learning.get_improvement_report()
        assert "metrics" in report


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
