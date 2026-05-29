"""
Self-learning and continuous improvement engine for intelligent agent systems.
Tracks failures, successes, patterns, and generates improvement rules.
"""

from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
from collections import defaultdict, Counter
import json
import re
from enum import Enum
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class TaskStatus(Enum):
    """Task execution status"""
    SUCCESS = "success"
    FAILURE = "failure"
    PARTIAL = "partial"
    TIMEOUT = "timeout"
    ERROR = "error"


class LearningRuleType(Enum):
    """Types of learning rules"""
    RETRY_LOGIC = "retry_logic"
    ERROR_HANDLING = "error_handling"
    OPTIMIZATION = "optimization"
    PREVENTION = "prevention"
    FALLBACK = "fallback"


class LearningSystem:
    """
    Self-learning and continuous improvement engine.
    
    Features:
    - Failure analysis and pattern recognition
    - Mistake prevention through learned rules
    - Performance tracking and metrics
    - Knowledge base updates
    - Configurable learning rules
    - Continuous improvement feedback loops
    """
    
    def __init__(self, enable_persistence: bool = True, max_history: int = 1000):
        """
        Initialize learning system.
        
        Args:
            enable_persistence: Whether to persist learning data
            max_history: Maximum number of historical records to keep
        """
        self.enable_persistence = enable_persistence
        self.max_history = max_history
        
        # History tracking
        self.failure_history: List[Dict[str, Any]] = []
        self.success_history: List[Dict[str, Any]] = []
        
        # Pattern recognition
        self.failure_patterns: Counter = Counter()
        self.success_patterns: Counter = Counter()
        self.error_signatures: Dict[str, List[str]] = defaultdict(list)
        self.task_type_patterns: Dict[str, Dict[str, int]] = defaultdict(lambda: {"success": 0, "failure": 0})
        
        # Rules and knowledge
        self.learned_rules: List[Dict[str, Any]] = []
        self.prevention_rules: List[Dict[str, Any]] = []
        self.configurable_rules: Dict[str, Dict[str, Any]] = {}
        
        # Performance metrics
        self.improvement_metrics: Dict[str, Any] = {
            "total_tasks": 0,
            "successful_tasks": 0,
            "failed_tasks": 0,
            "partial_tasks": 0,
            "timeout_tasks": 0,
            "avg_success_rate": 0.0,
            "avg_task_duration": 0.0,
            "total_duration": 0.0,
            "learning_improvements": 0,
            "mistakes_prevented": 0,
        }
        
        # Knowledge base
        self.knowledge_base: Dict[str, Any] = {
            "insights": {},
            "patterns": {},
            "recommendations": [],
            "updated_at": None
        }
        
        # Feedback loop tracking
        self.feedback_loops: List[Dict[str, Any]] = []
        
        # Statistics
        self.statistics: Dict[str, Any] = {
            "error_frequency": defaultdict(int),
            "error_recovery_rate": defaultdict(float),
            "task_success_by_type": defaultdict(float),
            "common_errors": [],
            "improvement_timeline": [],
        }
        
        logger.info("LearningSystem initialized with max_history=%d", max_history)
    
    def analyze_failure(
        self,
        task: Dict[str, Any],
        error: str,
        context: Optional[Dict[str, Any]] = None,
        error_code: Optional[str] = None,
        stacktrace: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Analyze task failure and extract patterns for learning.
        
        Args:
            task: Task information
            error: Error message
            context: Additional context about the failure
            error_code: Error code if available
            stacktrace: Full error stacktrace
        
        Returns:
            Failure record with analysis
        """
        try:
            context = context or {}
            
            # Extract error type and category
            error_type = self._extract_error_type(error)
            error_category = self._categorize_error(error)
            
            # Create failure record
            failure_record = {
                "id": f"failure_{len(self.failure_history)}",
                "task": task,
                "error": error,
                "error_type": error_type,
                "error_category": error_category,
                "error_code": error_code,
                "stacktrace": stacktrace,
                "context": context,
                "timestamp": datetime.now().isoformat(),
                "task_type": task.get("type", "unknown"),
                "analysis": {}
            }
            
            # Update pattern tracking
            self.failure_patterns[error_type] += 1
            self.statistics["error_frequency"][error_type] += 1
            
            # Track by task type
            task_type = task.get("type", "unknown")
            self.task_type_patterns[task_type]["failure"] += 1
            
            # Add to error signatures for clustering
            self.error_signatures[error_category].append(error)
            
            # Store in history with size limit
            self.failure_history.append(failure_record)
            if len(self.failure_history) > self.max_history:
                self.failure_history.pop(0)
            
            # Update metrics
            self.improvement_metrics["total_tasks"] += 1
            self.improvement_metrics["failed_tasks"] += 1
            
            # Generate analysis
            failure_record["analysis"] = self._analyze_failure_record(failure_record)
            
            # Check for similar past failures
            similar_failures = self._find_similar_failures(error_type, task_type)
            failure_record["similar_past_failures"] = len(similar_failures)
            
            logger.warning(
                f"Failure recorded: {error_type} for task type {task_type}. "
                f"Similar past failures: {len(similar_failures)}"
            )
            
            return failure_record
            
        except Exception as e:
            logger.error(f"Error in analyze_failure: {str(e)}", exc_info=True)
            return {"error": str(e), "status": "analysis_failed"}
    
    def record_success(
        self,
        task: Dict[str, Any],
        result: Any,
        duration: float,
        context: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Record successful task execution and extract success patterns.
        
        Args:
            task: Task information
            result: Task execution result
            duration: Task execution duration in seconds
            context: Additional context
        
        Returns:
            Success record
        """
        try:
            context = context or {}
            task_type = task.get("type", "unknown")
            
            # Create success record
            success_record = {
                "id": f"success_{len(self.success_history)}",
                "task": task,
                "result": result,
                "duration": duration,
                "task_type": task_type,
                "context": context,
                "timestamp": datetime.now().isoformat(),
            }
            
            # Update pattern tracking
            self.success_patterns[task_type] += 1
            self.task_type_patterns[task_type]["success"] += 1
            
            # Store in history
            self.success_history.append(success_record)
            if len(self.success_history) > self.max_history:
                self.success_history.pop(0)
            
            # Update metrics
            self.improvement_metrics["total_tasks"] += 1
            self.improvement_metrics["successful_tasks"] += 1
            self.improvement_metrics["total_duration"] += duration
            self._update_avg_duration()
            
            logger.info(f"Success recorded for task type {task_type} (duration: {duration:.2f}s)")
            
            return success_record
            
        except Exception as e:
            logger.error(f"Error in record_success: {str(e)}", exc_info=True)
            return {"error": str(e), "status": "record_failed"}
    
    def extract_patterns(self) -> Dict[str, Any]:
        """
        Extract recurring patterns from history.
        
        Returns:
            Dictionary containing pattern analysis
        """
        try:
            # Get top failure and success patterns
            top_failures = dict(self.failure_patterns.most_common(10))
            top_successes = dict(self.success_patterns.most_common(10))
            
            # Calculate success rates by task type
            task_type_success_rates = {}
            for task_type, counts in self.task_type_patterns.items():
                total = counts["success"] + counts["failure"]
                if total > 0:
                    task_type_success_rates[task_type] = counts["success"] / total
            
            # Identify error clusters
            error_clusters = self._cluster_errors()
            
            patterns = {
                "common_failures": top_failures,
                "common_successes": top_successes,
                "failure_count": len(self.failure_history),
                "success_count": len(self.success_history),
                "overall_success_rate": self._calculate_success_rate(),
                "task_type_success_rates": task_type_success_rates,
                "error_clusters": error_clusters,
                "analysis_timestamp": datetime.now().isoformat()
            }
            
            return patterns
            
        except Exception as e:
            logger.error(f"Error in extract_patterns: {str(e)}", exc_info=True)
            return {"error": str(e), "patterns": {}}
    
    def generate_improvement_rule(
        self,
        pattern: Dict[str, Any],
        rule_type: LearningRuleType = LearningRuleType.ERROR_HANDLING,
        priority: int = 5
    ) -> Dict[str, Any]:
        """
        Generate improvement rule from identified pattern.
        
        Args:
            pattern: Pattern information
            rule_type: Type of rule to generate
            priority: Rule priority (1-10, higher = more important)
        
        Returns:
            Generated rule
        """
        try:
            error_type = pattern.get("error_type", "unknown_error")
            
            # Generate rule based on type
            action = self._generate_rule_action(error_type, rule_type)
            condition = self._generate_rule_condition(error_type, pattern)
            
            rule = {
                "id": f"rule_{len(self.learned_rules)}_{datetime.now().timestamp()}",
                "description": f"Handle {error_type} error pattern",
                "error_type": error_type,
                "rule_type": rule_type.value,
                "condition": condition,
                "action": action,
                "priority": priority,
                "created_at": datetime.now().isoformat(),
                "effectiveness": 0.0,
                "applied_count": 0,
                "success_count": 0,
            }
            
            self.learned_rules.append(rule)
            self.improvement_metrics["learning_improvements"] += 1
            
            logger.info(f"Generated rule {rule['id']} for {error_type}")
            
            return rule
            
        except Exception as e:
            logger.error(f"Error in generate_improvement_rule: {str(e)}", exc_info=True)
            return {"error": str(e), "rule": None}
    
    def generate_prevention_rule(
        self,
        error_type: str,
        prevention_action: str,
        trigger_condition: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Generate rule to prevent known errors from occurring.
        
        Args:
            error_type: Type of error to prevent
            prevention_action: Action to prevent the error
            trigger_condition: Condition that triggers prevention
        
        Returns:
            Prevention rule
        """
        try:
            rule = {
                "id": f"prevention_{len(self.prevention_rules)}",
                "error_type": error_type,
                "prevention_action": prevention_action,
                "trigger_condition": trigger_condition or f"error_type == '{error_type}'",
                "created_at": datetime.now().isoformat(),
                "applied_count": 0,
                "prevented_count": 0,
            }
            
            self.prevention_rules.append(rule)
            logger.info(f"Generated prevention rule for {error_type}")
            
            return rule
            
        except Exception as e:
            logger.error(f"Error in generate_prevention_rule: {str(e)}", exc_info=True)
            return {"error": str(e), "rule": None}
    
    def apply_learned_rules(
        self,
        context: Dict[str, Any]
    ) -> Tuple[bool, Optional[Dict[str, Any]]]:
        """
        Check and apply learned rules to current context.
        
        Args:
            context: Current execution context
        
        Returns:
            Tuple of (rules_applied, applied_rule_info)
        """
        try:
            applied_rules = []
            
            for rule in self.learned_rules:
                # Check if rule applies
                if self._check_rule_condition(rule["condition"], context):
                    applied_rules.append(rule)
                    rule["applied_count"] += 1
            
            if applied_rules:
                logger.info(f"Applied {len(applied_rules)} learned rules")
                self.improvement_metrics["mistakes_prevented"] += 1
                
                # Track the most relevant rule
                most_relevant = max(applied_rules, key=lambda r: r["priority"])
                return True, most_relevant
            
            return False, None
            
        except Exception as e:
            logger.error(f"Error in apply_learned_rules: {str(e)}", exc_info=True)
            return False, None
    
    def update_knowledge_base(self, new_knowledge: Dict[str, Any]) -> Dict[str, Any]:
        """
        Update learning system knowledge base with new insights.
        
        Args:
            new_knowledge: New knowledge/insights to integrate
        
        Returns:
            Update status
        """
        try:
            # Merge new insights
            for key, value in new_knowledge.items():
                if key in self.knowledge_base["insights"]:
                    # Merge or update existing insight
                    if isinstance(value, dict):
                        self.knowledge_base["insights"][key].update(value)
                    else:
                        self.knowledge_base["insights"][key] = value
                else:
                    self.knowledge_base["insights"][key] = value
            
            # Update timestamp
            self.knowledge_base["updated_at"] = datetime.now().isoformat()
            
            logger.info(f"Knowledge base updated with {len(new_knowledge)} new insights")
            
            return {
                "status": "knowledge_updated",
                "insights_count": len(self.knowledge_base["insights"]),
                "updated_at": self.knowledge_base["updated_at"]
            }
            
        except Exception as e:
            logger.error(f"Error in update_knowledge_base: {str(e)}", exc_info=True)
            return {"error": str(e), "status": "update_failed"}
    
    def record_feedback_loop(
        self,
        feedback_type: str,
        feedback_data: Dict[str, Any],
        improvement_delta: float = 0.0
    ) -> Dict[str, Any]:
        """
        Record a feedback loop for continuous improvement.
        
        Args:
            feedback_type: Type of feedback
            feedback_data: Feedback data
            improvement_delta: Measured improvement (positive or negative)
        
        Returns:
            Feedback loop record
        """
        try:
            feedback_record = {
                "id": f"feedback_{len(self.feedback_loops)}",
                "type": feedback_type,
                "data": feedback_data,
                "improvement_delta": improvement_delta,
                "timestamp": datetime.now().isoformat(),
            }
            
            self.feedback_loops.append(feedback_record)
            
            # Update timeline
            self.statistics["improvement_timeline"].append({
                "timestamp": feedback_record["timestamp"],
                "delta": improvement_delta,
                "type": feedback_type
            })
            
            logger.info(f"Feedback loop recorded: {feedback_type} (delta: {improvement_delta:+.2f})")
            
            return feedback_record
            
        except Exception as e:
            logger.error(f"Error in record_feedback_loop: {str(e)}", exc_info=True)
            return {"error": str(e)}
    
    def get_improvement_report(self, detailed: bool = False) -> Dict[str, Any]:
        """
        Generate comprehensive improvement report.
        
        Args:
            detailed: Whether to include detailed analysis
        
        Returns:
            Improvement report
        """
        try:
            patterns = self.extract_patterns()
            self._update_metrics()
            
            report = {
                "generated_at": datetime.now().isoformat(),
                "metrics": self.improvement_metrics,
                "patterns": patterns,
                "learned_rules_count": len(self.learned_rules),
                "prevention_rules_count": len(self.prevention_rules),
                "recommendations": self._generate_recommendations(),
                "knowledge_base_size": len(self.knowledge_base["insights"]),
            }
            
            if detailed:
                report["detailed"] = {
                    "failure_history_sample": self.failure_history[-5:] if self.failure_history else [],
                    "success_history_sample": self.success_history[-5:] if self.success_history else [],
                    "learned_rules": self.learned_rules[-5:] if self.learned_rules else [],
                    "feedback_loops_recent": self.feedback_loops[-5:] if self.feedback_loops else [],
                    "statistics": dict(self.statistics),
                }
            
            logger.info("Improvement report generated")
            return report
            
        except Exception as e:
            logger.error(f"Error in get_improvement_report: {str(e)}", exc_info=True)
            return {"error": str(e), "report": {}}
    
    def get_learning_statistics(self) -> Dict[str, Any]:
        """
        Get detailed learning statistics.
        
        Returns:
            Learning statistics
        """
        try:
            stats = {
                "total_records": len(self.failure_history) + len(self.success_history),
                "failure_records": len(self.failure_history),
                "success_records": len(self.success_history),
                "rules_learned": len(self.learned_rules),
                "prevention_rules": len(self.prevention_rules),
                "error_types_seen": len(self.failure_patterns),
                "task_types_seen": len(self.task_type_patterns),
                "success_rate": self._calculate_success_rate(),
                "avg_task_duration": self.improvement_metrics["avg_task_duration"],
                "mistakes_prevented": self.improvement_metrics["mistakes_prevented"],
                "feedback_loops": len(self.feedback_loops),
                "improvement_timeline_points": len(self.statistics["improvement_timeline"]),
            }
            
            return stats
            
        except Exception as e:
            logger.error(f"Error in get_learning_statistics: {str(e)}", exc_info=True)
            return {"error": str(e)}
    
    # ==================== Private Methods ====================
    
    def _extract_error_type(self, error: str) -> str:
        """Extract error type from error message"""
        try:
            # Try to get error type before colon
            if ":" in error:
                return error.split(":")[0].strip()
            
            # Try to match common error patterns
            match = re.match(r"^(\w+Error|\w+Exception)", error)
            if match:
                return match.group(1)
            
            return "Unknown"
        except Exception:
            return "Unknown"
    
    def _categorize_error(self, error: str) -> str:
        """Categorize error into high-level categories"""
        error_lower = error.lower()
        
        if any(x in error_lower for x in ["timeout", "timed out", "hanging"]):
            return "timeout"
        elif any(x in error_lower for x in ["permission", "denied", "forbidden", "unauthorized"]):
            return "permission"
        elif any(x in error_lower for x in ["not found", "missing", "no such"]):
            return "not_found"
        elif any(x in error_lower for x in ["connection", "network", "refused"]):
            return "connection"
        elif any(x in error_lower for x in ["invalid", "malformed", "bad format"]):
            return "invalid_input"
        elif any(x in error_lower for x in ["out of memory", "memory", "heap"]):
            return "resource"
        else:
            return "other"
    
    def _analyze_failure_record(self, record: Dict[str, Any]) -> Dict[str, Any]:
        """Analyze a failure record for insights"""
        analysis = {
            "error_category": record.get("error_category", "unknown"),
            "task_type": record.get("task_type", "unknown"),
            "has_context": bool(record.get("context")),
            "has_stacktrace": bool(record.get("stacktrace")),
            "severity": self._calculate_error_severity(record["error"]),
        }
        
        return analysis
    
    def _calculate_error_severity(self, error: str) -> str:
        """Calculate error severity level"""
        if any(x in error.lower() for x in ["fatal", "critical", "panic"]):
            return "critical"
        elif any(x in error.lower() for x in ["error", "fail", "exception"]):
            return "high"
        elif any(x in error.lower() for x in ["warning", "deprecated"]):
            return "medium"
        else:
            return "low"
    
    def _find_similar_failures(self, error_type: str, task_type: str) -> List[Dict[str, Any]]:
        """Find similar past failures"""
        similar = [
            f for f in self.failure_history
            if f.get("error_type") == error_type and f.get("task_type") == task_type
        ]
        return similar[:-1]  # Exclude the current one
    
    def _cluster_errors(self) -> Dict[str, Any]:
        """Cluster similar errors"""
        clusters = defaultdict(list)
        
        for error_category, errors in self.error_signatures.items():
            clusters[error_category] = {
                "count": len(errors),
                "sample": errors[0] if errors else None
            }
        
        return dict(clusters)
    
    def _generate_rule_action(self, error_type: str, rule_type: LearningRuleType) -> str:
        """Generate appropriate action for rule"""
        actions = {
            LearningRuleType.RETRY_LOGIC: f"Retry with exponential backoff for {error_type}",
            LearningRuleType.ERROR_HANDLING: f"Apply specialized error handling for {error_type}",
            LearningRuleType.OPTIMIZATION: f"Optimize resource usage to prevent {error_type}",
            LearningRuleType.PREVENTION: f"Proactively prevent {error_type}",
            LearningRuleType.FALLBACK: f"Use fallback strategy on {error_type}",
        }
        
        return actions.get(rule_type, f"Handle {error_type}")
    
    def _generate_rule_condition(self, error_type: str, pattern: Dict[str, Any]) -> str:
        """Generate condition for rule"""
        return f"error_type == '{error_type}' OR error_contains('{error_type}')"
    
    def _check_rule_condition(self, condition: str, context: Dict[str, Any]) -> bool:
        """Check if rule condition applies to context"""
        try:
            # Simple evaluation (in production, use safer evaluation)
            error_type = context.get("error_type", "")
            return error_type in condition or "error_type" not in condition
        except Exception:
            return False
    
    def _calculate_success_rate(self) -> float:
        """Calculate overall task success rate"""
        total = self.improvement_metrics["total_tasks"]
        if total == 0:
            return 0.0
        return self.improvement_metrics["successful_tasks"] / total
    
    def _update_avg_duration(self):
        """Update average task duration"""
        successful = self.improvement_metrics["successful_tasks"]
        if successful > 0:
            total = self.improvement_metrics["total_duration"]
            self.improvement_metrics["avg_task_duration"] = total / successful
    
    def _update_metrics(self):
        """Update all metrics"""
        self.improvement_metrics["avg_success_rate"] = self._calculate_success_rate()
        self._update_avg_duration()
        
        # Update common errors
        if self.failure_patterns:
            self.statistics["common_errors"] = [
                {"error": e, "count": c} 
                for e, c in self.failure_patterns.most_common(5)
            ]
    
    def _generate_recommendations(self) -> List[str]:
        """Generate improvement recommendations"""
        recommendations = []
        
        try:
            success_rate = self._calculate_success_rate()
            
            if success_rate < 0.7:
                recommendations.append("⚠️  Success rate below 70% - Increase error handling coverage")
            elif success_rate < 0.85:
                recommendations.append("📈 Success rate improving - Continue monitoring high-failure areas")
            
            if len(self.failure_patterns) > 5:
                recommendations.append("🔍 Focus on the 5 most common failure patterns")
            
            if len(self.learned_rules) < len(self.failure_patterns):
                recommendations.append("📚 Generate more learned rules for recurring failures")
            
            if self.improvement_metrics["avg_task_duration"] > 10:
                recommendations.append("⚡ Average task duration is high - Consider optimization")
            
            if len(self.feedback_loops) == 0:
                recommendations.append("💬 Add feedback loops for continuous improvement")
            
            if not recommendations:
                recommendations.append("✅ System performing well - Continue current practices")
            
        except Exception as e:
            logger.error(f"Error generating recommendations: {str(e)}")
        
        return recommendations
    
    def clear_history(self, older_than_days: int = 30):
        """
        Clear old history records.
        
        Args:
            older_than_days: Remove records older than this many days
        """
        try:
            cutoff_time = (datetime.now() - timedelta(days=older_than_days)).isoformat()
            
            original_failures = len(self.failure_history)
            original_successes = len(self.success_history)
            
            self.failure_history = [f for f in self.failure_history if f["timestamp"] > cutoff_time]
            self.success_history = [s for s in self.success_history if s["timestamp"] > cutoff_time]
            
            removed_failures = original_failures - len(self.failure_history)
            removed_successes = original_successes - len(self.success_history)
            
            logger.info(
                f"Cleared old records: {removed_failures} failures, {removed_successes} successes"
            )
            
        except Exception as e:
            logger.error(f"Error clearing history: {str(e)}", exc_info=True)


# Global singleton instance
learning_system = LearningSystem()
