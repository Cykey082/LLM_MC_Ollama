"""
Python Script Executor for LLM-MC
Allows LLM to write and execute Python code to perform complex actions
"""
import asyncio
import traceback
from typing import Dict, Any, Optional
from io import StringIO
import sys

from app.bot.client import bot_client


class BotAPI:
    """
    Safe Bot API wrapper for script execution
    Provides async methods that scripts can call
    """
    
    def __init__(self):
        self.results = []  # 存储执行过程中的结果
        self.logs = []     # 存储日志
    
    def log(self, message: str):
        """记录日志"""
        self.logs.append(str(message))
        print(f"[Script] {message}")
    
    async def chat(self, message: str) -> Dict[str, Any]:
        """发送聊天消息"""
        result = await bot_client.execute_action("chat", {"message": message})
        self.results.append({"action": "chat", "result": result})
        return result
    
    async def goTo(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """移动到指定坐标"""
        result = await bot_client.execute_action("goTo", {"x": x, "y": y, "z": z})
        self.results.append({"action": "goTo", "result": result})
        return result
    
    async def followPlayer(self, playerName: str) -> Dict[str, Any]:
        """跟随玩家"""
        result = await bot_client.execute_action("followPlayer", {"playerName": playerName})
        self.results.append({"action": "followPlayer", "result": result})
        return result
    
    async def stopMoving(self) -> Dict[str, Any]:
        """停止移动"""
        result = await bot_client.execute_action("stopMoving", {})
        self.results.append({"action": "stopMoving", "result": result})
        return result
    
    async def jump(self) -> Dict[str, Any]:
        """跳跃"""
        result = await bot_client.execute_action("jump", {})
        self.results.append({"action": "jump", "result": result})
        return result
    
    async def lookAt(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """看向坐标"""
        result = await bot_client.execute_action("lookAt", {"x": x, "y": y, "z": z})
        self.results.append({"action": "lookAt", "result": result})
        return result
    
    async def attack(self, entityType: str) -> Dict[str, Any]:
        """攻击实体"""
        result = await bot_client.execute_action("attack", {"entityType": entityType})
        self.results.append({"action": "attack", "result": result})
        return result
    
    async def collectBlock(self, blockType: str) -> Dict[str, Any]:
        """挖掘方块"""
        result = await bot_client.execute_action("collectBlock", {"blockType": blockType})
        self.results.append({"action": "collectBlock", "result": result})
        return result
    
    async def wait(self, seconds: float) -> Dict[str, Any]:
        """等待"""
        result = await bot_client.execute_action("wait", {"seconds": seconds})
        self.results.append({"action": "wait", "result": result})
        return result
    
    async def viewInventory(self) -> Dict[str, Any]:
        """查看背包"""
        result = await bot_client.execute_action("viewInventory", {})
        self.results.append({"action": "viewInventory", "result": result})
        return result
    
    async def equipItem(self, itemName: str) -> Dict[str, Any]:
        """装备物品"""
        result = await bot_client.execute_action("equipItem", {"itemName": itemName})
        self.results.append({"action": "equipItem", "result": result})
        return result
    
    async def placeBlock(self, blockName: str, x: int, y: int, z: int) -> Dict[str, Any]:
        """放置方块"""
        result = await bot_client.execute_action("placeBlock", {
            "blockName": blockName, "x": x, "y": y, "z": z
        })
        self.results.append({"action": "placeBlock", "result": result})
        return result
    
    async def dropItem(self, itemName: str, count: int = None) -> Dict[str, Any]:
        """丢弃物品"""
        params = {"itemName": itemName}
        if count is not None:
            params["count"] = count
        result = await bot_client.execute_action("dropItem", params)
        self.results.append({"action": "dropItem", "result": result})
        return result
    
    async def eat(self, foodName: str = None) -> Dict[str, Any]:
        """吃东西恢复饥饿值"""
        params = {}
        if foodName:
            params["foodName"] = foodName
        result = await bot_client.execute_action("eat", params)
        self.results.append({"action": "eat", "result": result})
        return result
    
    async def scanBlocks(self, blockTypes: list, range: int = 16) -> Dict[str, Any]:
        """扫描方块"""
        result = await bot_client.execute_action("scanBlocks", {
            "blockTypes": blockTypes, "range": range
        })
        self.results.append({"action": "scanBlocks", "result": result})
        return result
    
    async def findBlock(self, blockType: str, maxDistance: int = 32) -> Dict[str, Any]:
        """寻找方块"""
        result = await bot_client.execute_action("findBlock", {
            "blockType": blockType, "maxDistance": maxDistance
        })
        self.results.append({"action": "findBlock", "result": result})
        return result
    
    async def getBlockAt(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """获取方块信息"""
        result = await bot_client.execute_action("getBlockAt", {"x": x, "y": y, "z": z})
        self.results.append({"action": "getBlockAt", "result": result})
        return result
    
    async def scanEntities(self, range: int = 16, entityType: str = None) -> Dict[str, Any]:
        """扫描实体"""
        params = {"range": range}
        if entityType:
            params["entityType"] = entityType
        result = await bot_client.execute_action("scanEntities", params)
        self.results.append({"action": "scanEntities", "result": result})
        return result
    
    async def canReach(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """检查坐标是否可达（不实际移动）"""
        result = await bot_client.execute_action("canReach", {"x": x, "y": y, "z": z})
        self.results.append({"action": "canReach", "result": result})
        return result
    
    async def getPathTo(self, x: int, y: int, z: int) -> Dict[str, Any]:
        """获取到坐标的路径（不实际移动）"""
        result = await bot_client.execute_action("getPathTo", {"x": x, "y": y, "z": z})
        self.results.append({"action": "getPathTo", "result": result})
        return result
    
    async def getObservation(self) -> Dict[str, Any]:
        """获取当前观察状态"""
        return await bot_client.get_observation()
    
    async def getStatus(self) -> Dict[str, Any]:
        """获取Bot状态"""
        return await bot_client.get_status()
    
    async def getPosition(self) -> Dict[str, Any]:
        """获取当前位置"""
        observation = await bot_client.get_observation()
        return observation.get("position", {"x": 0, "y": 0, "z": 0})
    
    async def getHealth(self) -> Dict[str, Any]:
        """获取生命值和饥饿值"""
        observation = await bot_client.get_observation()
        return observation.get("health", {"health": 20, "food": 20})


class ScriptExecutor:
    """
    Safe Python script executor with timeout and restrictions
    """
    
    def __init__(self, timeout: float = 120.0):
        self.timeout = timeout
        self.allowed_modules = {
            'asyncio', 'math', 'random', 'json', 'time', 're'
        }
    
    async def execute(self, script: str, timeout: Optional[float] = None) -> Dict[str, Any]:
        """
        Execute Python script code
        
        The code should define an async function called 'main' that takes 'bot' as parameter:
        
        async def main(bot):
            result = await bot.findBlock('diamond_ore')
            if result['found']:
                await bot.goTo(result['x'], result['y'], result['z'])
            return "Done!"
        
        Args:
            script: The Python code to execute
            timeout: Execution timeout in seconds (uses default if not provided)
        """
        bot_api = BotAPI()
        effective_timeout = timeout if timeout is not None else self.timeout
        
        # 捕获stdout
        old_stdout = sys.stdout
        sys.stdout = mystdout = StringIO()
        
        try:
            # 创建安全的执行环境
            safe_globals = {
                '__builtins__': {
                    'print': print,
                    'len': len,
                    'range': range,
                    'str': str,
                    'int': int,
                    'float': float,
                    'bool': bool,
                    'list': list,
                    'dict': dict,
                    'tuple': tuple,
                    'set': set,
                    'abs': abs,
                    'min': min,
                    'max': max,
                    'sum': sum,
                    'round': round,
                    'sorted': sorted,
                    'enumerate': enumerate,
                    'zip': zip,
                    'map': map,
                    'filter': filter,
                    'isinstance': isinstance,
                    'True': True,
                    'False': False,
                    'None': None,
                },
                'asyncio': asyncio,
                'bot': bot_api,
            }
            
            safe_locals = {}
            
            # 编译并执行代码
            exec(compile(script, '<script>', 'exec'), safe_globals, safe_locals)
            
            # 检查是否定义了main函数
            if 'main' not in safe_locals:
                return {
                    "success": False,
                    "error": "Script must define an async function 'main(bot)'",
                    "logs": bot_api.logs
                }
            
            main_func = safe_locals['main']
            
            # 执行main函数，带超时
            import time
            start_time = time.time()
            try:
                result = await asyncio.wait_for(
                    main_func(bot_api),
                    timeout=effective_timeout
                )
            except asyncio.TimeoutError:
                return {
                    "success": False,
                    "error": f"Script execution timed out after {effective_timeout} seconds",
                    "logs": bot_api.logs,
                    "actions": bot_api.results
                }
            
            execution_time = time.time() - start_time
            
            # 获取stdout输出
            output = mystdout.getvalue()
            
            return {
                "success": True,
                "result": result,
                "output": output,
                "logs": bot_api.logs,
                "actions": bot_api.results,
                "action_count": len(bot_api.results),
                "execution_time": round(execution_time, 2)
            }
            
        except SyntaxError as e:
            return {
                "success": False,
                "error": f"Syntax error: {str(e)}",
                "logs": bot_api.logs
            }
        except Exception as e:
            return {
                "success": False,
                "error": f"Execution error: {str(e)}",
                "traceback": traceback.format_exc(),
                "logs": bot_api.logs,
                "actions": bot_api.results
            }
        finally:
            sys.stdout = old_stdout


# 全局执行器实例，默认超时5分钟
script_executor = ScriptExecutor(timeout=300.0)