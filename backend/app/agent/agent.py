import asyncio
from typing import Optional, Dict, Any

from app.bot.client import bot_client
from app.llm.client import llm_client
from app.llm.prompts import get_agent_system_prompt, format_observation
from app.script.executor import script_executor
from app.config import settings


class Agent:
    """
    Main Agent class
    Coordinates perception, decision-making, and action execution
    """
    
    def __init__(self):
        self.is_running = False
        self.last_action: Optional[Dict[str, Any]] = None
        self.last_action_result: Optional[Dict[str, Any]] = None
        self._tick_task: Optional[asyncio.Task] = None
        self._pending_chat: list = []
    
    async def start(self):
        """Start the agent's decision loop"""
        if self.is_running:
            print("[Agent] Already running")
            return
        
        print("[Agent] Starting agent loop...")
        self.is_running = True
        
        # Register event handler for chat messages
        bot_client.add_event_handler(self._handle_bot_event)
        
        # Start tick loop
        self._tick_task = asyncio.create_task(self._tick_loop())
    
    async def stop(self):
        """Stop the agent's decision loop"""
        if not self.is_running:
            return
        
        print("[Agent] Stopping agent loop...")
        self.is_running = False
        
        if self._tick_task:
            self._tick_task.cancel()
            try:
                await self._tick_task
            except asyncio.CancelledError:
                pass
        
        bot_client.remove_event_handler(self._handle_bot_event)
    
    async def _tick_loop(self):
        """Main decision loop"""
        error_count = 0
        while self.is_running:
            try:
                await self.tick()
                error_count = 0  # 重置错误计数
            except Exception as e:
                error_count += 1
                if error_count <= 3:  # 只打印前3次错误
                    print(f"[Agent] 错误: {e}")
                elif error_count == 4:
                    print("[Agent] 后续相同错误将不再显示...")
            
            await asyncio.sleep(settings.agent_tick_rate)
    
    async def tick(self):
        """Single decision-action cycle"""
        if not self.is_running:
            return
        
        # 先检查Bot是否已连接
        try:
            status = await bot_client.get_status()
            if not status.get("connected"):
                return  # Bot未连接，静默跳过
        except Exception:
            return  # 无法获取状态，静默跳过
        
        try:
            # 1. Get observation from bot
            observation = await bot_client.get_observation()
            
            # Add any pending chat messages
            if self._pending_chat:
                if "chatMessages" not in observation:
                    observation["chatMessages"] = []
                observation["chatMessages"].extend(self._pending_chat)
                self._pending_chat = []
            
            # Check if there's anything interesting to respond to
            has_chat = bool(observation.get("chatMessages"))
            has_events = bool(observation.get("events"))
            
            # Skip if nothing interesting and we just waited
            if (not has_chat and not has_events and 
                self.last_action and self.last_action.get("action") == "wait"):
                return
            
            # 2. Format observation for LLM
            user_message = format_observation(observation)
            
            if self.last_action_result:
                user_message += f"\nLast action result: {self.last_action_result}"
            
            # 3. Get decision from LLM
            print("[Agent] Thinking...")
            
            system_prompt = get_agent_system_prompt({
                "position": observation.get("position"),
                "health": observation.get("health"),
                "time": observation.get("time")
            })
            
            response = await llm_client.chat_json(system_prompt, user_message)
            
            if settings.debug:
                print(f"[Agent] LLM Response: {response}")
            
            # 4. Execute action
            if response and response.get("action"):
                print(f"[Agent] Thought: {response.get('thought', 'N/A')}")
                print(f"[Agent] Action: {response['action']} {response.get('parameters', {})}")
                
                self.last_action = response
                
                # 特殊处理脚本执行动作
                if response["action"] == "executeScript":
                    self.last_action_result = await self._execute_script(
                        response.get("parameters", {})
                    )
                else:
                    self.last_action_result = await bot_client.execute_action(
                        response["action"],
                        response.get("parameters", {})
                    )
                
                print(f"[Agent] Result: {self.last_action_result.get('message', 'N/A')}")
            else:
                print("[Agent] No valid action in response")
                
        except Exception as e:
            print(f"[Agent] Error: {e}")
            self.last_action_result = {"success": False, "message": str(e)}
    
    async def force_tick(self):
        """Force an immediate decision cycle"""
        await self.tick()
    
    async def _execute_script(self, params: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a Python script for complex actions"""
        script = params.get("script", "")
        description = params.get("description", "Unnamed script")
        timeout = params.get("timeout", 300)  # 默认5分钟
        
        if not script:
            return {"success": False, "message": "No script provided"}
        
        print(f"[Agent] Executing script: {description}")
        
        try:
            result = await script_executor.execute(
                script=script,
                timeout=timeout
            )
            
            if result["success"]:
                # 构建有意义的结果摘要
                actions = result.get("actions", [])
                action_count = len(actions)
                script_result = result.get('result')
                
                # 构建动作摘要
                if actions:
                    # 获取每个动作的结果摘要
                    action_summaries = []
                    for action_info in actions[-5:]:  # 最多显示最后5个动作
                        action_name = action_info.get("action", "unknown")
                        action_result = action_info.get("result", {})
                        success = action_result.get("success", False)
                        msg = action_result.get("message", "")
                        status = "✓" if success else "✗"
                        action_summaries.append(f"{status}{action_name}: {msg[:50]}")
                    
                    actions_text = "; ".join(action_summaries)
                    if action_count > 5:
                        actions_text = f"...and {action_count - 5} more; " + actions_text
                else:
                    actions_text = "No actions executed"
                
                # 如果脚本有返回值，使用返回值；否则使用动作摘要
                if script_result is not None:
                    message = f"Script result: {script_result}"
                else:
                    message = f"Executed {action_count} actions: {actions_text}"
                
                return {
                    "success": True,
                    "message": message,
                    "logs": result.get("logs", []),
                    "actions": actions,
                    "action_count": action_count,
                    "execution_time": result.get("execution_time", 0)
                }
            else:
                error_msg = result.get('error', 'Unknown error')
                # 如果有traceback，打印到控制台方便调试
                if result.get('traceback'):
                    print(f"[Agent] Script traceback:\n{result['traceback']}")
                return {
                    "success": False,
                    "message": f"Script failed: {error_msg}",
                    "logs": result.get("logs", []),
                    "actions": result.get("actions", [])
                }
        except Exception as e:
            import traceback
            print(f"[Agent] Script execution error:\n{traceback.format_exc()}")
            return {"success": False, "message": f"Script execution error: {str(e)}"}
    
    async def _handle_bot_event(self, event: Dict[str, Any]):
        """Handle events from the bot WebSocket"""
        event_type = event.get("type")
        
        if event_type == "chat":
            # Store chat message for next tick
            self._pending_chat.append({
                "username": event.get("username"),
                "message": event.get("message")
            })
    
    def get_status(self) -> Dict[str, Any]:
        """Get agent status"""
        return {
            "is_running": self.is_running,
            "last_action": self.last_action,
            "last_action_result": self.last_action_result,
            "pending_chat_count": len(self._pending_chat)
        }


# Singleton instance
agent = Agent()