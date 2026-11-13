import logging
from fastapi import Depends, HTTPException, status
from .auth import get_current_user
from .routers.auth import normalize_life_stage, LIFE_STAGE_MODULE_MAP

logger = logging.getLogger(__name__)

def get_allowed_modules(user) -> list:
    normalized = normalize_life_stage(user.life_stage)
    meta = LIFE_STAGE_MODULE_MAP.get(normalized, LIFE_STAGE_MODULE_MAP["other"])
    return meta.get("allowed_modules", [])

def verify_module_access(module_name: str):
    async def dependency(current_user = Depends(get_current_user)):
        allowed = get_allowed_modules(current_user)
        if module_name not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access to module '{module_name}' is denied for your life stage."
            )
    return dependency

def verify_any_module(module_names: list):
    async def dependency(current_user = Depends(get_current_user)):
        allowed = get_allowed_modules(current_user)
        if not any(m in allowed for m in module_names):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access to required modules {module_names} is denied for your life stage."
            )
    return dependency
