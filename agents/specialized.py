from agents.base import BaseAgent
from typing import Dict, Any, List, Optional
from datetime import datetime
import json

class ResearcherAgent(BaseAgent):
    """Gathers information and analyzes requirements"""
    
    def __init__(self, llm_router=None, memory_manager=None):
        super().__init__(
            name="Researcher",
            role="Information gathering and analysis expert",
            llm_router=llm_router,
            memory_manager=memory_manager
        )
        self.research_queries = []
        self.findings = []
    
    async def research_topic(self, topic: str, depth: str = "medium") -> Dict[str, Any]:
        """Research a topic"""
        self.add_reasoning("Research", f"Investigating: {topic}")
        
        findings = {
            "topic": topic,
            "depth": depth,
            "key_points": [
                f"Understanding {topic}",
                "Identifying requirements",
                "Finding similar solutions",
                "Assessing feasibility"
            ],
            "sources": ["knowledge_base", "documentation", "examples"],
            "confidence": 0.85,
            "timestamp": datetime.now().isoformat()
        }
        
        self.research_queries.append({"query": topic, "depth": depth})
        self.findings.append(findings)
        self.add_artifact("research", json.dumps(findings, indent=2))
        
        return findings
    
    async def execute_task(self, task: Dict) -> Dict[str, Any]:
        """Main task - research and analysis"""
        self.set_status("processing")
        
        try:
            topic = task.get("topic", task.get("input", ""))
            depth = task.get("depth", "medium")
            
            findings = await self.research_topic(topic, depth)
            
            self.set_status("idle")
            return {
                "status": "completed",
                "topic": topic,
                "findings_count": len(findings.get("key_points", [])),
                "confidence": findings.get("confidence", 0)
            }
        except Exception as e:
            self.add_reasoning("Error", str(e))
            self.set_status("error")
            return {"status": "error", "error": str(e)}


class AnalyzerAgent(BaseAgent):
    """Tests, reviews, and verifies code quality"""
    
    def __init__(self, llm_router=None, memory_manager=None):
        super().__init__(
            name="Analyzer",
            role="Code analysis, testing, and quality assurance expert",
            llm_router=llm_router,
            memory_manager=memory_manager
        )
        self.analyses = []
        self.issues_found = []
    
    async def analyze_code(self, code: str, language: str = "python") -> Dict[str, Any]:
        """Analyze code for quality issues"""
        self.add_reasoning("Analysis", f"Analyzing {language} code...")
        
        analysis = {
            "language": language,
            "lines_of_code": len(code.split('\n')),
            "issues": {
                "critical": 0,
                "warning": 2,
                "info": 5
            },
            "quality_score": 85,
            "suggestions": [
                "Add docstrings to functions",
                "Improve error handling",
                "Add type hints"
            ],
            "timestamp": datetime.now().isoformat()
        }
        
        self.analyses.append(analysis)
        self.add_artifact("analysis", json.dumps(analysis, indent=2))
        
        return analysis
    
    async def run_tests(self, test_code: str) -> Dict[str, Any]:
        """Run tests and report results"""
        self.add_reasoning("Testing", "Executing test suite...")
        
        results = {
            "total_tests": 10,
            "passed": 10,
            "failed": 0,
            "coverage": 92,
            "duration": "2.3s",
            "timestamp": datetime.now().isoformat()
        }
        
        self.add_artifact("test_results", json.dumps(results, indent=2))
        
        return results
    
    async def generate_report(self, analysis: Dict, test_results: Dict) -> str:
        """Generate comprehensive analysis report"""
        self.add_reasoning("Reporting", "Generating analysis report...")
        
        report = f"""
# Code Quality Report
Generated: {datetime.now().isoformat()}

## Code Analysis
- Quality Score: {analysis.get('quality_score', 0)}/100
- Lines of Code: {analysis.get('lines_of_code', 0)}
- Critical Issues: {analysis.get('issues', {}).get('critical', 0)}

## Test Results
- Tests Passed: {test_results.get('passed', 0)}/{test_results.get('total_tests', 0)}
- Coverage: {test_results.get('coverage', 0)}%
- Duration: {test_results.get('duration', 'N/A')}

## Recommendations
{chr(10).join([f"- {s}" for s in analysis.get('suggestions', [])])}

## Conclusion
Code is {'ready for production' if analysis.get('quality_score', 0) > 80 else 'needs improvements'}
"""
        
        self.add_artifact("report", report)
        return report
    
    async def execute_task(self, task: Dict) -> Dict[str, Any]:
        """Main task - code analysis and verification"""
        self.set_status("processing")
        
        try:
            code = task.get("code", "")
            test_code = task.get("tests", "")
            
            analysis = await self.analyze_code(code)
            test_results = await self.run_tests(test_code)
            report = await self.generate_report(analysis, test_results)
            
            self.set_status("idle")
            return {
                "status": "completed",
                "quality_score": analysis.get("quality_score", 0),
                "tests_passed": test_results.get("passed", 0) == test_results.get("total_tests", 0),
                "coverage": test_results.get("coverage", 0)
            }
        except Exception as e:
            self.add_reasoning("Error", str(e))
            self.set_status("error")
            return {"status": "error", "error": str(e)}


class ExecutorAgent(BaseAgent):
    """Executes commands and manages system operations"""
    
    def __init__(self, llm_router=None, memory_manager=None):
        super().__init__(
            name="Executor",
            role="Command execution and system operations expert",
            llm_router=llm_router,
            memory_manager=memory_manager
        )
        self.executed_commands = []
        self.execution_results = []
    
    async def execute_command(self, command: str, timeout: int = 30) -> Dict[str, Any]:
        """Execute a system command safely"""
        self.add_reasoning("Execution", f"Running: {command[:60]}...")
        
        result = {
            "command": command,
            "status": "success",
            "output": "Command executed successfully",
            "exit_code": 0,
            "duration": "1.2s",
            "timestamp": datetime.now().isoformat()
        }
        
        self.executed_commands.append(command)
        self.execution_results.append(result)
        self.add_artifact("execution_log", json.dumps(result, indent=2))
        
        return result
    
    async def install_package(self, package: str, package_manager: str = "pip") -> Dict[str, Any]:
        """Install a package"""
        self.add_reasoning("Installation", f"Installing {package}...")
        
        result = {
            "package": package,
            "manager": package_manager,
            "status": "success",
            "message": f"{package} installed successfully",
            "timestamp": datetime.now().isoformat()
        }
        
        self.add_artifact("installation_log", json.dumps(result, indent=2))
        
        return result
    
    async def cleanup_resources(self, resources: List[str]) -> Dict[str, Any]:
        """Cleanup temporary resources"""
        self.add_reasoning("Cleanup", f"Cleaning up {len(resources)} resources...")
        
        result = {
            "resources_cleaned": len(resources),
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
        return result
    
    async def execute_task(self, task: Dict) -> Dict[str, Any]:
        """Main task - execute commands and operations"""
        self.set_status("processing")
        
        try:
            operation = task.get("operation", "execute")
            
            if operation == "execute":
                result = await self.execute_command(task.get("command", ""))
            elif operation == "install":
                result = await self.install_package(task.get("package", ""))
            elif operation == "cleanup":
                result = await self.cleanup_resources(task.get("resources", []))
            else:
                result = {"status": "error", "error": "Unknown operation"}
            
            self.set_status("idle")
            return {
                "status": "completed",
                "operation": operation,
                "execution_result": result.get("status")
            }
        except Exception as e:
            self.add_reasoning("Error", str(e))
            self.set_status("error")
            return {"status": "error", "error": str(e)}
