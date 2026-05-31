# core/skill_loader.py
import os
import glob
from typing import Dict, Any, Optional

class SkillLoader:
    """Fast, cached skill loader for ONYX agents."""
    
    _cache: Dict[str, str] = {}
    _skills_dir = "skills"

    @classmethod
    def get_skill(cls, skill_name: str) -> Optional[str]:
        """Load a skill definition, utilizing an in-memory cache for speed."""
        if skill_name in cls._cache:
            return cls._cache[skill_name]
        
        # Look for .skill file
        skill_file = os.path.join(cls._skills_dir, f"{skill_name}.skill")
        if os.path.exists(skill_file):
            with open(skill_file, "r", encoding="utf-8") as f:
                content = f.read()
                cls._cache[skill_name] = content
                return content
        
        # Look for SKILL.md in directory
        skill_dir = os.path.join(cls._skills_dir, skill_name)
        skill_md = os.path.join(skill_dir, "SKILL.md")
        if os.path.exists(skill_md):
            with open(skill_md, "r", encoding="utf-8") as f:
                content = f.read()
                cls._cache[skill_name] = content
                return content
                
        return None

    @classmethod
    def list_skills(cls) -> list:
        """List all available skills."""
        skills = set()
        # Find all .skill files and folders
        for item in os.listdir(cls._skills_dir):
            if item.endswith(".skill"):
                skills.add(item.replace(".skill", ""))
            
            # Check for plugin-style folders with SKILL.md
            full_path = os.path.join(cls._skills_dir, item)
            if os.path.isdir(full_path) and os.path.exists(os.path.join(full_path, "SKILL.md")):
                skills.add(item.replace(".skill", ""))
                
        return sorted(list(skills))
