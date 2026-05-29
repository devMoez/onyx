from typing import Dict, List, Any, Optional
from enum import Enum
from datetime import datetime
import re

class RiskLevel(Enum):
    """Risk levels for operations"""
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

class ExecutionMode(Enum):
    """Execution modes for ONYX"""
    AUTO = "auto"        # Execute automatically
    MANUAL = "manual"    # Require approval for risky operations

class SafetyManager:
    """Manages risk assessment and execution approval"""
    
    # Commands that are dangerous
    BLOCKED_COMMANDS = [
        "format",           # Disk formatting
        "del /f /q",        # Force delete all
        "rm -rf /",         # Linux equivalent
        "rd /s /q",         # Remove directory tree
        "diskpart",         # Disk partition tool
        "erase",            # Erase disk
        "dd if=/dev/zero",  # Zero out disk
        "mkfs",             # Make filesystem
        "fdisk",            # Partition disk
        "sudo rm -rf",      # Linux force remove
    ]
    
    # System-level risky operations
    RISKY_KEYWORDS = [
        "delete", "remove", "uninstall", "format", "erase",
        "restart", "shutdown", "reboot", "terminate",
        "admin", "sudo", "chmod", "chown",
        "system registry", "windows registry",
        "kernel", "driver", "boot"
    ]
    
    # Safe operations that don't need approval
    SAFE_KEYWORDS = [
        "read", "display", "show", "list", "print",
        "analyze", "research", "learn", "understand",
        "write file", "create file",
        "download", "fetch", "search"
    ]
    
    def __init__(self, default_mode: str = "auto"):
        self.mode = ExecutionMode.AUTO if default_mode == "auto" else ExecutionMode.MANUAL
        self.risk_history = []
        self.max_history = 100
        self.approval_callbacks = {}
    
    def set_mode(self, mode: str):
        """Set execution mode"""
        if mode == "auto":
            self.mode = ExecutionMode.AUTO
        elif mode == "manual":
            self.mode = ExecutionMode.MANUAL
    
    def get_mode(self) -> str:
        """Get current execution mode"""
        return self.mode.value
    
    def is_auto_mode(self) -> bool:
        """Check if in auto mode"""
        return self.mode == ExecutionMode.AUTO
    
    def assess_risk(self, command: str, context: Optional[Dict] = None) -> Dict[str, Any]:
        """Assess risk level of a command"""
        
        risk_level = RiskLevel.LOW
        reasons = []
        requires_approval = False
        
        # Check for blocked commands
        command_lower = command.lower()
        for blocked in self.BLOCKED_COMMANDS:
            if blocked in command_lower:
                risk_level = RiskLevel.CRITICAL
                reasons.append(f"Blocked command detected: {blocked}")
                requires_approval = True
                break
        
        # Check for risky keywords
        if risk_level != RiskLevel.CRITICAL:
            for keyword in self.RISKY_KEYWORDS:
                if keyword in command_lower:
                    # Check if it's overridden by safe keywords
                    is_safe = any(safe in command_lower for safe in self.SAFE_KEYWORDS)
                    if not is_safe:
                        risk_level = RiskLevel.HIGH
                        reasons.append(f"Risky keyword detected: {keyword}")
                        requires_approval = True
                        break
        
        # Check for safe keywords
        if risk_level == RiskLevel.LOW:
            for safe in self.SAFE_KEYWORDS:
                if safe in command_lower:
                    risk_level = RiskLevel.LOW
                    reasons.append(f"Safe operation: {safe}")
                    break
        
        # Assess based on file operations
        if "write" in command_lower or "create" in command_lower:
            if risk_level != RiskLevel.HIGH:
                risk_level = RiskLevel.MEDIUM
                reasons.append("File write operation")
        
        # Assess based on system operations
        if any(word in command_lower for word in ["system", "os.", "kernel", "process"]):
            if risk_level == RiskLevel.LOW:
                risk_level = RiskLevel.HIGH
            requires_approval = True
            reasons.append("System-level operation")
        
        assessment = {
            "command": command,
            "risk_level": risk_level.value,
            "requires_approval": requires_approval or risk_level in [RiskLevel.HIGH, RiskLevel.CRITICAL],
            "reasons": reasons,
            "timestamp": datetime.now().isoformat(),
            "context": context or {}
        }
        
        # Store in history
        self._add_to_history(assessment)
        
        return assessment
    
    def should_execute(self, risk_assessment: Dict[str, Any]) -> bool:
        """Determine if command should execute based on mode"""
        
        if self.mode == ExecutionMode.AUTO:
            # In auto mode, execute unless critical
            return risk_assessment.get("risk_level") != RiskLevel.CRITICAL.value
        
        else:  # MANUAL mode
            # In manual mode, always require approval for risky operations
            return not risk_assessment.get("requires_approval", False)
    
    def request_approval(self, risk_assessment: Dict[str, Any], 
                        callback: Optional[callable] = None) -> bool:
        """Request user approval for risky operation"""
        
        if not risk_assessment.get("requires_approval"):
            return True  # No approval needed
        
        assessment_id = f"approval_{len(self.approval_callbacks)}"
        self.approval_callbacks[assessment_id] = {
            "assessment": risk_assessment,
            "callback": callback,
            "requested_at": datetime.now().isoformat(),
            "approved": False,
            "approval_reason": None
        }
        
        # In real system, this would prompt user
        # For now, return pending
        return None  # Pending approval
    
    def approve_request(self, assessment_id: str, reason: str = "") -> bool:
        """Approve pending request"""
        if assessment_id in self.approval_callbacks:
            self.approval_callbacks[assessment_id]["approved"] = True
            self.approval_callbacks[assessment_id]["approval_reason"] = reason
            self.approval_callbacks[assessment_id]["approved_at"] = datetime.now().isoformat()
            return True
        return False
    
    def deny_request(self, assessment_id: str, reason: str = "") -> bool:
        """Deny pending request"""
        if assessment_id in self.approval_callbacks:
            self.approval_callbacks[assessment_id]["approved"] = False
            self.approval_callbacks[assessment_id]["denial_reason"] = reason
            return True
        return False
    
    def _add_to_history(self, assessment: Dict):
        """Add to risk history"""
        self.risk_history.append(assessment)
        if len(self.risk_history) > self.max_history:
            self.risk_history.pop(0)
    
    def get_risk_history(self, limit: int = 20) -> List[Dict]:
        """Get recent risk assessments"""
        return self.risk_history[-limit:]
    
    def get_risk_stats(self) -> Dict[str, Any]:
        """Get risk assessment statistics"""
        stats = {
            "total_assessments": len(self.risk_history),
            "by_risk_level": {},
            "current_mode": self.mode.value,
            "pending_approvals": len([v for v in self.approval_callbacks.values() 
                                     if v.get("approved") is False])
        }
        
        for risk in self.risk_history:
            level = risk.get("risk_level")
            if level not in stats["by_risk_level"]:
                stats["by_risk_level"][level] = 0
            stats["by_risk_level"][level] += 1
        
        return stats
    
    def clear_history(self):
        """Clear risk history"""
        self.risk_history = []
        self.approval_callbacks = {}


