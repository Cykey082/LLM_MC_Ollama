from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, Dict, Any, List

from app.agent.agent import agent
from app.bot.client import bot_client
from app.script.executor import script_executor


router = APIRouter()


class ActionRequest(BaseModel):
    """Request model for executing an action"""
    action: str
    parameters: Optional[Dict[str, Any]] = None


class ActionResponse(BaseModel):
    """Response model for action execution"""
    success: bool
    message: str


# ========== Agent Endpoints ==========

@router.get("/agent/status")
async def get_agent_status():
    """Get current agent status"""
    return agent.get_status()


@router.post("/agent/start")
async def start_agent():
    """Start the agent decision loop"""
    await agent.start()
    return {"status": "started"}


@router.post("/agent/stop")
async def stop_agent():
    """Stop the agent decision loop"""
    await agent.stop()
    return {"status": "stopped"}


@router.post("/agent/tick")
async def force_tick():
    """Force an immediate agent decision cycle"""
    await agent.force_tick()
    return {"status": "tick completed"}


# ========== Bot Endpoints (Proxy to Node.js service) ==========

@router.get("/bot/status")
async def get_bot_status():
    """Get bot connection status"""
    try:
        return await bot_client.get_status()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Bot service error: {str(e)}")


@router.get("/bot/observation")
async def get_bot_observation():
    """Get current game observation"""
    try:
        return await bot_client.get_observation()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Bot service error: {str(e)}")


@router.post("/bot/connect")
async def connect_bot():
    """Connect bot to Minecraft server"""
    try:
        return await bot_client.connect()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Bot service error: {str(e)}")


@router.post("/bot/disconnect")
async def disconnect_bot():
    """Disconnect bot from Minecraft server"""
    try:
        return await bot_client.disconnect()
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Bot service error: {str(e)}")


@router.post("/bot/action", response_model=ActionResponse)
async def execute_bot_action(request: ActionRequest):
    """Execute an action on the bot"""
    try:
        result = await bot_client.execute_action(
            request.action,
            request.parameters
        )
        return ActionResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=503, detail=f"Bot service error: {str(e)}")


# ========== Script Execution Endpoints ==========

class ScriptRequest(BaseModel):
    """Request model for script execution"""
    code: str
    timeout: Optional[float] = 120.0


class ScriptResponse(BaseModel):
    """Response model for script execution"""
    success: bool
    result: Optional[Any] = None
    error: Optional[str] = None
    output: Optional[str] = None
    logs: Optional[List[str]] = None
    actions: Optional[List[Dict[str, Any]]] = None
    action_count: Optional[int] = None


@router.post("/script/execute")
async def execute_script(request: ScriptRequest):
    """
    Execute a Python script to perform complex bot actions.
    
    The script should define an async function 'main(bot)' that will be executed.
    
    Example script:
    ```python
    async def main(bot):
        # 寻找钻石矿
        result = await bot.findBlock('diamond_ore', 32)
        if result.get('found'):
            block = result['block']
            bot.log(f"找到钻石矿在 ({block['x']}, {block['y']}, {block['z']})")
            # 移动过去
            await bot.goTo(block['x'], block['y'], block['z'])
            # 装备镐子
            await bot.equipItem('diamond_pickaxe')
            # 挖掘
            await bot.collectBlock('diamond_ore')
            return "成功挖到钻石！"
        else:
            return "附近没有钻石矿"
    ```
    
    Available bot methods:
    - bot.chat(message)
    - bot.goTo(x, y, z)
    - bot.followPlayer(playerName)
    - bot.stopMoving()
    - bot.jump()
    - bot.lookAt(x, y, z)
    - bot.attack(entityType)
    - bot.collectBlock(blockType)
    - bot.wait(seconds)
    - bot.viewInventory()
    - bot.equipItem(itemName)
    - bot.placeBlock(blockName, x, y, z)
    - bot.scanBlocks(blockTypes, range)
    - bot.findBlock(blockType, maxDistance)
    - bot.getBlockAt(x, y, z)
    - bot.scanEntities(range, entityType)
    - bot.getObservation()
    - bot.getStatus()
    - bot.getPosition()
    - bot.getHealth()
    - bot.log(message)
    """
    try:
        result = await script_executor.execute(
            script=request.code,
            timeout=request.timeout
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Script execution error: {str(e)}")