class RiskNotifier:
    """Sends notifications about risk assessment"""
    
    def __init__(self):
        self.notifications = []
        self.callbacks = []
    
    def add_callback(self, callback: callable):
        """Register notification callback"""
        self.callbacks.append(callback)
    
    def notify_high_risk(self, assessment: Dict[str, Any], message: str = ""):
        """Notify about high-risk operation"""
        notification = {
            "type": "high_risk",
            "assessment": assessment,
            "message": message or f"High-risk operation detected: {assessment.get('reasons', [])[-1]}",
            "timestamp": datetime.now().isoformat()
        }
        
        self._send_notification(notification)
    
    def notify_critical_risk(self, assessment: Dict[str, Any], message: str = ""):
        """Notify about critical risk"""
        notification = {
            "type": "critical",
            "assessment": assessment,
            "message": message or f"CRITICAL RISK: {assessment.get('command')}",
            "timestamp": datetime.now().isoformat()
        }
        
        self._send_notification(notification)
    
    def notify_approval_needed(self, assessment: Dict[str, Any]):
        """Notify that approval is needed"""
        notification = {
            "type": "approval_needed",
            "assessment": assessment,
            "message": "Approval required for operation",
            "timestamp": datetime.now().isoformat()
        }
        
        self._send_notification(notification)
    
    def _send_notification(self, notification: Dict):
        """Send notification to all callbacks"""
        self.notifications.append(notification)
        for callback in self.callbacks:
            try:
                callback(notification)
            except Exception as e:
                print(f"Notification callback error: {e}")
    
    def get_notifications(self) -> List[Dict]:
        """Get all notifications"""
        return self.notifications
    
    def clear_notifications(self):
        """Clear notifications"""
        self.notifications = []

# Global instances
safety_manager = SafetyManager(default_mode="auto")
risk_notifier = RiskNotifier()
